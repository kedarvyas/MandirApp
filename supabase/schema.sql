-- Mandir App Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- ORGANIZATIONS TABLE
-- For future multi-tenancy support
-- =============================================
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    org_code TEXT UNIQUE NOT NULL, -- Human-readable code for mobile app entry (e.g., "TEMPLE-ABC123")
    logo_url TEXT,
    primary_color TEXT DEFAULT '#800020', -- Maroon default
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast org_code lookups (used during mobile app login)
CREATE INDEX idx_organizations_org_code ON organizations(org_code);

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

-- Insert default organization
INSERT INTO organizations (id, name, slug, org_code)
VALUES ('00000000-0000-0000-0000-000000000001', 'Mandir', 'mandir', 'MANDIR-000001');

-- =============================================
-- FAMILY GROUPS TABLE
-- =============================================
CREATE TABLE family_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) DEFAULT '00000000-0000-0000-0000-000000000001',
    prime_member_id UUID, -- Will be set after member is created
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- MEMBERS TABLE
-- =============================================
CREATE TYPE member_status AS ENUM ('pending_invite', 'pending_registration', 'active', 'inactive');
CREATE TYPE relationship_type AS ENUM ('self', 'spouse', 'child', 'parent', 'in_law', 'sibling', 'other');

CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) DEFAULT '00000000-0000-0000-0000-000000000001',
    family_group_id UUID REFERENCES family_groups(id),
    phone TEXT,
    email TEXT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    photo_url TEXT,
    is_prime_member BOOLEAN DEFAULT FALSE,
    is_independent BOOLEAN DEFAULT TRUE,
    relationship_to_prime relationship_type DEFAULT 'self',
    qr_token UUID UNIQUE DEFAULT uuid_generate_v4(),
    status member_status DEFAULT 'pending_invite',
    membership_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Phone must be unique within an organization (for non-dependents)
    UNIQUE(organization_id, phone)
);

-- Add foreign key for prime_member_id after members table exists
ALTER TABLE family_groups
    ADD CONSTRAINT fk_prime_member
    FOREIGN KEY (prime_member_id) REFERENCES members(id);

-- =============================================
-- PAYMENTS TABLE
-- =============================================
CREATE TYPE payment_method AS ENUM ('check', 'cash', 'card', 'other');

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) DEFAULT '00000000-0000-0000-0000-000000000001',
    family_group_id UUID REFERENCES family_groups(id) NOT NULL,
    member_id UUID REFERENCES members(id) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method payment_method NOT NULL,
    recorded_by UUID,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CHECK-INS TABLE
-- =============================================
CREATE TABLE check_ins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) DEFAULT '00000000-0000-0000-0000-000000000001',
    member_id UUID REFERENCES members(id) NOT NULL,
    checked_in_by UUID,
    checked_in_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT
);

-- =============================================
-- STAFF TABLE (for front desk users)
-- =============================================
CREATE TYPE staff_role AS ENUM ('admin', 'staff');

CREATE TABLE staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) DEFAULT '00000000-0000-0000-0000-000000000001',
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    role staff_role DEFAULT 'staff',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(organization_id, user_id)
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_members_phone ON members(phone);
CREATE INDEX idx_members_family_group ON members(family_group_id);
CREATE INDEX idx_members_qr_token ON members(qr_token);
CREATE INDEX idx_members_status ON members(status);
CREATE INDEX idx_check_ins_member ON check_ins(member_id);
CREATE INDEX idx_check_ins_date ON check_ins(checked_in_at);
CREATE INDEX idx_payments_family_group ON payments(family_group_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

-- Members can read their own data
CREATE POLICY "Members can view own profile"
    ON members FOR SELECT
    USING (phone = auth.jwt()->>'phone');

-- Members can update their own profile
CREATE POLICY "Members can update own profile"
    ON members FOR UPDATE
    USING (phone = auth.jwt()->>'phone');

-- Members can view their family members
CREATE POLICY "Members can view family"
    ON members FOR SELECT
    USING (
        family_group_id IN (
            SELECT family_group_id FROM members WHERE phone = auth.jwt()->>'phone'
        )
    );

-- Staff can view all members in their organization
CREATE POLICY "Staff can view all members"
    ON members FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id FROM staff
            WHERE user_id = auth.uid() AND is_active = TRUE
        )
    );

