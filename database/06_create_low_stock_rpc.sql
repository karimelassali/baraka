-- Create a function to get low stock products for notifications
CREATE OR REPLACE FUNCTION get_low_stock_products()
RETURNS TABLE (
  id UUID,
  name TEXT,
  quantity NUMERIC,
  minimum_stock_level NUMERIC,
  unit TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ip.id,
    ip.name,
    ip.quantity,
    ip.minimum_stock_level,
    ip.unit
  FROM 
    inventory_products ip
  WHERE 
    ip.is_active = true 
    AND ip.quantity <= ip.minimum_stock_level
  ORDER BY 
    ip.quantity ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users (or specific roles if needed)
GRANT EXECUTE ON FUNCTION get_low_stock_products() TO authenticated;
