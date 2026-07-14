-- Salt okunur V10.4 backend doğrulaması.
select public.get_backend_capabilities_v1() as backend_capabilities;

select
  to_regprocedure('public.pin_login_preflight_v1(text,text)') is not null as pin_preflight_exists,
  to_regprocedure('public.record_pin_login_attempt_v1(text,text,boolean,text)') is not null as pin_record_exists,
  to_regprocedure('public.create_project_v2(text,text,text,jsonb,text,integer)') is not null as create_project_v2_exists,
  to_regprocedure('public.save_project_v2(uuid,bigint,text,text,text,jsonb,text,integer)') is not null as save_project_v2_exists,
  to_regprocedure('public.get_effective_app_limits_v1()') is not null as central_limits_exists,
  exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'projects' and column_name = 'server_version'
  ) as server_version_exists,
  exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'session_revoked_at'
  ) as session_revoked_at_exists;
