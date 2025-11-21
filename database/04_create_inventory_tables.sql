-- 04_create_inventory_tables.sql

-- Product Categories Table
CREATE TABLE product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#8B5CF6', -- Purple color for UI
  icon TEXT DEFAULT 'package',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES admin_users(id),
  updated_by UUID REFERENCES admin_users(id)
);

-- Inventory Products Table
CREATE TABLE inventory_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Quantity and Stock Management
  quantity DECIMAL(10, 2) NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'pcs', -- pieces, kg, liters, boxes, etc.
  minimum_stock_level DECIMAL(10, 2) DEFAULT 0,
  
  -- Pricing
  purchase_price DECIMAL(10, 2),
  selling_price DECIMAL(10, 2),
  currency TEXT DEFAULT 'EUR',
  
  -- Supplier and Tracking
  supplier_name TEXT,
  supplier_contact TEXT,
  sku TEXT, -- Stock Keeping Unit
  barcode TEXT,
  
  -- Shop Details
  location_in_shop TEXT, -- e.g., "Aisle 3, Shelf B", "Storage Room A"
  
  -- Expiration Tracking (CRITICAL)
  expiration_date DATE NOT NULL,
  batch_number TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Timestamps and Admin Tracking
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES admin_users(id),
  updated_by UUID REFERENCES admin_users(id)
);

-- Add indexes for better query performance
CREATE INDEX idx_inventory_products_category ON inventory_products(category_id);
CREATE INDEX idx_inventory_products_expiration ON inventory_products(expiration_date);
CREATE INDEX idx_inventory_products_sku ON inventory_products(sku);
CREATE INDEX idx_inventory_products_active ON inventory_products(is_active);
CREATE INDEX idx_product_categories_active ON product_categories(is_active);

-- Add update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_categories_updated_at
    BEFORE UPDATE ON product_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_products_updated_at
    BEFORE UPDATE ON inventory_products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
