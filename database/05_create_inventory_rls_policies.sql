-- 05_create_inventory_rls_policies.sql

-- Enable Row Level Security
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_products ENABLE ROW LEVEL SECURITY;

-- Product Categories Policies
-- Admin users can view all categories
CREATE POLICY "Admin users can view all product categories"
  ON product_categories
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.auth_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

-- Admin users can insert categories
CREATE POLICY "Admin users can insert product categories"
  ON product_categories
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.auth_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

-- Admin users can update categories
CREATE POLICY "Admin users can update product categories"
  ON product_categories
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.auth_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

-- Admin users can delete categories
CREATE POLICY "Admin users can delete product categories"
  ON product_categories
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.auth_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

-- Inventory Products Policies
-- Admin users can view all products
CREATE POLICY "Admin users can view all inventory products"
  ON inventory_products
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.auth_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

-- Admin users can insert products
CREATE POLICY "Admin users can insert inventory products"
  ON inventory_products
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.auth_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

-- Admin users can update products
CREATE POLICY "Admin users can update inventory products"
  ON inventory_products
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.auth_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

-- Admin users can delete products
CREATE POLICY "Admin users can delete inventory products"
  ON inventory_products
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.auth_id = auth.uid()
      AND admin_users.is_active = true
    )
  );
