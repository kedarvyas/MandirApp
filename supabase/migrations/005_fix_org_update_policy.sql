-- Migration: Fix organization UPDATE RLS policy to support new role system
-- The original policy only allowed role = 'admin', but 'owner' should also be able to update

-- Drop the old policy that only checked for 'admin' role
DROP POLICY IF EXISTS "Admins can update their organization" ON organizations;

-- Create new policy that uses the role_permissions table
-- This allows anyone with can_edit_org_settings permission to update the organization
CREATE POLICY "Staff with permission can update organization"
    ON organizations FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM staff s
            JOIN role_permissions rp ON rp.role = s.role
            WHERE s.user_id = auth.uid()
            AND s.organization_id = organizations.id
            AND s.is_active = TRUE
            AND rp.can_edit_org_settings = TRUE
        )
    );
