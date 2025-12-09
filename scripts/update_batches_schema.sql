-- Run this in your Supabase SQL Editor

-- Add is_pinned to eid_purchase_batches if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'eid_purchase_batches' AND column_name = 'is_pinned') THEN
        ALTER TABLE eid_purchase_batches ADD COLUMN is_pinned BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Ensure RLS is enabled and policy exists
ALTER TABLE eid_purchase_batches ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'eid_purchase_batches' 
        AND policyname = 'Enable all access for authenticated users'
    ) THEN
        CREATE POLICY "Enable all access for authenticated users" ON eid_purchase_batches FOR ALL TO authenticated USING (true);
    END IF;
END $$;
