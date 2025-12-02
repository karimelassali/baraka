-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  due_date DATE NOT NULL,
  recipient TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_type TEXT NOT NULL, -- 'Check', 'Bank Transfer', 'Cash', etc.
  check_number TEXT,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Paid')),
  notes TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  paid_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can view all payments" ON payments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.auth_id = auth.uid()
    )
  );

CREATE POLICY "Admins can insert payments" ON payments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.auth_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update payments" ON payments
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.auth_id = auth.uid()
    )
  );

CREATE POLICY "Admins can delete payments" ON payments
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.auth_id = auth.uid()
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
