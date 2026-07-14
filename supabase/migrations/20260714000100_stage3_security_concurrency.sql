-- Pülümür Automation Studio V10.2 — Aşama 3
-- Merkezi limitler, optimistic locking, immutable revizyon geçmişi,
-- firma izolasyonu, backend payload doğrulaması ve PIN rate limiting.

begin;

alter table public.projects
  add column if not exists server_version bigint not null default 1;

alter table public.profiles
  add column if not exists session_revoked_at timestamptz;

create or replace function public.current_session_is_valid_v2()
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_revoked_at timestamptz;
  v_issued_at timestamptz;
begin
  if auth.uid() is null then return false; end if;

  select p.session_revoked_at
  into v_revoked_at
  from public.profiles p
  where p.id = auth.uid()
    and p.is_active = true;

  if not found then return false; end if;
  if v_revoked_at is null then return true; end if;

  begin
    v_issued_at := to_timestamp((auth.jwt() ->> 'iat')::double precision);
  exception when others then
    return false;
  end;
  -- JWT iat has second precision while timestamptz has sub-second precision.
  return v_issued_at >= date_trunc('second', v_revoked_at);
end;
$$;

create or replace function public.assert_current_session_v2()
returns public.profiles
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_profile public.profiles%rowtype;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
  if not public.current_session_is_valid_v2() then raise exception 'SESSION_REVOKED'; end if;

  select * into v_profile
  from public.profiles
  where id = auth.uid()
    and is_active = true;

  if not found then raise exception 'PROFILE_NOT_FOUND'; end if;
  return v_profile;
end;
$$;

-- Direct SELECT policies also reject access tokens issued before a PIN reset.
drop policy if exists profiles_select_self_or_company_admin on public.profiles;
create policy profiles_select_self_or_company_admin_v2
on public.profiles for select to authenticated
using (
  public.current_session_is_valid_v2()
  and (
    id = auth.uid()
    or (
      organization_id = public.current_organization_id()
      and public.current_user_role() in ('system_admin', 'company_admin')
    )
  )
);

drop policy if exists organizations_select_own on public.organizations;
create policy organizations_select_own_v2
on public.organizations for select to authenticated
using (
  public.current_session_is_valid_v2()
  and id = public.current_organization_id()
);

drop policy if exists projects_select_own_org on public.projects;
create policy projects_select_own_org_v2
on public.projects for select to authenticated
using (
  public.current_session_is_valid_v2()
  and organization_id = public.current_organization_id()
);

drop policy if exists revisions_select_own_org on public.project_revisions;
create policy revisions_select_own_org_v2
on public.project_revisions for select to authenticated
using (
  public.current_session_is_valid_v2()
  and exists (
    select 1 from public.projects p
    where p.id = project_revisions.project_id
      and p.organization_id = public.current_organization_id()
  )
);

-- ---------------------------------------------------------------------------
-- Central application limits
-- ---------------------------------------------------------------------------

create table if not exists public.app_limit_defaults (
  limit_key text primary key,
  limit_value integer not null,
  factory_value integer not null,
  minimum_value integer not null,
  hard_cap integer not null,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  constraint app_limit_defaults_key_format check (limit_key ~ '^[A-Za-z][A-Za-z0-9]{2,63}$'),
  constraint app_limit_defaults_range check (
    minimum_value >= 0
    and minimum_value <= factory_value and factory_value <= hard_cap
    and minimum_value <= limit_value and limit_value <= hard_cap
  )
);

create table if not exists public.company_limit_overrides (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  limit_key text not null references public.app_limit_defaults(limit_key) on delete cascade,
  limit_value integer not null,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  primary key (organization_id, limit_key)
);

create table if not exists public.app_limit_audit_log (
  id bigint generated always as identity primary key,
  organization_id uuid references public.organizations(id) on delete set null,
  limit_key text not null,
  old_value integer,
  new_value integer,
  action text not null check (action in ('set_global', 'set_company', 'reset_global', 'reset_company')),
  changed_by uuid references auth.users(id) on delete set null,
  changed_at timestamptz not null default now()
);

alter table public.app_limit_defaults enable row level security;
alter table public.company_limit_overrides enable row level security;
alter table public.app_limit_audit_log enable row level security;
revoke all on public.app_limit_defaults from anon, authenticated;
revoke all on public.company_limit_overrides from anon, authenticated;
revoke all on public.app_limit_audit_log from anon, authenticated;

insert into public.app_limit_defaults (limit_key, limit_value, factory_value, minimum_value, hard_cap)
values
  ('maxSystems', 30, 30, 1, 50),
  ('maxRaysPerSystem', 4, 4, 1, 8),
  ('maxFrontPosts', 150, 150, 2, 300),
  ('maxSideSupportsPerView', 8, 8, 0, 20),
  ('maxProducts', 200, 200, 0, 500),
  ('maxSegmentsPerView', 50, 50, 1, 100),
  ('historySteps', 20, 20, 1, 100),
  ('maxProjectFileMb', 10, 10, 1, 25)
