-- 009: Restore readable organization codes (2026-07-28).
--
-- Org codes are read aloud and typed in by members, so every existing one
-- carries a prefix from the organization name (GAMTT-0B1E13). That shape came
-- from a client-side fallback in the signup page, which was removed in 008 --
-- leaving only the bare-hex generate_org_code(), so new customers would have
-- received codes like "0D3ACC" that match nothing else in the system.
--
-- Note the ordering of operations in the prefix: strip non-alphanumerics and
-- then uppercase. Filtering on [^A-Z0-9] first (as an older revision did)
-- deletes every lowercase letter and collapses most names to the ORG fallback.

CREATE OR REPLACE FUNCTION public.generate_org_code(org_name text)
RETURNS text
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  prefix   text;
  new_code text;
  attempts int := 0;
BEGIN
  prefix := upper(regexp_replace(coalesce(org_name, ''), '[^a-zA-Z0-9]', '', 'g'));
  prefix := left(prefix, 5);
  IF length(prefix) < 3 THEN
    prefix := 'ORG';
  END IF;

  LOOP
    new_code := prefix || '-' || upper(substring(md5(random()::text) from 1 for 6));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM organizations o WHERE o.org_code = new_code);
    attempts := attempts + 1;
    IF attempts > 25 THEN
      RAISE EXCEPTION 'Could not allocate a unique organization code';
    END IF;
  END LOOP;

  RETURN new_code;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.generate_org_code(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.generate_org_code(text) TO authenticated, service_role;

-- Point the signup RPC at the readable generator. Body is otherwise unchanged
-- from 008; see that migration for why this stays anon-callable.
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

  v_code := generate_org_code(trim(p_org_name));

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
