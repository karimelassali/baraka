-- Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE gdpr_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for customers table
-- Allow users to view their own data
CREATE POLICY "Users can view own data" ON customers
FOR SELECT TO authenticated
USING (auth_id = auth.uid());

-- Allow users to update their own data
CREATE POLICY "Users can update own data" ON customers
FOR UPDATE TO authenticated
USING (auth_id = auth.uid())
WITH CHECK (auth_id = auth.uid());

-- Allow service role to access all customer data
CREATE POLICY "Service role can access all customers" ON customers
FOR ALL TO service_role
USING (TRUE)
WITH CHECK (TRUE);

-- Allow admin users to view all customer data
CREATE POLICY "Admins can view all customers" ON customers
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.auth_id = auth.uid()
    AND admin_users.is_active = TRUE
  )
);

-- Allow admin users to update customer data
CREATE POLICY "Admins can update customers" ON customers
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.auth_id = auth.uid()
    AND admin_users.is_active = TRUE
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.auth_id = auth.uid()
    AND admin_users.is_active = TRUE
  )
);

-- Create policies for loyalty_points table
-- Allow users to view their own points
CREATE POLICY "Users can view own points" ON loyalty_points
FOR SELECT TO authenticated
USING (customer_id = (
  SELECT id FROM customers
  WHERE auth_id = auth.uid()
));

-- Allow service role to access all points data
CREATE POLICY "Service role can access all points" ON loyalty_points
FOR ALL TO service_role
USING (TRUE)
WITH CHECK (TRUE);

-- Allow admin users to view all points data
CREATE POLICY "Admins can view all points" ON loyalty_points
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.auth_id = auth.uid()
    AND admin_users.is_active = TRUE
  )
);

-- Allow admin users to manage points
CREATE POLICY "Admins can manage points" ON loyalty_points
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.auth_id = auth.uid()
    AND admin_users.is_active = TRUE
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.auth_id = auth.uid()
    AND admin_users.is_active = TRUE
  )
);

-- Create policies for vouchers table
-- Allow users to view their own vouchers
CREATE POLICY "Users can view own vouchers" ON vouchers
FOR SELECT TO authenticated
USING (customer_id = (
  SELECT id FROM customers
  WHERE auth_id = auth.uid()
));

-- Allow users to update their own vouchers (e.g., mark as used)
CREATE POLICY "Users can update own vouchers" ON vouchers
FOR UPDATE TO authenticated
USING (
  customer_id = (
    SELECT id FROM customers
    WHERE auth_id = auth.uid()
  )
)
WITH CHECK (
  customer_id = (
    SELECT id FROM customers
    WHERE auth_id = auth.uid()
  )
);

-- Allow service role to access all vouchers
CREATE POLICY "Service role can access all vouchers" ON vouchers
FOR ALL TO service_role
USING (TRUE)
WITH CHECK (TRUE);

-- Allow admin users to view all vouchers
CREATE POLICY "Admins can view all vouchers" ON vouchers
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.auth_id = auth.uid()
    AND admin_users.is_active = TRUE
  )
);

-- Allow admin users to manage all vouchers
CREATE POLICY "Admins can manage all vouchers" ON vouchers
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.auth_id = auth.uid()
    AND admin_users.is_active = TRUE
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.auth_id = auth.uid()
    AND admin_users.is_active = TRUE
  )
);

-- Create policies for offers table
-- Allow anyone to view active offers
CREATE POLICY "Anyone can view active offers" ON offers
FOR SELECT TO authenticated, anon
USING (is_active = TRUE);

-- Allow admin users to manage offers
CREATE POLICY "Admins can manage offers" ON offers
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.auth_id = auth.uid()
    AND admin_users.is_active = TRUE
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.auth_id = auth.uid()
    AND admin_users.is_active = TRUE
  )
);

-- Allow service role to access all offers
CREATE POLICY "Service role can access all offers" ON offers
FOR ALL TO service_role
USING (TRUE)
WITH CHECK (TRUE);

