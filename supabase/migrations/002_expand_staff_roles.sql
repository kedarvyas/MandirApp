-- Migration: Expand staff roles for granular permissions
-- This adds more roles beyond just 'admin' and 'staff'

-- =============================================
-- STEP 1: Create new role enum type
-- =============================================

-- Create new enum with all roles
CREATE TYPE staff_role_v2 AS ENUM (
    'owner',      -- Full access + can transfer ownership, delete org
    'admin',      -- Full access to all features
    'treasurer',  -- Payments/donations focus
    'secretary',  -- Members/attendance focus
    'volunteer',  -- Check-in only
    'viewer'      -- Read-only access
);

-- Add new column with new type
ALTER TABLE staff ADD COLUMN role_v2 staff_role_v2;

-- Migrate existing data
UPDATE staff SET role_v2 = 'admin' WHERE role = 'admin';
UPDATE staff SET role_v2 = 'volunteer' WHERE role = 'staff';

-- Drop old column and rename new one
ALTER TABLE staff DROP COLUMN role;
ALTER TABLE staff RENAME COLUMN role_v2 TO role;

-- Set default and not null
ALTER TABLE staff ALTER COLUMN role SET DEFAULT 'volunteer';
ALTER TABLE staff ALTER COLUMN role SET NOT NULL;

-- Drop old enum type
DROP TYPE staff_role;

-- Rename new type to original name
ALTER TYPE staff_role_v2 RENAME TO staff_role;

-- =============================================
-- STEP 2: Create permissions lookup table
-- =============================================

CREATE TABLE role_permissions (
    role staff_role PRIMARY KEY,

    -- Member permissions
    can_view_members BOOLEAN DEFAULT FALSE,
    can_create_members BOOLEAN DEFAULT FALSE,
    can_edit_members BOOLEAN DEFAULT FALSE,
    can_delete_members BOOLEAN DEFAULT FALSE,

    -- Payment permissions
    can_view_payments BOOLEAN DEFAULT FALSE,
    can_create_payments BOOLEAN DEFAULT FALSE,
    can_edit_payments BOOLEAN DEFAULT FALSE,
    can_delete_payments BOOLEAN DEFAULT FALSE,
    can_export_payments BOOLEAN DEFAULT FALSE,

    -- Check-in permissions
    can_view_checkins BOOLEAN DEFAULT FALSE,
    can_create_checkins BOOLEAN DEFAULT FALSE,

    -- Report permissions
    can_view_reports BOOLEAN DEFAULT FALSE,
    can_export_reports BOOLEAN DEFAULT FALSE,

    -- Staff management
    can_view_staff BOOLEAN DEFAULT FALSE,
    can_manage_staff BOOLEAN DEFAULT FALSE,

    -- Organization settings
    can_edit_org_settings BOOLEAN DEFAULT FALSE,
    can_delete_org BOOLEAN DEFAULT FALSE,

    -- Description for UI
    description TEXT
);

