-- 012: Let the donation kiosk load for an anonymous visitor.
--
-- The kiosk runs signed out by design — it is a tablet in the lobby, not a
-- staff session. Three separate things blocked that:
--
--   1. /kiosk was missing from the middleware's public route list, so the
--      request was redirected to /login before the page ever rendered.
--   2. The page read `organizations` directly with the browser (anon) client.
--      Migration 007 scoped that table to authenticated users, so the query
--      returned no rows and the page fell through to "Organization Not Found".
--   3. settings.kiosk is absent on most orgs and DEFAULT_KIOSK_SETTINGS has
--      enabled: false, so even an authenticated load showed "currently disabled".
--
-- (1) and (3) are fixed outside this file. This migration fixes (2).
--
-- get_organization_by_code already exposes the pre-auth org lookup, but it does
-- not return `settings`, and the kiosk needs the kiosk block to render. Rather
-- than change that function's return type — mobile's org-code entry depends on
-- it — this adds a sibling that returns display fields plus the kiosk config
-- only. `settings.type` and every other org column stay unexposed.
--
-- This does not reintroduce the enumeration hole 007 closed: the caller must
-- already know the exact org_code, and no policy on `organizations` changes.

CREATE OR REPLACE FUNCTION public.get_kiosk_config(code text)
RETURNS TABLE (
  id uuid,
  name text,
  logo_url text,
  primary_color text,
  kiosk jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT o.id, o.name, o.logo_url, o.primary_color, o.settings -> 'kiosk'
  FROM organizations o
  WHERE o.org_code = upper(code)
    AND o.is_active = true;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_kiosk_config(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_kiosk_config(text) TO anon, authenticated, service_role;
