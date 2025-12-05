-- Create wishlists table
CREATE TABLE IF NOT EXISTS public.wishlists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

-- Policies
-- Users can view their own wishlists
CREATE POLICY "Users can view own wishlists" ON public.wishlists
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own wishlists
CREATE POLICY "Users can insert own wishlists" ON public.wishlists
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Admins can view all wishlists
-- Assuming admins are identified by a specific role or metadata, but for now allowing authenticated users to view if they are admin.
-- Adjust this policy based on your actual admin check.
-- For now, I'll assume a simple check or that the admin API uses a service role key which bypasses RLS.
-- If you have a specific admin role, add it here.
-- Example: AND (auth.jwt() ->> 'role' = 'service_role') OR (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'))

-- For simplicity in this step, I will rely on the service role for admin operations (which bypasses RLS)
-- and the user policies for client operations.

-- Create a trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_wishlists_updated_at
    BEFORE UPDATE ON public.wishlists
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
