-- PLMR V11.1 Stage 2 - Login security consistency guard
-- Prevents the legacy admin user update RPC from changing usernames without
-- updating the PIN-derived Supabase Auth password. Signature is preserved.

create or replace function public.admin_update_user_v1(
  p_user_id uuid,
  p_full_name text,
  p_username text,
  p_role text,
  p_is_active boolean
) returns public.profiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor public.profiles%rowtype;
  v_target public.profiles%rowtype;
  v_result public.profiles%rowtype;
  v_other_admins integer;
begin
  select * into v_actor from public.profiles where id = auth.uid() and is_active = true;
  if not found or v_actor.role not in ('system_admin', 'company_admin') then raise exception 'ADMIN_REQUIRED'; end if;

  select * into v_target from public.profiles where id = p_user_id for update;
  if not found then raise exception 'USER_NOT_FOUND'; end if;
  if v_target.role = 'system_admin' then raise exception 'SYSTEM_ADMIN_PROTECTED'; end if;
  if p_user_id = auth.uid() then raise exception 'SELF_MANAGEMENT_NOT_ALLOWED'; end if;
  if v_actor.role = 'company_admin' and v_target.organization_id <> v_actor.organization_id then raise exception 'ORGANIZATION_ACCESS_DENIED'; end if;
  if p_role not in ('company_admin', 'designer') then raise exception 'ROLE_INVALID'; end if;
  if nullif(btrim(coalesce(p_full_name, '')), '') is null then raise exception 'FULL_NAME_REQUIRED'; end if;
  if lower(btrim(coalesce(p_username, ''))) <> v_target.username then
    raise exception 'USERNAME_CHANGE_REQUIRES_SECURE_FLOW';
  end if;

  if v_target.role = 'company_admin' and (p_role <> 'company_admin' or coalesce(p_is_active, false) is false) then
    select count(*)::integer into v_other_admins
    from public.profiles
    where organization_id = v_target.organization_id
      and id <> v_target.id
      and role = 'company_admin'
      and is_active = true;
    if v_other_admins = 0 then raise exception 'LAST_COMPANY_ADMIN_REQUIRED'; end if;
  end if;

  update public.profiles
  set full_name = btrim(p_full_name), role = p_role, is_active = coalesce(p_is_active, false)
  where id = p_user_id
  returning * into v_result;
  return v_result;
end;
$$;

revoke all on function public.admin_update_user_v1(uuid, text, text, text, boolean) from public, anon;
grant execute on function public.admin_update_user_v1(uuid, text, text, text, boolean) to authenticated, service_role;
