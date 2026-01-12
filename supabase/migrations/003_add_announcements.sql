-- Migration: Add announcements/news feature
-- Allows staff (owner, admin, secretary) to post announcements to members

-- STEP 1: Create announcements table
CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES staff(id) ON DELETE SET NULL,

    -- Content
    title TEXT NOT NULL,
    content TEXT NOT NULL, -- HTML content from rich text editor

    -- Publishing
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMPTZ,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_announcements_org_id ON announcements(organization_id);
CREATE INDEX idx_announcements_published ON announcements(organization_id, is_published, published_at DESC);

-- STEP 2: Enable RLS
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- STEP 3: RLS Policies

-- Members can view published announcements in their organization
CREATE POLICY "Members can view published announcements"
    ON announcements FOR SELECT
    USING (
        is_published = TRUE
        AND organization_id IN (
            SELECT organization_id FROM members
            WHERE phone = auth.jwt()->>'phone'
        )
    );

-- Staff can view all announcements (including drafts) in their organization
CREATE POLICY "Staff can view all announcements"
    ON announcements FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id FROM staff
            WHERE user_id = auth.uid() AND is_active = TRUE
        )
    );

-- Staff with appropriate roles can create announcements
CREATE POLICY "Staff can create announcements"
    ON announcements FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM staff
            WHERE user_id = auth.uid()
            AND organization_id = announcements.organization_id
            AND is_active = TRUE
            AND role IN ('owner', 'admin', 'secretary')
        )
    );

-- Staff with appropriate roles can update announcements
CREATE POLICY "Staff can update announcements"
    ON announcements FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM staff
            WHERE user_id = auth.uid()
            AND organization_id = announcements.organization_id
            AND is_active = TRUE
            AND role IN ('owner', 'admin', 'secretary')
        )
    );

-- Staff with appropriate roles can delete announcements
CREATE POLICY "Staff can delete announcements"
    ON announcements FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM staff
            WHERE user_id = auth.uid()
            AND organization_id = announcements.organization_id
            AND is_active = TRUE
            AND role IN ('owner', 'admin', 'secretary')
        )
    );

-- STEP 4: Auto-update updated_at trigger
CREATE TRIGGER update_announcements_updated_at
    BEFORE UPDATE ON announcements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- STEP 5: Function to publish announcement (sets published_at timestamp)
CREATE OR REPLACE FUNCTION publish_announcement(announcement_id UUID)
RETURNS announcements AS $$
DECLARE
    result announcements;
BEGIN
    UPDATE announcements
    SET is_published = TRUE,
        published_at = NOW(),
        updated_at = NOW()
    WHERE id = announcement_id
    RETURNING * INTO result;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 6: Function to unpublish announcement
CREATE OR REPLACE FUNCTION unpublish_announcement(announcement_id UUID)
RETURNS announcements AS $$
DECLARE
    result announcements;
BEGIN
    UPDATE announcements
    SET is_published = FALSE,
        updated_at = NOW()
    WHERE id = announcement_id
    RETURNING * INTO result;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
