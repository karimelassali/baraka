-- Add price column to eid_cattle_groups
ALTER TABLE eid_cattle_groups ADD COLUMN IF NOT EXISTS price DECIMAL(10, 2);

-- Ensure status column has correct check constraint if needed (it seems fine from schema, but good to be safe)
-- ALTER TABLE eid_cattle_groups DROP CONSTRAINT IF EXISTS eid_cattle_groups_status_check;
-- ALTER TABLE eid_cattle_groups ADD CONSTRAINT eid_cattle_groups_status_check CHECK (status IN ('PENDING', 'PAID', 'COMPLETED', 'CANCELLED'));
