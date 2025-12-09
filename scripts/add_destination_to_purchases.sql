-- Run this in your Supabase SQL Editor

-- Add destination to eid_purchases if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'eid_purchases' AND column_name = 'destination') THEN
        ALTER TABLE eid_purchases ADD COLUMN destination TEXT;
    END IF;
END $$;
