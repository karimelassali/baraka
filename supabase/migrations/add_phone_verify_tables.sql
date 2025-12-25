-- Create OTP codes table
CREATE TABLE IF NOT EXISTS public.otp_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    phone_number TEXT NOT NULL,
    code VARCHAR(10) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '10 minutes'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_otp_phone ON public.otp_codes(phone_number);

-- Add verification status to customers if not exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'is_verified') THEN 
        ALTER TABLE public.customers ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Policies (Enable RLS for security)
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

-- Allow public access to insert/select (controlled by API)
-- In a real prod scenario, we might restrict this further, but for now we need API access
CREATE POLICY "Enable generic access for server" ON public.otp_codes
    USING (true)
    WITH CHECK (true);
