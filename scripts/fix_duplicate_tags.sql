-- Run this in your Supabase SQL Editor

-- 1. Resolve duplicates by appending a suffix (e.g., '101' -> '101-dup-1')
DO $$
DECLARE
    r RECORD;
    dup_row RECORD;
    i INTEGER;
BEGIN
    -- Loop through all tag numbers that have duplicates
    FOR r IN
        SELECT tag_number
        FROM eid_purchases
        GROUP BY tag_number
        HAVING count(*) > 1
    LOOP
        i := 1;
        -- Loop through the duplicate rows for this tag, skipping the first one (keeping the oldest)
        FOR dup_row IN
            SELECT id
            FROM eid_purchases
            WHERE tag_number = r.tag_number
            ORDER BY created_at ASC
            OFFSET 1 -- Skip the first one (keep it as is)
        LOOP
            -- Update the duplicate with a suffix
            UPDATE eid_purchases
            SET tag_number = r.tag_number || '-dup-' || i
            WHERE id = dup_row.id;
            
            i := i + 1;
        END LOOP;
    END LOOP;
END $$;

-- 2. Now that duplicates are resolved, add the unique constraint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'eid_purchases_tag_number_key'
    ) THEN
        ALTER TABLE eid_purchases ADD CONSTRAINT eid_purchases_tag_number_key UNIQUE (tag_number);
    END IF;
END $$;