on conflict (limit_key) do nothing;

create or replace function public.effective_limit_value_v1(p_organization_id uuid, p_limit_key text)
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(o.limit_value, d.limit_value)
  from public.app_limit_defaults d
  left join public.company_limit_overrides o
    on o.organization_id = p_organization_id
   and o.limit_key = d.limit_key
  where d.limit_key = p_limit_key
$$;

create or replace function public.get_effective_app_limits_v1()
returns table(
  limit_key text,
  limit_value integer,
  source text,
  minimum_value integer,
  hard_cap integer,
  updated_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_profile public.profiles%rowtype;
begin
  v_profile := public.assert_current_session_v2();
  return query
  select d.limit_key,
         coalesce(o.limit_value, d.limit_value),
         case when o.limit_value is null then 'global'::text else 'company'::text end,
         d.minimum_value,
         d.hard_cap,
         coalesce(o.updated_at, d.updated_at)
  from public.app_limit_defaults d
  left join public.company_limit_overrides o
    on o.organization_id = v_profile.organization_id
   and o.limit_key = d.limit_key
  order by d.limit_key;
end;
$$;

create or replace function public.admin_list_app_limits_v1(p_organization_id uuid default null)
returns table(
  limit_key text,
  limit_value integer,
  global_value integer,
  minimum_value integer,
  hard_cap integer,
  source text,
  updated_at timestamptz,
  updated_by uuid,
  updated_by_name text
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_profile public.profiles%rowtype;
begin
  v_profile := public.assert_current_session_v2();
  if v_profile.role <> 'system_admin' then raise exception 'SYSTEM_ADMIN_REQUIRED'; end if;

  return query
  select d.limit_key,
         case when p_organization_id is null then d.limit_value else coalesce(o.limit_value, d.limit_value) end,
         d.limit_value,
         d.minimum_value,
         d.hard_cap,
         case
           when p_organization_id is null then 'global'::text
           when o.limit_value is null then 'global'::text
           else 'company'::text
         end,
         case when p_organization_id is null then d.updated_at else coalesce(o.updated_at, d.updated_at) end,
         case when p_organization_id is null then d.updated_by else coalesce(o.updated_by, d.updated_by) end,
         coalesce(actor.full_name, actor.username)
  from public.app_limit_defaults d
  left join public.company_limit_overrides o
    on p_organization_id is not null
   and o.organization_id = p_organization_id
   and o.limit_key = d.limit_key
  left join public.profiles actor
    on actor.id = case when p_organization_id is null then d.updated_by else coalesce(o.updated_by, d.updated_by) end
  order by d.limit_key;
end;
$$;

create or replace function public.admin_set_app_limit_v1(
  p_limit_key text,
  p_limit_value integer,
  p_organization_id uuid default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile public.profiles%rowtype;
  v_default public.app_limit_defaults%rowtype;
  v_old integer;
begin
  v_profile := public.assert_current_session_v2();
  if v_profile.role <> 'system_admin' then raise exception 'SYSTEM_ADMIN_REQUIRED'; end if;

  select * into v_default from public.app_limit_defaults where limit_key = p_limit_key for update;
  if not found then raise exception 'LIMIT_KEY_INVALID'; end if;
  if p_limit_value < v_default.minimum_value or p_limit_value > v_default.hard_cap then
    raise exception 'LIMIT_VALUE_OUT_OF_RANGE';
  end if;

  if p_organization_id is null then
    v_old := v_default.limit_value;
    update public.app_limit_defaults
    set limit_value = p_limit_value, updated_by = auth.uid(), updated_at = now()
    where limit_key = p_limit_key;
    insert into public.app_limit_audit_log
      (organization_id, limit_key, old_value, new_value, action, changed_by)
    values (null, p_limit_key, v_old, p_limit_value, 'set_global', auth.uid());
  else
    if not exists (select 1 from public.organizations where id = p_organization_id) then
      raise exception 'ORGANIZATION_NOT_FOUND';
    end if;
    select limit_value into v_old
    from public.company_limit_overrides
    where organization_id = p_organization_id and limit_key = p_limit_key;
    v_old := coalesce(v_old, v_default.limit_value);
    insert into public.company_limit_overrides
      (organization_id, limit_key, limit_value, updated_by, updated_at)
    values (p_organization_id, p_limit_key, p_limit_value, auth.uid(), now())
    on conflict (organization_id, limit_key) do update
      set limit_value = excluded.limit_value,
          updated_by = excluded.updated_by,
          updated_at = excluded.updated_at;
    insert into public.app_limit_audit_log
      (organization_id, limit_key, old_value, new_value, action, changed_by)
    values (p_organization_id, p_limit_key, v_old, p_limit_value, 'set_company', auth.uid());
  end if;
end;
$$;

create or replace function public.admin_reset_app_limits_v1(p_organization_id uuid default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile public.profiles%rowtype;
  v_row record;
begin
  v_profile := public.assert_current_session_v2();
  if v_profile.role <> 'system_admin' then raise exception 'SYSTEM_ADMIN_REQUIRED'; end if;

  if p_organization_id is null then
    for v_row in select limit_key, limit_value, factory_value from public.app_limit_defaults for update
    loop
      insert into public.app_limit_audit_log
        (organization_id, limit_key, old_value, new_value, action, changed_by)
      values (null, v_row.limit_key, v_row.limit_value, v_row.factory_value, 'reset_global', auth.uid());
    end loop;
    update public.app_limit_defaults
    set limit_value = factory_value, updated_by = auth.uid(), updated_at = now();
    return;
  end if;

  for v_row in
    select o.limit_key, o.limit_value, d.limit_value as default_value
    from public.company_limit_overrides o
    join public.app_limit_defaults d using (limit_key)
    where o.organization_id = p_organization_id
  loop
    insert into public.app_limit_audit_log
      (organization_id, limit_key, old_value, new_value, action, changed_by)
    values (p_organization_id, v_row.limit_key, v_row.limit_value, v_row.default_value, 'reset_company', auth.uid());
  end loop;

  delete from public.company_limit_overrides where organization_id = p_organization_id;
end;
$$;

create or replace function public.admin_list_app_limit_audit_v1(
  p_organization_id uuid default null,
  p_limit integer default 200
)
returns table(
  id bigint,
  organization_id uuid,
  organization_name text,
  limit_key text,
  old_value integer,
  new_value integer,
  action text,
  changed_by uuid,
  changed_by_name text,
  changed_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_profile public.profiles%rowtype;
begin
  v_profile := public.assert_current_session_v2();
  if v_profile.role <> 'system_admin' then raise exception 'SYSTEM_ADMIN_REQUIRED'; end if;

  return query
  select a.id, a.organization_id, o.name, a.limit_key, a.old_value, a.new_value,
         a.action, a.changed_by, coalesce(p.full_name, p.username), a.changed_at
  from public.app_limit_audit_log a
  left join public.organizations o on o.id = a.organization_id
  left join public.profiles p on p.id = a.changed_by
  where p_organization_id is null or a.organization_id = p_organization_id
  order by a.changed_at desc
  limit least(greatest(coalesce(p_limit, 200), 1), 1000);
end;
$$;

-- ---------------------------------------------------------------------------
-- Backend project validation and optimistic locking
-- ---------------------------------------------------------------------------

create or replace function public.jsonb_array_size_v1(p_value jsonb)
returns integer
language sql
immutable
set search_path = ''
as $$
  select case when jsonb_typeof(p_value) = 'array' then jsonb_array_length(p_value) else 0 end
$$;

create or replace function public.validate_project_payload_v2(
  p_project_data jsonb,
  p_schema_version integer,
  p_organization_id uuid
)
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_model jsonb;
  v_positions jsonb;
  v_position jsonb;
  v_scope jsonb;
  v_middle jsonb;
  v_token text;
  v_limit integer;
  v_count integer;
  v_products integer := 0;
begin
  if p_project_data is null or jsonb_typeof(p_project_data) <> 'object' then
    raise exception 'PROJECT_JSON_INVALID';
  end if;
  if p_schema_version <> 2 or coalesce((p_project_data ->> 'schemaVersion')::integer, 0) <> 2 then
    raise exception 'PROJECT_SCHEMA_UNSUPPORTED';
  end if;
  v_model := p_project_data -> 'projectModel';
  if jsonb_typeof(v_model) <> 'object' then raise exception 'PROJECT_MODEL_MISSING'; end if;

  v_limit := public.effective_limit_value_v1(p_organization_id, 'maxProjectFileMb');
  if octet_length(p_project_data::text) > v_limit * 1024 * 1024 then
    raise exception 'PROJECT_SIZE_LIMIT';
  end if;

  v_positions := v_model -> 'positions';
  if jsonb_typeof(v_positions) <> 'array' then raise exception 'PROJECT_POSITIONS_INVALID'; end if;
  v_limit := public.effective_limit_value_v1(p_organization_id, 'maxSystems');
  if jsonb_array_length(v_positions) < 1 or jsonb_array_length(v_positions) > v_limit then
    raise exception 'PROJECT_POSITION_LIMIT';
  end if;
  begin
    v_count := (v_model #>> '{topology,systemCount}')::integer;
  exception when others then
    raise exception 'PROJECT_SYSTEM_COUNT_INVALID';
  end;
  if v_count < 1 or v_count > v_limit or v_count <> jsonb_array_length(v_positions) then
    raise exception 'PROJECT_SYSTEM_COUNT_INVALID';
  end if;

  v_limit := public.effective_limit_value_v1(p_organization_id, 'maxRaysPerSystem');
  for v_position in select value from jsonb_array_elements(v_positions)
  loop
    if jsonb_typeof(v_position) <> 'object'
       or coalesce((v_position ->> 'rayCount')::integer, 0) not between 1 and v_limit then
      raise exception 'PROJECT_RAY_LIMIT';
    end if;
  end loop;
  for v_token in
    select btrim(value) from unnest(string_to_array(coalesce(v_model #>> '{topology,raw,rayCount}', ''), ';')) value
  loop
    if v_token <> '' and (
      v_token !~ '^[0-9]+([.,]0+)?$'
      or replace(v_token, ',', '.')::numeric < 1
      or replace(v_token, ',', '.')::numeric > v_limit
    ) then raise exception 'PROJECT_RAY_LIMIT'; end if;
  end loop;

  v_limit := public.effective_limit_value_v1(p_organization_id, 'maxFrontPosts');
  v_count := greatest(
    public.jsonb_array_size_v1(v_model #> '{frontView,postProfiles}'),
    public.jsonb_array_size_v1(v_model #> '{frontView,postExtensions}'),
    public.jsonb_array_size_v1(v_model #> '{frontView,postCenters}')
  );
  if v_count > v_limit then raise exception 'PROJECT_FRONT_POST_LIMIT'; end if;
  for v_token in
    select btrim(value) from unnest(string_to_array(coalesce(v_model #>> '{topology,raw,postCount}', ''), ';')) value
  loop
    if v_token <> '' and (
      v_token !~ '^[0-9]+([.,]0+)?$'
      or replace(v_token, ',', '.')::numeric < 0
      or replace(v_token, ',', '.')::numeric > v_limit
    ) then raise exception 'PROJECT_FRONT_POST_LIMIT'; end if;
  end loop;

  v_limit := public.effective_limit_value_v1(p_organization_id, 'maxSegmentsPerView');
  if public.jsonb_array_size_v1(v_model #> '{frontView,parapetSegments}') > v_limit then
    raise exception 'PROJECT_SEGMENT_LIMIT';
  end if;

  v_products := public.jsonb_array_size_v1(v_model #> '{products,front,sliding}')
              + public.jsonb_array_size_v1(v_model #> '{products,front,guillotine}');

  for v_scope in
    select value from jsonb_each(coalesce(v_model #> '{sideViews}', '{}'::jsonb))
    where key in ('left', 'right')
  loop
    if public.jsonb_array_size_v1(v_scope -> 'supportPosts') > public.effective_limit_value_v1(p_organization_id, 'maxSideSupportsPerView') then
      raise exception 'PROJECT_SIDE_SUPPORT_LIMIT';
    end if;
    if greatest(
      public.jsonb_array_size_v1(v_scope -> 'parapetSegments'),
      public.jsonb_array_size_v1(v_scope #> '{backWall,segments}')
    ) > v_limit then raise exception 'PROJECT_SEGMENT_LIMIT'; end if;
    v_products := v_products
      + public.jsonb_array_size_v1(v_scope #> '{products,sliding}')
      + public.jsonb_array_size_v1(v_scope #> '{products,guillotine}');
  end loop;

  v_middle := coalesce(v_model #> '{sideViews,middle}', '{}'::jsonb);
  for v_scope in select value from jsonb_each(v_middle)
  loop
    if public.jsonb_array_size_v1(v_scope -> 'supportPosts') > public.effective_limit_value_v1(p_organization_id, 'maxSideSupportsPerView') then
      raise exception 'PROJECT_SIDE_SUPPORT_LIMIT';
    end if;
    if greatest(
      public.jsonb_array_size_v1(v_scope -> 'parapetSegments'),
      public.jsonb_array_size_v1(v_scope #> '{backWall,segments}')
    ) > v_limit then raise exception 'PROJECT_SEGMENT_LIMIT'; end if;
    v_products := v_products
      + public.jsonb_array_size_v1(v_scope #> '{products,sliding}')
      + public.jsonb_array_size_v1(v_scope #> '{products,guillotine}');
  end loop;

  if v_products > public.effective_limit_value_v1(p_organization_id, 'maxProducts') then
    raise exception 'PROJECT_PRODUCT_LIMIT';
  end if;
end;
$$;

create or replace function public.protect_historical_revision_v2()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_current integer;
begin
  select current_revision into v_current from public.projects where id = old.project_id;
  if old.revision_no <> v_current then raise exception 'HISTORICAL_REVISION_IMMUTABLE'; end if;
  if new.project_id <> old.project_id or new.revision_no <> old.revision_no then
    raise exception 'REVISION_IDENTITY_IMMUTABLE';
  end if;
  return new;
end;
$$;

drop trigger if exists protect_historical_revision_v2 on public.project_revisions;
create trigger protect_historical_revision_v2
before update on public.project_revisions
for each row execute function public.protect_historical_revision_v2();

create or replace function public.create_project_v2(
  p_project_name text,
  p_customer_name text,
  p_product_type text,
  p_project_data jsonb,
  p_app_version text,
  p_schema_version integer
)
returns public.projects
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile public.profiles%rowtype;
  v_project public.projects%rowtype;
begin
  v_profile := public.assert_current_session_v2();
  perform public.validate_project_payload_v2(p_project_data, p_schema_version, v_profile.organization_id);
  v_project := public.create_project_v1(
    p_project_name, p_customer_name, p_product_type, p_project_data, p_app_version, p_schema_version
  );
  return v_project;
end;
$$;

create or replace function public.save_project_v2(
  p_project_id uuid,
  p_expected_server_version bigint,
  p_project_name text,
  p_customer_name text,
  p_product_type text,
  p_project_data jsonb,
  p_app_version text,
  p_schema_version integer
)
returns public.projects
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile public.profiles%rowtype;
  v_project public.projects%rowtype;
begin
  v_profile := public.assert_current_session_v2();
  if v_profile.role not in ('system_admin', 'company_admin', 'designer') then raise exception 'READ_ONLY_USER'; end if;
  if nullif(btrim(coalesce(p_project_name, '')), '') is null then raise exception 'PROJECT_NAME_REQUIRED'; end if;
  perform public.validate_project_payload_v2(p_project_data, p_schema_version, v_profile.organization_id);

  select p.* into v_project
  from public.projects p
  where p.id = p_project_id
    and p.organization_id = v_profile.organization_id
  for update;
  if not found then raise exception 'PROJECT_NOT_FOUND'; end if;
  if v_project.server_version <> p_expected_server_version then
    raise exception 'PROJECT_VERSION_CONFLICT:%', v_project.server_version;
  end if;

  update public.projects
  set customer_name = nullif(btrim(coalesce(p_customer_name, '')), ''),
      project_name = btrim(p_project_name),
      product_type = coalesce(nullif(btrim(coalesce(p_product_type, '')), ''), 'PERGO_RISE'),
      project_data = p_project_data,
      app_version = p_app_version,
      schema_version = p_schema_version,
      server_version = server_version + 1,
      updated_by = auth.uid()
  where id = v_project.id
  returning * into v_project;

  insert into public.project_revisions
    (project_id, revision_no, project_data, app_version, schema_version, change_note, created_by)
  values
    (v_project.id, v_project.current_revision, v_project.project_data, v_project.app_version,
     v_project.schema_version, case when v_project.current_revision = 1 then 'İlk kayıt' else null end, auth.uid())
  on conflict (project_id, revision_no) do update
    set project_data = excluded.project_data,
        app_version = excluded.app_version,
        schema_version = excluded.schema_version;

  return v_project;
end;
$$;

create or replace function public.create_revision_v2(
  p_project_id uuid,
  p_expected_server_version bigint,
  p_project_name text,
  p_customer_name text,
  p_product_type text,
  p_project_data jsonb,
  p_app_version text,
  p_schema_version integer,
  p_change_note text default null
)
returns public.projects
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile public.profiles%rowtype;
  v_project public.projects%rowtype;
  v_next integer;
begin
  v_profile := public.assert_current_session_v2();
  if v_profile.role not in ('system_admin', 'company_admin', 'designer') then raise exception 'READ_ONLY_USER'; end if;
  perform public.validate_project_payload_v2(p_project_data, p_schema_version, v_profile.organization_id);

  select p.* into v_project
  from public.projects p
  where p.id = p_project_id and p.organization_id = v_profile.organization_id
  for update;
  if not found then raise exception 'PROJECT_NOT_FOUND'; end if;
  if v_project.server_version <> p_expected_server_version then
    raise exception 'PROJECT_VERSION_CONFLICT:%', v_project.server_version;
  end if;

  -- The current row may change until it is superseded; older rows cannot.
  update public.project_revisions
  set project_data = p_project_data,
      app_version = p_app_version,
      schema_version = p_schema_version
  where project_id = v_project.id and revision_no = v_project.current_revision;

  v_next := v_project.current_revision + 1;
  insert into public.project_revisions
    (project_id, revision_no, project_data, app_version, schema_version, change_note, created_by)
  values
    (v_project.id, v_next, p_project_data, p_app_version, p_schema_version,
     nullif(btrim(coalesce(p_change_note, '')), ''), auth.uid());

  update public.projects
  set customer_name = nullif(btrim(coalesce(p_customer_name, '')), ''),
      project_name = btrim(p_project_name),
      product_type = coalesce(nullif(btrim(coalesce(p_product_type, '')), ''), 'PERGO_RISE'),
      current_revision = v_next,
      project_data = p_project_data,
      app_version = p_app_version,
      schema_version = p_schema_version,
      server_version = server_version + 1,
      updated_by = auth.uid()
  where id = v_project.id
  returning * into v_project;

  return v_project;
end;
$$;

create or replace function public.create_revision_from_history_v1(
  p_project_id uuid,
  p_source_revision integer,
  p_expected_server_version bigint,
  p_project_name text,
  p_customer_name text,
  p_product_type text,
  p_project_data jsonb,
  p_app_version text,
  p_schema_version integer,
  p_change_note text default null
)
returns public.projects
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile public.profiles%rowtype;
  v_project public.projects%rowtype;
  v_next integer;
begin
  v_profile := public.assert_current_session_v2();
  if v_profile.role not in ('system_admin', 'company_admin', 'designer') then raise exception 'READ_ONLY_USER'; end if;
  perform public.validate_project_payload_v2(p_project_data, p_schema_version, v_profile.organization_id);

  select p.* into v_project
  from public.projects p
  where p.id = p_project_id and p.organization_id = v_profile.organization_id
  for update;
  if not found then raise exception 'PROJECT_NOT_FOUND'; end if;
  if v_project.server_version <> p_expected_server_version then
    raise exception 'PROJECT_VERSION_CONFLICT:%', v_project.server_version;
  end if;
  if p_source_revision < 1 or p_source_revision > v_project.current_revision
     or not exists (
       select 1 from public.project_revisions r
       where r.project_id = p_project_id and r.revision_no = p_source_revision
     ) then
    raise exception 'SOURCE_REVISION_NOT_FOUND';
  end if;

  v_next := v_project.current_revision + 1;
  insert into public.project_revisions
    (project_id, revision_no, project_data, app_version, schema_version, change_note, created_by)
  values
    (v_project.id, v_next, p_project_data, p_app_version, p_schema_version,
     coalesce(nullif(btrim(coalesce(p_change_note, '')), ''), 'R' || lpad(p_source_revision::text, 2, '0') || ' temel alınarak'),
     auth.uid());

  update public.projects
  set customer_name = nullif(btrim(coalesce(p_customer_name, '')), ''),
      project_name = btrim(p_project_name),
      product_type = coalesce(nullif(btrim(coalesce(p_product_type, '')), ''), 'PERGO_RISE'),
      current_revision = v_next,
      project_data = p_project_data,
      app_version = p_app_version,
      schema_version = p_schema_version,
      server_version = server_version + 1,
      updated_by = auth.uid()
  where id = v_project.id
  returning * into v_project;

  return v_project;
end;
$$;

-- Legacy write RPCs must not remain an optimistic-lock bypass.
revoke all on function public.create_project_v1(text, text, text, jsonb, text, integer) from anon, authenticated;
revoke all on function public.save_project_v1(uuid, text, text, text, jsonb, text, integer) from anon, authenticated;
revoke all on function public.create_revision_v1(uuid, text) from anon, authenticated;
revoke all on function public.resolve_login_username_v1(text) from anon, authenticated;
revoke all on function public.provision_invited_user_v1(uuid, uuid, uuid, text, text, text, text, text) from anon, authenticated;
revoke all on function public.identify_usage_session_v1(uuid) from anon, authenticated;
revoke all on function public.log_activity_v1(uuid, text, uuid, text, integer, jsonb, uuid) from anon, authenticated;
revoke all on function public.delete_project_v1(uuid) from anon;
revoke all on function public.admin_create_organization_v1(text, date, integer) from anon;
revoke all on function public.admin_list_activity_logs_v1(uuid, timestamptz, timestamptz, integer) from anon;
revoke all on function public.admin_list_organizations_v1() from anon;
revoke all on function public.admin_list_usage_sessions_v1(uuid, timestamptz, timestamptz, integer) from anon;
revoke all on function public.admin_list_users_v1(uuid) from anon;
revoke all on function public.admin_update_organization_v1(uuid, text, boolean, date, integer, jsonb) from anon;
revoke all on function public.admin_update_user_v1(uuid, text, text, text, boolean) from anon;

-- ---------------------------------------------------------------------------
-- PIN login rate limiting and audit. Only the service-role Edge Function can
-- invoke these functions; raw usernames, PINs and IP addresses are never stored.
-- ---------------------------------------------------------------------------

create table if not exists public.pin_login_buckets (
  bucket_type text not null check (bucket_type in ('username', 'ip')),
  bucket_hash text not null check (bucket_hash ~ '^[0-9a-f]{64}$'),
  failure_count integer not null default 0,
  window_started_at timestamptz not null default now(),
  last_attempt_at timestamptz not null default now(),
  locked_until timestamptz,
  primary key (bucket_type, bucket_hash)
);

create table if not exists public.pin_login_audit (
  id bigint generated always as identity primary key,
  username_hash text not null check (username_hash ~ '^[0-9a-f]{64}$'),
  ip_hash text not null check (ip_hash ~ '^[0-9a-f]{64}$'),
  success boolean not null,
  reason text not null check (reason ~ '^[A-Z0-9_]{3,64}$'),
  attempted_at timestamptz not null default now()
);

create index if not exists pin_login_audit_attempted_idx on public.pin_login_audit(attempted_at desc);
alter table public.pin_login_buckets enable row level security;
alter table public.pin_login_audit enable row level security;
revoke all on public.pin_login_buckets from anon, authenticated;
revoke all on public.pin_login_audit from anon, authenticated;

create or replace function public.assert_service_role_v1()
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if coalesce(auth.role(), current_setting('request.jwt.claim.role', true), '') <> 'service_role' then
    raise exception 'SERVICE_ROLE_REQUIRED';
  end if;
end;
$$;

create or replace function public.pin_login_preflight_v1(p_username_hash text, p_ip_hash text)
returns table(allowed boolean, retry_after_seconds integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_locked_until timestamptz;
begin
  perform public.assert_service_role_v1();
  if p_username_hash !~ '^[0-9a-f]{64}$' or p_ip_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'LOGIN_HASH_INVALID';
  end if;

  select max(b.locked_until) into v_locked_until
  from public.pin_login_buckets b
  where (b.bucket_type = 'username' and b.bucket_hash = p_username_hash)
     or (b.bucket_type = 'ip' and b.bucket_hash = p_ip_hash);

  allowed := v_locked_until is null or v_locked_until <= now();
  retry_after_seconds := case when allowed then 0 else greatest(1, ceil(extract(epoch from (v_locked_until - now())))::integer) end;
  return next;
end;
$$;

create or replace function public.record_pin_login_attempt_v1(
  p_username_hash text,
  p_ip_hash text,
  p_success boolean,
  p_reason text
)
returns table(locked_until timestamptz, retry_after_seconds integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_type text;
  v_hash text;
  v_bucket public.pin_login_buckets%rowtype;
  v_seconds integer;
  v_max_lock timestamptz;
begin
  perform public.assert_service_role_v1();
  if p_username_hash !~ '^[0-9a-f]{64}$' or p_ip_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'LOGIN_HASH_INVALID';
  end if;
  if coalesce(p_reason, '') !~ '^[A-Z0-9_]{3,64}$' then raise exception 'LOGIN_REASON_INVALID'; end if;

  insert into public.pin_login_audit(username_hash, ip_hash, success, reason)
  values (p_username_hash, p_ip_hash, coalesce(p_success, false), p_reason);

  if p_success then
    delete from public.pin_login_buckets
    where (bucket_type = 'username' and bucket_hash = p_username_hash)
       or (bucket_type = 'ip' and bucket_hash = p_ip_hash);
    locked_until := null;
    retry_after_seconds := 0;
    return next;
    return;
  end if;

  foreach v_type in array array['username'::text, 'ip'::text]
  loop
    v_hash := case when v_type = 'username' then p_username_hash else p_ip_hash end;
    insert into public.pin_login_buckets(bucket_type, bucket_hash, failure_count, window_started_at, last_attempt_at)
    values (v_type, v_hash, 0, now(), now())
    on conflict (bucket_type, bucket_hash) do nothing;

    select * into v_bucket from public.pin_login_buckets
    where bucket_type = v_type and bucket_hash = v_hash
    for update;

    if v_bucket.window_started_at < now() - interval '24 hours' then
      v_bucket.failure_count := 0;
      v_bucket.window_started_at := now();
    end if;
    v_bucket.failure_count := v_bucket.failure_count + 1;
    v_seconds := case
      when v_bucket.failure_count < 5 then 0
      when v_bucket.failure_count = 5 then 60
      when v_bucket.failure_count = 6 then 120
      when v_bucket.failure_count = 7 then 300
      when v_bucket.failure_count = 8 then 900
      when v_bucket.failure_count = 9 then 1800
      when v_bucket.failure_count = 10 then 3600
      when v_bucket.failure_count = 11 then 21600
      else 86400
    end;

    update public.pin_login_buckets
    set failure_count = v_bucket.failure_count,
        window_started_at = v_bucket.window_started_at,
        last_attempt_at = now(),
        locked_until = case when v_seconds > 0 then now() + make_interval(secs => v_seconds) else null end
    where bucket_type = v_type and bucket_hash = v_hash
    returning pin_login_buckets.locked_until into v_bucket.locked_until;

    if v_bucket.locked_until is not null and (v_max_lock is null or v_bucket.locked_until > v_max_lock) then
      v_max_lock := v_bucket.locked_until;
    end if;
  end loop;

  locked_until := v_max_lock;
  retry_after_seconds := case when v_max_lock is null then 0 else greatest(1, ceil(extract(epoch from (v_max_lock - now())))::integer) end;
  return next;
end;
$$;

-- Corrected authenticated activity functions. They derive organization context
-- from the current profile and never trust a normal user's client-supplied id.
create or replace function public.identify_usage_session_v2(p_session_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile public.profiles%rowtype;
begin
  v_profile := public.assert_current_session_v2();
  update public.usage_sessions
  set organization_id = v_profile.organization_id,
      user_id = v_profile.id,
      username_snapshot = v_profile.username,
      full_name_snapshot = v_profile.full_name,
      last_seen_at = now()
  where id = p_session_id;
end;
$$;

create or replace function public.log_activity_v2(
  p_session_id uuid,
  p_action text,
  p_project_id uuid default null,
  p_project_code text default null,
  p_revision_no integer default null,
  p_detail jsonb default '{}'::jsonb,
  p_context_organization_id uuid default null
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile public.profiles%rowtype;
  v_organization_id uuid;
  v_id bigint;
begin
  v_profile := public.assert_current_session_v2();
  if coalesce(p_action, '') !~ '^[a-z0-9_]{3,64}$' then raise exception 'ACTIVITY_ACTION_INVALID'; end if;
  if jsonb_typeof(coalesce(p_detail, '{}'::jsonb)) <> 'object' then raise exception 'ACTIVITY_DETAIL_INVALID'; end if;

  v_organization_id := v_profile.organization_id;
  if v_profile.role = 'system_admin' and p_context_organization_id is not null then
    if not exists (select 1 from public.organizations where id = p_context_organization_id) then
      raise exception 'ORGANIZATION_NOT_FOUND';
    end if;
    v_organization_id := p_context_organization_id;
  end if;

  insert into public.activity_logs
    (session_id, organization_id, user_id, username_snapshot, full_name_snapshot,
     action, project_id, project_code, revision_no, detail)
  values
    (p_session_id, v_organization_id, v_profile.id, v_profile.username, v_profile.full_name,
     p_action, p_project_id, p_project_code, p_revision_no, coalesce(p_detail, '{}'::jsonb))
  returning id into v_id;
  return v_id;
end;
$$;

-- Function privileges are explicit; PUBLIC/anon cannot mutate protected state.
revoke all on function public.current_session_is_valid_v2() from public, anon;
revoke all on function public.assert_current_session_v2() from public, anon;
revoke all on function public.effective_limit_value_v1(uuid, text) from public, anon, authenticated;
revoke all on function public.jsonb_array_size_v1(jsonb) from public, anon, authenticated;
revoke all on function public.validate_project_payload_v2(jsonb, integer, uuid) from public, anon, authenticated;
revoke all on function public.protect_historical_revision_v2() from public, anon, authenticated;
revoke all on function public.get_effective_app_limits_v1() from public, anon;
revoke all on function public.admin_list_app_limits_v1(uuid) from public, anon;
revoke all on function public.admin_set_app_limit_v1(text, integer, uuid) from public, anon;
revoke all on function public.admin_reset_app_limits_v1(uuid) from public, anon;
revoke all on function public.admin_list_app_limit_audit_v1(uuid, integer) from public, anon;
revoke all on function public.create_project_v2(text, text, text, jsonb, text, integer) from public, anon;
revoke all on function public.save_project_v2(uuid, bigint, text, text, text, jsonb, text, integer) from public, anon;
revoke all on function public.create_revision_v2(uuid, bigint, text, text, text, jsonb, text, integer, text) from public, anon;
revoke all on function public.create_revision_from_history_v1(uuid, integer, bigint, text, text, text, jsonb, text, integer, text) from public, anon;
revoke all on function public.identify_usage_session_v2(uuid) from public, anon;
revoke all on function public.log_activity_v2(uuid, text, uuid, text, integer, jsonb, uuid) from public, anon;

grant execute on function public.current_session_is_valid_v2() to authenticated, service_role;
grant execute on function public.assert_current_session_v2() to authenticated, service_role;
grant execute on function public.effective_limit_value_v1(uuid, text) to service_role;
grant execute on function public.jsonb_array_size_v1(jsonb) to service_role;
grant execute on function public.validate_project_payload_v2(jsonb, integer, uuid) to service_role;
grant execute on function public.protect_historical_revision_v2() to service_role;
grant execute on function public.get_effective_app_limits_v1() to authenticated, service_role;
grant execute on function public.admin_list_app_limits_v1(uuid) to authenticated, service_role;
grant execute on function public.admin_set_app_limit_v1(text, integer, uuid) to authenticated, service_role;
grant execute on function public.admin_reset_app_limits_v1(uuid) to authenticated, service_role;
grant execute on function public.admin_list_app_limit_audit_v1(uuid, integer) to authenticated, service_role;
grant execute on function public.create_project_v2(text, text, text, jsonb, text, integer) to authenticated, service_role;
grant execute on function public.save_project_v2(uuid, bigint, text, text, text, jsonb, text, integer) to authenticated, service_role;
grant execute on function public.create_revision_v2(uuid, bigint, text, text, text, jsonb, text, integer, text) to authenticated, service_role;
grant execute on function public.create_revision_from_history_v1(uuid, integer, bigint, text, text, text, jsonb, text, integer, text) to authenticated, service_role;
grant execute on function public.identify_usage_session_v2(uuid) to authenticated, service_role;
grant execute on function public.log_activity_v2(uuid, text, uuid, text, integer, jsonb, uuid) to authenticated, service_role;

revoke all on function public.assert_service_role_v1() from public, anon, authenticated;
revoke all on function public.pin_login_preflight_v1(text, text) from public, anon, authenticated;
revoke all on function public.record_pin_login_attempt_v1(text, text, boolean, text) from public, anon, authenticated;
grant execute on function public.assert_service_role_v1() to service_role;
grant execute on function public.pin_login_preflight_v1(text, text) to service_role;
grant execute on function public.record_pin_login_attempt_v1(text, text, boolean, text) to service_role;

commit;