-- Create policies for reviews table
-- Allow anyone to view approved reviews
CREATE POLICY "Anyone can view approved reviews" ON reviews
FOR SELECT TO authenticated, anon
USING (is_approved = TRUE);

-- Allow users to create their own reviews
CREATE POLICY "Users can create own reviews" ON reviews
FOR INSERT TO authenticated
WITH CHECK (customer_id = (
  SELECT id FROM customers
  WHERE auth_id = auth.uid()
));

-- Allow users to update their own reviews
CREATE POLICY "Users can update own reviews" ON reviews
FOR UPDATE TO authenticated
USING (customer_id = (
  SELECT id FROM customers
  WHERE auth_id = auth.uid()
))
WITH CHECK (customer_id = (
  SELECT id FROM customers
  WHERE auth_id = auth.uid()
));

-- Allow admin users to manage all reviews
CREATE POLICY "Admins can manage all reviews" ON reviews
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.auth_id = auth.uid()
    AND admin_users.is_active = TRUE
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.auth_id = auth.uid()
    AND admin_users.is_active = TRUE
  )
);

-- Allow service role to access all reviews
CREATE POLICY "Service role can access all reviews" ON reviews
FOR ALL TO service_role
USING (TRUE)
WITH CHECK (TRUE);

-- Create policies for admin_users table
-- Allow service role to access all admin users
CREATE POLICY "Service role can access all admin users" ON admin_users
FOR ALL TO service_role
USING (TRUE)
WITH CHECK (TRUE);

-- Allow admin users to view all admin users
CREATE POLICY "Admins can view all admin users" ON admin_users
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.auth_id = auth.uid()
    AND admin_users.is_active = TRUE
  )
);

-- Create policies for whatsapp_messages table
-- Allow service role to access all whatsapp messages
CREATE POLICY "Service role can access all whatsapp messages" ON whatsapp_messages
FOR ALL TO service_role
USING (TRUE)
WITH CHECK (TRUE);

-- Allow admin users to view all whatsapp messages
CREATE POLICY "Admins can view all whatsapp messages" ON whatsapp_messages
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.auth_id = auth.uid()
    AND admin_users.is_active = TRUE
  )
);

-- Allow admin users to manage whatsapp messages
CREATE POLICY "Admins can manage whatsapp messages" ON whatsapp_messages
FOR INSERT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.auth_id = auth.uid()
    AND admin_users.is_active = TRUE
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.auth_id = auth.uid()
    AND admin_users.is_active = TRUE
  )
);

-- Create policies for settings table
-- Allow service role to access all settings
CREATE POLICY "Service role can access all settings" ON settings
FOR ALL TO service_role
USING (TRUE)
WITH CHECK (TRUE);

-- Allow admin users to view settings
CREATE POLICY "Admins can view settings" ON settings
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.auth_id = auth.uid()
    AND admin_users.is_active = TRUE
  )
);

-- Allow admin users to update settings
CREATE POLICY "Admins can update settings" ON settings
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.auth_id = auth.uid()
    AND admin_users.is_active = TRUE
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.auth_id = auth.uid()
    AND admin_users.is_active = TRUE
  )
);

-- Create policies for gdpr_logs table
-- Allow service role to access all gdpr logs
CREATE POLICY "Service role can access all gdpr logs" ON gdpr_logs
FOR ALL TO service_role
USING (TRUE)
WITH CHECK (TRUE);

-- Allow users to view their own gdpr logs
CREATE POLICY "Users can view own gdpr logs" ON gdpr_logs
FOR SELECT TO authenticated
USING (customer_id = (
  SELECT id FROM customers
  WHERE auth_id = auth.uid()
));

-- Allow admin users to view all gdpr logs
CREATE POLICY "Admins can view all gdpr logs" ON gdpr_logs
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.auth_id = auth.uid()
    AND admin_users.is_active = TRUE
  )
);