-- 1. Create Gallery Table (if not exists)
CREATE TABLE IF NOT EXISTS gallery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on gallery
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;

-- Policies for gallery (drop first to avoid conflicts if re-running)
DROP POLICY IF EXISTS "Allow public read access" ON gallery;
CREATE POLICY "Allow public read access" ON gallery FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow admin full access" ON gallery;
CREATE POLICY "Allow admin full access" ON gallery FOR ALL USING (auth.role() = 'authenticated'); -- Adjust if you have specific admin roles

-- 2. Add badge_text to offers (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'offers' AND column_name = 'badge_text') THEN
        ALTER TABLE offers ADD COLUMN badge_text TEXT;
    END IF;
END $$;

-- 3. Add reviewer_name to reviews (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'reviewer_name') THEN
        ALTER TABLE reviews ADD COLUMN reviewer_name TEXT;
    END IF;
END $$;

-- 4. Create Storage Bucket for Gallery
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery', 'gallery', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'gallery' );

DROP POLICY IF EXISTS "Authenticated Upload Access" ON storage.objects;
CREATE POLICY "Authenticated Upload Access"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'gallery' AND auth.role() = 'authenticated' );

DROP POLICY IF EXISTS "Authenticated Delete Access" ON storage.objects;
CREATE POLICY "Authenticated Delete Access"
ON storage.objects FOR DELETE
USING ( bucket_id = 'gallery' AND auth.role() = 'authenticated' );

DROP POLICY IF EXISTS "Authenticated Update Access" ON storage.objects;
CREATE POLICY "Authenticated Update Access"
ON storage.objects FOR UPDATE
WITH CHECK ( bucket_id = 'gallery' AND auth.role() = 'authenticated' );
