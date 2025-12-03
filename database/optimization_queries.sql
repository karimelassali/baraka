-- Database Optimization Queries
-- Run this script in your Supabase SQL Editor

-- 1. Indexes for Performance
-- Speed up client existence check
CREATE INDEX IF NOT EXISTS idx_customers_phone_number ON public.customers(phone_number);
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);

-- Speed up inventory filtering
CREATE INDEX IF NOT EXISTS idx_inventory_products_is_active ON public.inventory_products(is_active);
CREATE INDEX IF NOT EXISTS idx_inventory_products_expiration_date ON public.inventory_products(expiration_date);
CREATE INDEX IF NOT EXISTS idx_inventory_products_category_id ON public.inventory_products(category_id);

-- Speed up points and vouchers lookups
CREATE INDEX IF NOT EXISTS idx_loyalty_points_customer_id ON public.loyalty_points(customer_id);
CREATE INDEX IF NOT EXISTS idx_vouchers_customer_id ON public.vouchers(customer_id);
CREATE INDEX IF NOT EXISTS idx_vouchers_is_used ON public.vouchers(is_used);
CREATE INDEX IF NOT EXISTS idx_reviews_is_approved ON public.reviews(is_approved);
CREATE INDEX IF NOT EXISTS idx_daily_revenue_date ON public.daily_revenue(date);

-- 2. RPC: Analytics Overview
CREATE OR REPLACE FUNCTION get_analytics_overview()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_customers bigint;
  active_offers bigint;
  pending_reviews bigint;
  total_vouchers bigint;
  redeemed_vouchers bigint;
  total_voucher_value numeric;
  redeemed_voucher_value numeric;
  total_messages bigint;
BEGIN
  SELECT count(*) INTO total_customers FROM customers;
  SELECT count(*) INTO active_offers FROM offers WHERE is_active = true;
  SELECT count(*) INTO pending_reviews FROM reviews WHERE is_approved = false;
  
  SELECT count(*), COALESCE(SUM(value), 0) 
  INTO total_vouchers, total_voucher_value 
  FROM vouchers;
  
  SELECT count(*), COALESCE(SUM(value), 0) 
  INTO redeemed_vouchers, redeemed_voucher_value 
  FROM vouchers 
  WHERE is_used = true;
  
  SELECT count(*) INTO total_messages FROM whatsapp_messages;
  
  RETURN json_build_object(
    'totalCustomers', total_customers,
    'activeOffers', active_offers,
    'pendingReviews', pending_reviews,
    'totalVouchers', total_vouchers,
    'redeemedVouchers', redeemed_vouchers,
    'totalVoucherValue', total_voucher_value,
    'redeemedVoucherValue', redeemed_voucher_value,
    'totalMessages', total_messages
  );
END;
$$;

-- 3. RPC: Inventory Analytics
CREATE OR REPLACE FUNCTION get_inventory_analytics()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_products bigint;
  low_stock_items json;
  expiring_soon_items json;
  total_value numeric;
  total_sales_value numeric;
  category_stats json;
BEGIN
  -- Total Products
  SELECT count(*) INTO total_products FROM inventory_products WHERE is_active = true;

  -- Low Stock Items (Top 5)
  SELECT json_agg(t) INTO low_stock_items FROM (
    SELECT * FROM inventory_products 
    WHERE is_active = true AND quantity <= minimum_stock_level
    LIMIT 5
  ) t;

  -- Expiring Soon Items (Top 5, next 30 days)
  SELECT json_agg(t) INTO expiring_soon_items FROM (
    SELECT * FROM inventory_products 
    WHERE is_active = true 
    AND expiration_date >= CURRENT_DATE 
    AND expiration_date <= (CURRENT_DATE + INTERVAL '30 days')
    LIMIT 5
  ) t;

  -- Total Values
  SELECT 
    COALESCE(SUM(quantity * purchase_price), 0),
    COALESCE(SUM(quantity * selling_price), 0)
  INTO total_value, total_sales_value
  FROM inventory_products
  WHERE is_active = true;

  -- Category Stats
  SELECT json_agg(t) INTO category_stats FROM (
    SELECT 
      c.name, 
      c.color,
      COUNT(p.id) as value
    FROM product_categories c
    JOIN inventory_products p ON p.category_id = c.id
    WHERE p.is_active = true
    GROUP BY c.id, c.name, c.color
    HAVING COUNT(p.id) > 0
  ) t;

  RETURN json_build_object(
    'totalProducts', total_products,
    'lowStockCount', (SELECT count(*) FROM inventory_products WHERE is_active = true AND quantity <= minimum_stock_level),
    'expiringSoonCount', (SELECT count(*) FROM inventory_products WHERE is_active = true AND expiration_date >= CURRENT_DATE AND expiration_date <= (CURRENT_DATE + INTERVAL '30 days')),
    'lowStockItems', COALESCE(low_stock_items, '[]'::json),
    'expiringSoonItems', COALESCE(expiring_soon_items, '[]'::json),
    'totalValue', total_value,
    'totalSalesValue', total_sales_value,
    'categoryStats', COALESCE(category_stats, '[]'::json)
  );
END;
$$;

-- 4. RPC: Customer Points Balance
CREATE OR REPLACE FUNCTION get_customer_points_balance(p_customer_id uuid)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  balance numeric;
BEGIN
  SELECT COALESCE(SUM(points), 0) INTO balance
  FROM loyalty_points
  WHERE customer_id = p_customer_id;
  
  RETURN balance;
END;
$$;

-- 5. View: Admin Customers Extended
-- Joins customers with auth.users and aggregates points/vouchers
-- Note: Requires permissions to access auth.users if not using service_role
CREATE OR REPLACE VIEW admin_customers_extended AS
SELECT 
  c.id,
  c.auth_id,
  c.first_name,
  c.last_name,
  c.email, -- From customers table
  c.phone_number,
  c.country_of_origin,
  c.residence,
  c.created_at,
  c.is_active,
  u.email as auth_email,
  u.email_confirmed_at,
  COALESCE((SELECT SUM(points) FROM loyalty_points lp WHERE lp.customer_id = c.id), 0) as total_points,
  (SELECT COUNT(*) FROM vouchers v WHERE v.customer_id = c.id) as vouchers_count
FROM public.customers c
LEFT JOIN auth.users u ON c.auth_id = u.id;

-- Grant access to authenticated users (or service role)
GRANT SELECT ON admin_customers_extended TO authenticated;
GRANT SELECT ON admin_customers_extended TO service_role;
