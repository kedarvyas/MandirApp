-- Migration: Add image support to announcements
-- Adds optional featured image to announcements

-- Add image_url column (nullable for optional images)
ALTER TABLE announcements ADD COLUMN image_url TEXT;

-- Create storage bucket for announcement images
INSERT INTO storage.buckets (id, name, public)
VALUES ('announcement-images', 'announcement-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated staff to upload announcement images
CREATE POLICY "Staff can upload announcement images"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'announcement-images' AND
        auth.role() = 'authenticated'
    );

-- Allow public read access to announcement images
CREATE POLICY "Public read access to announcement images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'announcement-images');

-- Allow staff to update their uploaded images
CREATE POLICY "Staff can update announcement images"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'announcement-images' AND auth.role() = 'authenticated');

-- Allow staff to delete announcement images
CREATE POLICY "Staff can delete announcement images"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'announcement-images' AND auth.role() = 'authenticated');
