-- Create system_settings table
CREATE TABLE IF NOT EXISTS system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default theme setting if not exists
INSERT INTO system_settings (key, value)
VALUES ('active_theme', '"default"'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Enable RLS
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Policies

-- Allow public read access (so frontend can load the theme)
CREATE POLICY "Allow public read access to system_settings"
  ON system_settings FOR SELECT
  USING (true);

-- Allow admin full access
-- Assuming 'admins' table exists and maps auth.uid() to admin users
CREATE POLICY "Allow admin full access to system_settings"
  ON system_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
    )
  );