-- Insert permission definitions for each role
INSERT INTO role_permissions (role, description,
    can_view_members, can_create_members, can_edit_members, can_delete_members,
    can_view_payments, can_create_payments, can_edit_payments, can_delete_payments, can_export_payments,
    can_view_checkins, can_create_checkins,
    can_view_reports, can_export_reports,
    can_view_staff, can_manage_staff,
    can_edit_org_settings, can_delete_org
) VALUES
(
    'owner', 'Organization owner with full control',
    TRUE, TRUE, TRUE, TRUE,  -- members
    TRUE, TRUE, TRUE, TRUE, TRUE,  -- payments
    TRUE, TRUE,  -- checkins
    TRUE, TRUE,  -- reports
    TRUE, TRUE,  -- staff
    TRUE, TRUE   -- org settings
),
(
    'admin', 'Administrator with full access except ownership',
    TRUE, TRUE, TRUE, TRUE,  -- members
    TRUE, TRUE, TRUE, TRUE, TRUE,  -- payments
    TRUE, TRUE,  -- checkins
    TRUE, TRUE,  -- reports
    TRUE, TRUE,  -- staff
    TRUE, FALSE  -- org settings (can edit, cannot delete org)
),
(
    'treasurer', 'Manages donations and financial records',
    TRUE, FALSE, FALSE, FALSE,  -- members (view only)
    TRUE, TRUE, TRUE, FALSE, TRUE,  -- payments (full except delete)
    TRUE, FALSE,  -- checkins (view only)
    TRUE, TRUE,  -- reports (financial focus)
    FALSE, FALSE,  -- staff
    FALSE, FALSE  -- org settings
),
(
    'secretary', 'Manages members and attendance records',
    TRUE, TRUE, TRUE, FALSE,  -- members (full except delete)
    TRUE, FALSE, FALSE, FALSE, FALSE,  -- payments (view only)
    TRUE, TRUE,  -- checkins
    TRUE, TRUE,  -- reports (attendance focus)
    FALSE, FALSE,  -- staff
    FALSE, FALSE  -- org settings
),
(
    'volunteer', 'Can perform check-ins only',
    TRUE, FALSE, FALSE, FALSE,  -- members (view only for check-in)
    FALSE, FALSE, FALSE, FALSE, FALSE,  -- payments (none)
    TRUE, TRUE,  -- checkins
    FALSE, FALSE,  -- reports
    FALSE, FALSE,  -- staff
    FALSE, FALSE  -- org settings
),
(
    'viewer', 'Read-only access to all data',
    TRUE, FALSE, FALSE, FALSE,  -- members
    TRUE, FALSE, FALSE, FALSE, FALSE,  -- payments
    TRUE, FALSE,  -- checkins
    TRUE, FALSE,  -- reports
    TRUE, FALSE,  -- staff (view only)
    FALSE, FALSE  -- org settings
);

-- =============================================
-- STEP 3: Helper functions for permission checks
-- =============================================

-- Function to check if user has a specific permission
CREATE OR REPLACE FUNCTION staff_has_permission(
    p_user_id UUID,
    p_org_id UUID,
    p_permission TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    user_role staff_role;
    has_perm BOOLEAN;
BEGIN
    -- Get user's role in this org
    SELECT role INTO user_role
    FROM staff
    WHERE user_id = p_user_id
    AND organization_id = p_org_id
    AND is_active = TRUE;

    IF user_role IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Check permission dynamically
    EXECUTE format('SELECT %I FROM role_permissions WHERE role = $1', p_permission)
    INTO has_perm
    USING user_role;

    RETURN COALESCE(has_perm, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's role in an organization
CREATE OR REPLACE FUNCTION get_staff_role(p_user_id UUID, p_org_id UUID)
RETURNS staff_role AS $$
BEGIN
    RETURN (
        SELECT role FROM staff
        WHERE user_id = p_user_id
        AND organization_id = p_org_id
        AND is_active = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all permissions for current user in an org
CREATE OR REPLACE FUNCTION get_my_permissions(p_org_id UUID)
RETURNS TABLE (
    role staff_role,
    permissions JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.role,
        to_jsonb(rp.*) - 'role' - 'description' as permissions
    FROM staff s
    JOIN role_permissions rp ON rp.role = s.role
    WHERE s.user_id = auth.uid()
    AND s.organization_id = p_org_id
    AND s.is_active = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- STEP 4: Update RLS policies for role-based access
-- =============================================

-- Drop existing member policies that need updating
DROP POLICY IF EXISTS "Staff can insert members" ON members;
DROP POLICY IF EXISTS "Staff can update members" ON members;

-- Members: Only staff with can_create_members can insert
CREATE POLICY "Staff with permission can insert members"
    ON members FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM staff s
            JOIN role_permissions rp ON rp.role = s.role
            WHERE s.user_id = auth.uid()
            AND s.organization_id = members.organization_id
            AND s.is_active = TRUE
            AND rp.can_create_members = TRUE
        )
    );

-- Members: Only staff with can_edit_members can update
CREATE POLICY "Staff with permission can update members"
    ON members FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM staff s
            JOIN role_permissions rp ON rp.role = s.role
            WHERE s.user_id = auth.uid()
            AND s.organization_id = members.organization_id
            AND s.is_active = TRUE
            AND rp.can_edit_members = TRUE
        )
    );