-- Staff can insert new members
CREATE POLICY "Staff can insert members"
    ON members FOR INSERT
    WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM staff
            WHERE user_id = auth.uid() AND is_active = TRUE
        )
    );

-- Staff can update members
CREATE POLICY "Staff can update members"
    ON members FOR UPDATE
    USING (
        organization_id IN (
            SELECT organization_id FROM staff
            WHERE user_id = auth.uid() AND is_active = TRUE
        )
    );

-- Check-ins policies
CREATE POLICY "Members can view own check-ins"
    ON check_ins FOR SELECT
    USING (
        member_id IN (
            SELECT id FROM members WHERE phone = auth.jwt()->>'phone'
        )
    );

CREATE POLICY "Staff can view all check-ins"
    ON check_ins FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id FROM staff
            WHERE user_id = auth.uid() AND is_active = TRUE
        )
    );

CREATE POLICY "Staff can insert check-ins"
    ON check_ins FOR INSERT
    WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM staff
            WHERE user_id = auth.uid() AND is_active = TRUE
        )
    );

-- Payments policies
CREATE POLICY "Staff can view payments"
    ON payments FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id FROM staff
            WHERE user_id = auth.uid() AND is_active = TRUE
        )
    );

CREATE POLICY "Staff can insert payments"
    ON payments FOR INSERT
    WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM staff
            WHERE user_id = auth.uid() AND is_active = TRUE
        )
    );

-- Family groups policies
CREATE POLICY "Members can view own family group"
    ON family_groups FOR SELECT
    USING (
        id IN (
            SELECT family_group_id FROM members WHERE phone = auth.jwt()->>'phone'
        )
    );

CREATE POLICY "Staff can manage family groups"
    ON family_groups FOR ALL
    USING (
        organization_id IN (
            SELECT organization_id FROM staff
            WHERE user_id = auth.uid() AND is_active = TRUE
        )
    );

-- Staff policies
CREATE POLICY "Staff can view own record"
    ON staff FOR SELECT
    USING (user_id = auth.uid());

-- =============================================
-- STORAGE BUCKET FOR PHOTOS
-- =============================================
-- Run this separately in Storage section or via SQL:

INSERT INTO storage.buckets (id, name, public)
VALUES ('member-photos', 'member-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their own photos
CREATE POLICY "Users can upload own photos"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'member-photos' AND
        auth.role() = 'authenticated'
    );

-- Allow public read access to photos
CREATE POLICY "Public read access to photos"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'member-photos');

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function to get member by QR token
CREATE OR REPLACE FUNCTION get_member_by_qr(token UUID)
RETURNS TABLE (
    id UUID,
    first_name TEXT,
    last_name TEXT,
    photo_url TEXT,
    phone TEXT,
    email TEXT,
    membership_date DATE,
    status member_status,
    family_group_id UUID,
    is_prime_member BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        m.id,
        m.first_name,
        m.last_name,
        m.photo_url,
        m.phone,
        m.email,
        m.membership_date,
        m.status,
        m.family_group_id,
        m.is_prime_member
    FROM members m
    WHERE m.qr_token = token AND m.status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get family members
CREATE OR REPLACE FUNCTION get_family_members(group_id UUID)
RETURNS TABLE (
    id UUID,
    first_name TEXT,
    last_name TEXT,
    photo_url TEXT,
    relationship_to_prime relationship_type,
    is_independent BOOLEAN,
    has_qr BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        m.id,
        m.first_name,
        m.last_name,
        m.photo_url,
        m.relationship_to_prime,
        m.is_independent,
        (m.qr_token IS NOT NULL AND m.is_independent) as has_qr
    FROM members m
    WHERE m.family_group_id = group_id
    ORDER BY
        CASE m.relationship_to_prime
            WHEN 'self' THEN 1
            WHEN 'spouse' THEN 2
            WHEN 'child' THEN 3
            WHEN 'parent' THEN 4
            WHEN 'in_law' THEN 5
            WHEN 'sibling' THEN 6
            ELSE 7
        END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- ORGANIZATION MANAGEMENT FUNCTIONS
-- =============================================

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
