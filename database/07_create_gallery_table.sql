-- 07_create_gallery_table.sql

CREATE TABLE gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID
);

-- Enable RLS
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public can view gallery" ON gallery
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert gallery" ON gallery
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.auth_id = auth.uid()
    )
  );

CREATE POLICY "Admins can delete gallery" ON gallery
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.auth_id = auth.uid()
    )
  );
