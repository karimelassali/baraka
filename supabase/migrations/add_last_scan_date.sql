-- Migration: Add activity tracking columns to customers table
-- Used for SMS retargeting campaign

-- 1. Add last_scan_date to track when they last visited/scanned
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS last_scan_date TIMESTAMPTZ;

-- 2. Add last_retarget_date to prevent spamming SMS
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS last_retarget_date TIMESTAMPTZ;

-- 3. Create index for efficient querying of inactive users
CREATE INDEX IF NOT EXISTS idx_customers_last_scan_date 
ON customers(last_scan_date);

-- 4. Create index for retargeting query
CREATE INDEX IF NOT EXISTS idx_customers_last_retarget_date 
ON customers(last_retarget_date);
