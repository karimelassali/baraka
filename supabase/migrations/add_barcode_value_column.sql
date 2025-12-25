-- Add barcode_value column to customers table for efficient scanning
-- This stores the short 12-character barcode value derived from the UUID

-- 1. Add the column
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS barcode_value VARCHAR(12);

-- 2. Populate existing customers with their barcode values
-- (First 12 chars of UUID without dashes, uppercase)
UPDATE customers 
SET barcode_value = UPPER(REPLACE(SUBSTRING(id::text, 1, 13), '-', ''))
WHERE barcode_value IS NULL;

-- 3. Create an index for fast lookups
CREATE INDEX IF NOT EXISTS idx_customers_barcode_value 
ON customers(barcode_value);

-- 4. Create a trigger to auto-populate for new customers
CREATE OR REPLACE FUNCTION set_customer_barcode_value()
RETURNS TRIGGER AS $$
BEGIN
    NEW.barcode_value := UPPER(REPLACE(SUBSTRING(NEW.id::text, 1, 13), '-', ''));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_barcode_value ON customers;
CREATE TRIGGER trigger_set_barcode_value
    BEFORE INSERT ON customers
    FOR EACH ROW
    EXECUTE FUNCTION set_customer_barcode_value();
