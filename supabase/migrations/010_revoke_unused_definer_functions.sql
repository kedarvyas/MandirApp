-- 010: Lock down SECURITY DEFINER functions that nothing calls.
--
-- Verified before writing this migration:
--   * no call sites in mobile/ or web/ source
--   * no RLS policy references any of them
--   * no other function calls them
--
-- IMPORTANT: Postgres grants EXECUTE on functions to PUBLIC by default, so
-- "revoke ... from anon" alone is a no-op -- anon still inherits it through
-- PUBLIC. Every function below is therefore revoked from PUBLIC first, then
-- granted back only to the roles that genuinely need it.

-- ---------------------------------------------------------------------------
-- Fully locked down: no client role may call these.
-- ---------------------------------------------------------------------------

-- No authorization check at all: no auth.uid(), no org scoping. Given a
-- family_group_id it returns names, photos, relationships and qr_token -- the
-- check-in credential -- for that entire family. Revoked from authenticated
-- too, since a signed-in user of one org could otherwise read another org's
-- families.
revoke execute on function public.get_family_members(uuid) from public, anon, authenticated;
grant  execute on function public.get_family_members(uuid) to service_role;

-- Keyed on an unguessable UUID, so it is a capability token rather than an
-- open door, but it is uncalled and it pairs with the leak above. Grant back
-- deliberately if the kiosk scanner ever needs it.
revoke execute on function public.get_member_by_qr(uuid) from public, anon, authenticated;
grant  execute on function public.get_member_by_qr(uuid) to service_role;

-- ---------------------------------------------------------------------------
-- Signed-in only: auth.uid()-scoped, so anon would get null/false/empty
-- anyway. There is no path where a signed-out caller should probe staff roles
-- or permissions.
-- ---------------------------------------------------------------------------

revoke execute on function public.get_my_permissions() from public, anon;
grant  execute on function public.get_my_permissions() to authenticated, service_role;

revoke execute on function public.get_staff_role(uuid) from public, anon;
grant  execute on function public.get_staff_role(uuid) to authenticated, service_role;

revoke execute on function public.is_org_admin(uuid) from public, anon;
grant  execute on function public.is_org_admin(uuid) to authenticated, service_role;

revoke execute on function public.staff_has_permission(text) from public, anon;
grant  execute on function public.staff_has_permission(text) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Must stay callable without a session. Re-granted explicitly so that dropping
-- PUBLIC does not break them.
--   get_organization_by_code      -> mobile org-code entry screen, pre-login
--   create_organization_with_admin -> web signup; signUp() issues no session
--                                     while email confirmation is required
-- ---------------------------------------------------------------------------

revoke execute on function public.get_organization_by_code(text) from public;
grant  execute on function public.get_organization_by_code(text) to anon, authenticated, service_role;

revoke execute on function public.create_organization_with_admin(text, text, text, uuid, text, text) from public;
grant  execute on function public.create_organization_with_admin(text, text, text, uuid, text, text) to anon, authenticated, service_role;
