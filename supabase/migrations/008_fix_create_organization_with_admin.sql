-- 008: Repair the organization signup RPC (2026-07-27).
--
-- Web signup was failing end-to-end. Three separate faults:
--   1. The client passed p_-prefixed argument names that did not exist on the
--      function, so PostgREST never resolved it.
--   2. The function omitted the NOT NULL `slug` column, so it would have failed
--      even when called correctly.
--   3. Its declared RETURNS uuid meant the client's `orgData.org_code` read was
--      undefined on the success path anyway.
-- Every signup therefore fell through to a client-side fallback insert that RLS
-- rejects, because auth.signUp() returns no session while email confirmation is
-- enabled -- so the whole flow ran as `anon`.
--
-- Rebuilt to match the client, populate every NOT NULL column, and guard the
-- anonymous access the flow requires (there is no session at signup time):
--   * the referenced user must exist in auth.users
--   * one organization per account
-- so creating an org still requires getting through real, email-gated signup.

DROP FUNCTION IF EXISTS public.create_organization_with_admin(text, text, text, uuid);

CREATE OR REPLACE FUNCTION public.create_organization_with_admin(
  p_org_name      text,
  p_org_slug      text,
  p_org_type      text,
  p_admin_user_id uuid,
  p_admin_name    text,
  p_admin_email   text
)
RETURNS TABLE (org_id uuid, org_code text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_org_id   uuid;
  v_code     text;
  v_slug     text;
  v_base     text;
  v_attempt  int := 0;
BEGIN
  IF p_admin_user_id IS NULL
     OR NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = p_admin_user_id) THEN
    RAISE EXCEPTION 'Unknown user' USING ERRCODE = '42501';
  END IF;

  IF EXISTS (SELECT 1 FROM staff s WHERE s.user_id = p_admin_user_id) THEN
    RAISE EXCEPTION 'This account already belongs to an organization'
      USING ERRCODE = '23505';
  END IF;

  IF coalesce(trim(p_org_name), '') = '' THEN
    RAISE EXCEPTION 'Organization name is required';
  END IF;

  -- slug is NOT NULL and UNIQUE; fall back to a suffix when the base is taken
  v_base := nullif(regexp_replace(lower(coalesce(p_org_slug, p_org_name)),
                                  '[^a-z0-9]+', '-', 'g'), '');
  v_base := trim(both '-' from coalesce(v_base, 'org'));
  IF v_base = '' THEN
    v_base := 'org';
  END IF;
  v_base := left(v_base, 50);

  v_slug := v_base;
  WHILE EXISTS (SELECT 1 FROM organizations o WHERE o.slug = v_slug) LOOP
    v_attempt := v_attempt + 1;
    v_slug := left(v_base, 44) || '-' || upper(substring(md5(random()::text) from 1 for 5));
    IF v_attempt > 20 THEN
      RAISE EXCEPTION 'Could not allocate a unique slug';
    END IF;
  END LOOP;

  v_code := generate_org_code();

  INSERT INTO organizations (name, slug, org_code, settings)
  VALUES (
    trim(p_org_name),
    v_slug,
    v_code,
    CASE WHEN p_org_type IS NULL THEN '{}'::jsonb
         ELSE jsonb_build_object('type', p_org_type) END
  )
  RETURNING id INTO v_org_id;

  INSERT INTO staff (organization_id, user_id, name, email, role)
  VALUES (v_org_id, p_admin_user_id, p_admin_name, p_admin_email, 'owner');

  RETURN QUERY SELECT v_org_id, v_code;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.create_organization_with_admin(text,text,text,uuid,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_organization_with_admin(text,text,text,uuid,text,text)
  TO anon, authenticated, service_role;
