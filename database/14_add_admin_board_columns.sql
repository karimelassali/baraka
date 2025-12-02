-- Add new columns to admin_notes table
ALTER TABLE admin_notes 
ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS drawing TEXT,
ADD COLUMN IF NOT EXISTS links JSONB DEFAULT '[]'::jsonb;

-- Create storage bucket for admin note attachments if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('admin-attachments', 'admin-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow authenticated users to upload to admin-attachments
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Allow authenticated uploads'
        AND cmd = 'INSERT'
    ) THEN
        CREATE POLICY "Allow authenticated uploads" ON storage.objects
        FOR INSERT TO authenticated
        WITH CHECK (bucket_id = 'admin-attachments');
    END IF;
END
$$;

-- Policy to allow authenticated users to view admin-attachments
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Allow authenticated viewing'
        AND cmd = 'SELECT'
    ) THEN
        CREATE POLICY "Allow authenticated viewing" ON storage.objects
        FOR SELECT TO authenticated
        USING (bucket_id = 'admin-attachments');
    END IF;
END
$$;
