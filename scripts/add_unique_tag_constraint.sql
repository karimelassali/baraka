-- Run this in your Supabase SQL Editor

-- Add unique constraint to tag_number in eid_purchases
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'eid_purchases_tag_number_key'
    ) THEN
        ALTER TABLE eid_purchases ADD CONSTRAINT eid_purchases_tag_number_key UNIQUE (tag_number);
    END IF;
END $$;
