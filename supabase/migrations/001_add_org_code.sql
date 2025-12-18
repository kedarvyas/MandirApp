-- Migration: Add org_code column to organizations table
-- Run this on existing databases to enable B2B multi-tenancy

-- Add new columns
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS org_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#800020',
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Create index for fast org_code lookups
CREATE INDEX IF NOT EXISTS idx_organizations_org_code ON organizations(org_code);

-- Function to generate a unique org code
CREATE OR REPLACE FUNCTION generate_org_code(org_name TEXT)
RETURNS TEXT AS $$
DECLARE
    prefix TEXT;
    suffix TEXT;
    new_code TEXT;
    attempts INT := 0;
BEGIN
    -- Create prefix from org name (first 6 chars, uppercase, alphanumeric only)
    prefix := UPPER(REGEXP_REPLACE(LEFT(org_name, 6), '[^A-Z0-9]', '', 'g'));
    IF LENGTH(prefix) < 3 THEN
        prefix := 'ORG';
    END IF;

    LOOP
        -- Generate random 6-character alphanumeric suffix
        suffix := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
        new_code := prefix || '-' || suffix;

        -- Check if code exists
        IF NOT EXISTS (SELECT 1 FROM organizations WHERE org_code = new_code) THEN
            RETURN new_code;
        END IF;

        attempts := attempts + 1;
        IF attempts > 100 THEN
            RAISE EXCEPTION 'Could not generate unique org code';
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Update existing organizations without org_code
UPDATE organizations
SET org_code = generate_org_code(name)
WHERE org_code IS NULL;

-- Make org_code NOT NULL after populating existing records
ALTER TABLE organizations
ALTER COLUMN org_code SET NOT NULL;

-- Function to lookup organization by code (for mobile app)
CREATE OR REPLACE FUNCTION get_organization_by_code(code TEXT)
RETURNS TABLE (
    id UUID,
    name TEXT,
    slug TEXT,
    org_code TEXT,
    logo_url TEXT,
    primary_color TEXT,
    is_active BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        o.id,
        o.name,
        o.slug,
        o.org_code,
        o.logo_url,
        o.primary_color,
        o.is_active
    FROM organizations o
    WHERE UPPER(o.org_code) = UPPER(code)
    AND o.is_active = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create organization with admin in one transaction
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

    -- Create the admin staff record
    INSERT INTO staff (organization_id, user_id, name, email, role)
    VALUES (new_org_id, p_admin_user_id, p_admin_name, p_admin_email, 'admin');

    -- Return the created organization
    RETURN QUERY
    SELECT o.id, o.name, o.slug, o.org_code
    FROM organizations o
    WHERE o.id = new_org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for organizations

-- Policy to allow creating organizations (for signup)
CREATE POLICY "Authenticated users can create organizations"
    ON organizations FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Policy to allow admins to view their organization
CREATE POLICY "Staff can view their organization"
    ON organizations FOR SELECT
    USING (
        id IN (
            SELECT organization_id FROM staff
            WHERE user_id = auth.uid() AND is_active = TRUE
        )
    );

-- Policy to allow admins to update their organization
CREATE POLICY "Admins can update their organization"
    ON organizations FOR UPDATE
    USING (
        id IN (
            SELECT organization_id FROM staff
            WHERE user_id = auth.uid() AND role = 'admin' AND is_active = TRUE
        )
    );