-- Drop existing payment policies
DROP POLICY IF EXISTS "Staff can insert payments" ON payments;

-- Payments: Only staff with can_create_payments can insert
CREATE POLICY "Staff with permission can insert payments"
    ON payments FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM staff s
            JOIN role_permissions rp ON rp.role = s.role
            WHERE s.user_id = auth.uid()
            AND s.organization_id = payments.organization_id
            AND s.is_active = TRUE
            AND rp.can_create_payments = TRUE
        )
    );

-- Drop existing check-in policies
DROP POLICY IF EXISTS "Staff can insert check-ins" ON check_ins;

-- Check-ins: Only staff with can_create_checkins can insert
CREATE POLICY "Staff with permission can insert check-ins"
    ON check_ins FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM staff s
            JOIN role_permissions rp ON rp.role = s.role
            WHERE s.user_id = auth.uid()
            AND s.organization_id = check_ins.organization_id
            AND s.is_active = TRUE
            AND rp.can_create_checkins = TRUE
        )
    );

-- Staff management: Only those with can_manage_staff can insert/update staff
CREATE POLICY "Staff with permission can manage staff"
    ON staff FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM staff s
            JOIN role_permissions rp ON rp.role = s.role
            WHERE s.user_id = auth.uid()
            AND s.organization_id = staff.organization_id
            AND s.is_active = TRUE
            AND rp.can_manage_staff = TRUE
        )
    );

CREATE POLICY "Staff with permission can update staff"
    ON staff FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM staff s
            JOIN role_permissions rp ON rp.role = s.role
            WHERE s.user_id = auth.uid()
            AND s.organization_id = staff.organization_id
            AND s.is_active = TRUE
            AND rp.can_manage_staff = TRUE
        )
    );

-- Staff can view other staff in their org if they have permission
CREATE POLICY "Staff can view org staff"
    ON staff FOR SELECT
    USING (
        user_id = auth.uid() -- Can always see own record
        OR EXISTS (
            SELECT 1 FROM staff s
            JOIN role_permissions rp ON rp.role = s.role
            WHERE s.user_id = auth.uid()
            AND s.organization_id = staff.organization_id
            AND s.is_active = TRUE
            AND rp.can_view_staff = TRUE
        )
    );

-- =============================================
-- STEP 5: Update create_organization_with_admin to use 'owner' role
-- =============================================

CREATE OR REPLACE FUNCTION create_organization_with_admin(
    p_org_name TEXT,
    p_org_slug TEXT,
    p_org_type TEXT,
    p_admin_user_id UUID,
    p_admin_name TEXT,
    p_admin_email TEXT
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    slug TEXT,
    org_code TEXT
) AS $$
DECLARE
    new_org_id UUID;
    new_org_code TEXT;
    final_slug TEXT;
BEGIN
    -- Generate unique org code
    new_org_code := generate_org_code(p_org_name);

    -- Ensure slug is unique by appending random suffix if needed
    final_slug := p_org_slug;
    WHILE EXISTS (SELECT 1 FROM organizations WHERE organizations.slug = final_slug) LOOP
        final_slug := p_org_slug || '-' || SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4);
    END LOOP;

    -- Create the organization
    INSERT INTO organizations (name, slug, org_code, settings)
    VALUES (
        p_org_name,
        final_slug,
        new_org_code,
        jsonb_build_object('type', p_org_type)
    )
    RETURNING organizations.id INTO new_org_id;

    -- Create the owner staff record (upgraded from admin)
    INSERT INTO staff (organization_id, user_id, name, email, role)
    VALUES (new_org_id, p_admin_user_id, p_admin_name, p_admin_email, 'owner');

    -- Return the created organization
    RETURN QUERY
    SELECT o.id, o.name, o.slug, o.org_code
    FROM organizations o
    WHERE o.id = new_org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- STEP 6: Enable RLS on role_permissions (public read)
-- =============================================

ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- Anyone can read role permissions (it's just a lookup table)
CREATE POLICY "Anyone can view role permissions"
    ON role_permissions FOR SELECT
    USING (TRUE);
