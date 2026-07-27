-- 007: Close anonymous data exposure found by the Supabase security advisors
-- before the App Store launch (2026-07-27).
--
-- Verified before/after with the anon key against the live REST + storage APIs.
-- Public object URLs (/storage/v1/object/public/...) bypass RLS entirely, so
-- narrowing these SELECT policies does not affect image display in the apps.

-- 1. Storage: the broad SELECT policies let anyone list every file in both
-- public buckets (filenames are <member_uuid>-<timestamp>.jpg). Scope reads to
-- the uploader, which still satisfies the existence check `upsert: true` needs.
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Public read access to announcement images" ON storage.objects;

CREATE POLICY "Owners can read own member photos"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'member-photos' AND owner = auth.uid());

CREATE POLICY "Owners can read own announcement images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'announcement-images' AND owner = auth.uid());

-- 2. Organizations were world-readable, exposing every customer's name and
-- org_code (the mobile join credential) to anonymous callers. Pre-auth code
-- entry uses the get_organization_by_code SECURITY DEFINER RPC instead.
DROP POLICY IF EXISTS "Anyone can view organizations" ON public.organizations;

CREATE POLICY "Authenticated users can view organizations"
  ON public.organizations FOR SELECT
  TO authenticated
  USING (true);

-- 3. publish/unpublish_announcement are SECURITY DEFINER with no caller check
-- and no callers in the codebase; they allowed anyone to flip an announcement's
-- published state given its id.
REVOKE EXECUTE ON FUNCTION public.publish_announcement(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.unpublish_announcement(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.publish_announcement(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.unpublish_announcement(uuid) TO service_role;

-- 4. Org creation requires a signed-in user; it was callable anonymously.
REVOKE EXECUTE ON FUNCTION public.create_organization_with_admin(text,text,text,uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_organization_with_admin(text,text,text,uuid) TO authenticated, service_role;
