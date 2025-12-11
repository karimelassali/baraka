-- Add image_url column
ALTER TABLE qr_codes ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create storage bucket if not exists (requires storage extension)
INSERT INTO storage.buckets (id, name, public)
VALUES ('qr-codes', 'qr-codes', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies (adjust as needed for your specific setup)
-- Allow public read access
CREATE POLICY "Public Access QR Codes"
ON storage.objects FOR SELECT
USING ( bucket_id = 'qr-codes' );

-- Allow admin insert access
CREATE POLICY "Admin Insert QR Codes"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'qr-codes' AND
    EXISTS (
        SELECT 1 FROM admin_users 
        WHERE admin_users.auth_id = auth.uid()
    )
);
