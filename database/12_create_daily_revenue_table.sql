-- Create daily_revenue table
CREATE TABLE IF NOT EXISTS daily_revenue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    total_revenue DECIMAL(10, 2) NOT NULL DEFAULT 0,
    cash DECIMAL(10, 2) NOT NULL DEFAULT 0,
    card DECIMAL(10, 2) NOT NULL DEFAULT 0,
    ticket DECIMAL(10, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE daily_revenue ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to manage daily_revenue
CREATE POLICY "Admins can manage daily_revenue" ON daily_revenue
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.auth_id = auth.uid()
        )
    );

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_daily_revenue_updated_at ON daily_revenue;
CREATE TRIGGER update_daily_revenue_updated_at
    BEFORE UPDATE ON daily_revenue
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
