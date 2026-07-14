-- PLMR Version 11.2 / Stage 3 account security
-- Additive, backward-compatible helpers used only by the admin-users Edge Function.
-- No table, column, policy, trigger, or existing function is removed.

create or replace function public.commit_self_username_change_v1(
  p_actor_id uuid,
  p_old_username text,
  p_new_username text,
  p_revoked_at timestamptz
)
returns table (user_id uuid, old_username text, new_username text, session_revoked_at timestamptz)
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  v_profile public.profiles%rowtype;
begin
  select * into v_profile
  from public.profiles
  where id = p_actor_id
  for update;

  if not found or v_profile.is_active is not true then
    raise exception 'USER_NOT_FOUND';
  end if;
  if v_profile.role <> 'system_admin' then
    raise exception 'SYSTEM_ADMIN_REQUIRED';
  end if;
  if lower(coalesce(v_profile.username, '')) <> lower(trim(coalesce(p_old_username, ''))) then
    raise exception 'USERNAME_CHANGED_CONCURRENTLY';
  end if;
  if trim(coalesce(p_new_username, '')) !~ '^[a-z0-9._-]{3,32}$' then
    raise exception 'USERNAME_INVALID';
  end if;
  if exists (
    select 1 from public.profiles
    where lower(username) = lower(trim(p_new_username)) and id <> p_actor_id
  ) then
    raise exception 'USERNAME_ALREADY_EXISTS';
  end if;

  update public.profiles
  set username = lower(trim(p_new_username)),
      session_revoked_at = p_revoked_at
  where id = p_actor_id;

  insert into public.activity_logs (
    organization_id, user_id, username_snapshot, full_name_snapshot, action, detail
  ) values (
    v_profile.organization_id,
    p_actor_id,
    lower(trim(p_new_username)),
    v_profile.full_name,
    'self_username_change',
    jsonb_build_object(
      'old_username', lower(trim(p_old_username)),
      'new_username', lower(trim(p_new_username)),
      'revoked_at', p_revoked_at
    )
  );

  return query select p_actor_id, lower(trim(p_old_username)), lower(trim(p_new_username)), p_revoked_at;
end;
$$;

create or replace function public.commit_global_logout_v1(
  p_actor_id uuid,
  p_revoked_at timestamptz
)
returns table (user_id uuid, session_revoked_at timestamptz)
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  v_profile public.profiles%rowtype;
begin
  select * into v_profile
  from public.profiles
  where id = p_actor_id
  for update;

  if not found or v_profile.is_active is not true then
    raise exception 'USER_NOT_FOUND';
  end if;
  if v_profile.role <> 'system_admin' then
    raise exception 'SYSTEM_ADMIN_REQUIRED';
  end if;

  update public.profiles
  set session_revoked_at = p_revoked_at
  where id = p_actor_id;

  insert into public.activity_logs (
    organization_id, user_id, username_snapshot, full_name_snapshot, action, detail
  ) values (
    v_profile.organization_id,
    p_actor_id,
    v_profile.username,
    v_profile.full_name,
    'global_logout',
    jsonb_build_object('revoked_at', p_revoked_at, 'scope', 'global')
  );

  return query select p_actor_id, p_revoked_at;
end;
$$;

revoke all on function public.commit_self_username_change_v1(uuid, text, text, timestamptz) from public, anon, authenticated;
revoke all on function public.commit_global_logout_v1(uuid, timestamptz) from public, anon, authenticated;
grant execute on function public.commit_self_username_change_v1(uuid, text, text, timestamptz) to service_role;
grant execute on function public.commit_global_logout_v1(uuid, timestamptz) to service_role;
