-- Pülümür Automation Studio V10.4 — release metadata alignment
begin;

create or replace function public.get_backend_capabilities_v1()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_has_server_version boolean;
  v_has_session_revocation boolean;
  v_has_rate_limit boolean;
  v_has_central_limits boolean;
  v_has_optimistic_locking boolean;
begin
  select exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'projects' and column_name = 'server_version'
  ) into v_has_server_version;

  select exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'session_revoked_at'
  ) into v_has_session_revocation;

  select to_regprocedure('public.pin_login_preflight_v1(text,text)') is not null
     and to_regprocedure('public.record_pin_login_attempt_v1(text,text,boolean)') is not null
    into v_has_rate_limit;

  select to_regprocedure('public.get_effective_app_limits_v1(uuid)') is not null
    into v_has_central_limits;

  v_has_optimistic_locking := v_has_server_version;

  return jsonb_build_object(
    'backend_version', '10.4',
    'schema_stage', case when v_has_rate_limit and v_has_central_limits and v_has_optimistic_locking then 4 else 2 end,
    'migration_required', not (v_has_rate_limit and v_has_central_limits and v_has_optimistic_locking),
    'rate_limit_mode', case when v_has_rate_limit then 'database' else 'memory-fallback' end,
    'central_limits', v_has_central_limits,
    'optimistic_locking', v_has_optimistic_locking,
    'session_revocation', v_has_session_revocation
  );
end;
$$;

revoke all on function public.get_backend_capabilities_v1() from public;
grant execute on function public.get_backend_capabilities_v1() to anon, authenticated;

commit;
