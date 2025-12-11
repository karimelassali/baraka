
-- Enable RLS on loyalty_points if not already enabled
ALTER TABLE loyalty_points ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists to avoid conflicts
DROP POLICY IF EXISTS "Users can view own points" ON loyalty_points;

-- Create policy to allow users to view their own points
CREATE POLICY "Users can view own points"
ON loyalty_points
FOR SELECT
TO authenticated
USING (
  customer_id IN (
    SELECT id FROM customers WHERE auth_id = auth.uid()
  )
);
