-- Pülümür Automation Studio V10.3 — Aşama 4
-- Backend yetenek bildirimi ve tekrarlanabilir release doğrulaması.

begin;

create table if not exists public.app_runtime_metadata (
  metadata_key text primary key,
  metadata_value jsonb not null,
  updated_at timestamptz not null default now(),
  constraint app_runtime_metadata_key_format check (metadata_key ~ '^[a-z][a-z0-9_.-]{2,63}$'),
  constraint app_runtime_metadata_object check (jsonb_typeof(metadata_value) = 'object')
);

alter table public.app_runtime_metadata enable row level security;
revoke all on public.app_runtime_metadata from public, anon, authenticated;

insert into public.app_runtime_metadata(metadata_key, metadata_value, updated_at)
values (
  'backend_release',
  jsonb_build_object(
    'backend_version', '10.3',
    'schema_stage', 4,
    'released_at', now()
  ),
  now()
)
on conflict (metadata_key) do update
set metadata_value = excluded.metadata_value,
    updated_at = excluded.updated_at;

create or replace function public.get_backend_capabilities_v1()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_pin_rate_limit boolean;
  v_optimistic_locking boolean;
  v_central_limits boolean;
  v_session_revocation boolean;
  v_stage3_ready boolean;
  v_release jsonb;
begin
  v_pin_rate_limit := to_regprocedure('public.pin_login_preflight_v1(text,text)') is not null
    and to_regprocedure('public.record_pin_login_attempt_v1(text,text,boolean,text)') is not null
    and to_regclass('public.pin_login_buckets') is not null;

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'projects'
      and column_name = 'server_version'
  ) into v_optimistic_locking;

  v_central_limits := to_regprocedure('public.get_effective_app_limits_v1()') is not null
    and to_regclass('public.app_limit_defaults') is not null
    and to_regclass('public.company_limit_overrides') is not null;

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'session_revoked_at'
  ) into v_session_revocation;

  v_stage3_ready := v_pin_rate_limit and v_optimistic_locking and v_central_limits and v_session_revocation;

  select metadata_value into v_release
  from public.app_runtime_metadata
  where metadata_key = 'backend_release';

  return jsonb_build_object(
    'backend_version', coalesce(v_release ->> 'backend_version', '10.3'),
    'schema_stage', case when v_stage3_ready then 4 else 2 end,
    'pin_rate_limit', v_pin_rate_limit,
    'optimistic_locking', v_optimistic_locking,
    'central_limits', v_central_limits,
    'session_revocation', v_session_revocation,
    'rate_limit_mode', case when v_pin_rate_limit then 'database' else 'memory-fallback' end,
    'migration_required', not v_stage3_ready,
    'checked_at', now()
  );
end;
$$;

revoke all on function public.get_backend_capabilities_v1() from public, anon;
grant execute on function public.get_backend_capabilities_v1() to authenticated, service_role;

commit;
