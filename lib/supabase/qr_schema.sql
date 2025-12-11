-- Create qr_codes table
CREATE TABLE IF NOT EXISTS qr_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    target_url TEXT NOT NULL DEFAULT '/',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Create qr_scans table
CREATE TABLE IF NOT EXISTS qr_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    qr_code_id UUID REFERENCES qr_codes(id) ON DELETE CASCADE,
    scanned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address TEXT,
    user_agent TEXT,
    device_info JSONB
);

-- Enable RLS
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_scans ENABLE ROW LEVEL SECURITY;

-- Policies for qr_codes
CREATE POLICY "Allow admins to read qr_codes" ON qr_codes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.auth_id = auth.uid()
        )
    );

CREATE POLICY "Allow admins to insert qr_codes" ON qr_codes
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.auth_id = auth.uid()
        )
    );

CREATE POLICY "Allow admins to update qr_codes" ON qr_codes
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.auth_id = auth.uid()
        )
    );

CREATE POLICY "Allow admins to delete qr_codes" ON qr_codes
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.auth_id = auth.uid()
        )
    );

-- Public read access for redirection (needed for the API to look up the code)
CREATE POLICY "Allow public read access to qr_codes" ON qr_codes
    FOR SELECT USING (true);


-- Policies for qr_scans
CREATE POLICY "Allow admins to read qr_scans" ON qr_scans
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.auth_id = auth.uid()
        )
    );

-- Allow public insert for qr_scans (tracking)
CREATE POLICY "Allow public insert to qr_scans" ON qr_scans
    FOR INSERT WITH CHECK (true);
