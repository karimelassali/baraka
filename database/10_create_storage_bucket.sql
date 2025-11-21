-- Create the storage bucket for gallery images
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery', 'gallery', true)
ON CONFLICT (id) DO NOTHING;

-- Set up security policies for the gallery bucket

-- Allow public read access to all files in the gallery bucket
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'gallery' );

-- Allow authenticated users to upload files (Refine this to admins only if needed later)
CREATE POLICY "Authenticated Upload Access"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'gallery' AND auth.role() = 'authenticated' );

-- Allow authenticated users to delete files
CREATE POLICY "Authenticated Delete Access"
ON storage.objects FOR DELETE
USING ( bucket_id = 'gallery' AND auth.role() = 'authenticated' );

-- Allow authenticated users to update files
CREATE POLICY "Authenticated Update Access"
ON storage.objects FOR UPDATE
WITH CHECK ( bucket_id = 'gallery' AND auth.role() = 'authenticated' );
