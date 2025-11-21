// lib/supabase/migrate.js
// Script to run database migrations using direct PostgreSQL connection

import { Pool } from 'pg';

/**
 * Initialize the PostgreSQL connection pool for running migrations
 * @returns {Pool} PostgreSQL connection pool
 */
function createConnectionPool() {
  const databaseUrl = process.env.DATABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!databaseUrl) {
    throw new Error('Missing DATABASE_URL environment variable.');
  }

  // Create the connection pool
  return new Pool({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false // Required for Supabase
    }
  });
}

/**
 * Function to run the database schema migration
 */
export async function runMigrations() {
  const pool = createConnectionPool();
  
  // SQL schema definition
  const schemaSql = `
    -- Enable UUID extension
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    -- Table: Customer
    CREATE TABLE IF NOT EXISTS customers (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        auth_id UUID UNIQUE,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        date_of_birth DATE,
        residence TEXT,
        phone_number TEXT,
        email TEXT NOT NULL UNIQUE,
        country_of_origin TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        gdpr_consent BOOLEAN NOT NULL,
        gdpr_consent_at TIMESTAMPTZ NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        language_preference TEXT DEFAULT 'en'
    );

    -- Create indexes for customers table
    CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
    CREATE INDEX IF NOT EXISTS idx_customers_auth_id ON customers(auth_id);

    -- Table: Loyalty Points
    CREATE TABLE IF NOT EXISTS loyalty_points (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        points INTEGER NOT NULL,
        transaction_type TEXT NOT NULL CHECK (transaction_type IN ('EARNED', 'REDEEMED', 'ADJUSTED')),
        reference_id TEXT,
        description TEXT,
        points_formula_used TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        admin_id UUID
    );

    -- Create indexes for loyalty_points table
    CREATE INDEX IF NOT EXISTS idx_loyalty_points_customer_id ON loyalty_points(customer_id);
    CREATE INDEX IF NOT EXISTS idx_loyalty_points_created_at ON loyalty_points(created_at);

    -- Table: Voucher
    CREATE TABLE IF NOT EXISTS vouchers (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        code TEXT NOT NULL UNIQUE,
        customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        points_redeemed INTEGER NOT NULL,
        value DECIMAL NOT NULL,
        currency TEXT NOT NULL DEFAULT 'EUR',
        is_active BOOLEAN DEFAULT TRUE,
        is_used BOOLEAN DEFAULT FALSE,
        used_at TIMESTAMPTZ,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        admin_id UUID
    );

    -- Create indexes for vouchers table
    CREATE INDEX IF NOT EXISTS idx_vouchers_customer_id ON vouchers(customer_id);
    CREATE INDEX IF NOT EXISTS idx_vouchers_code ON vouchers(code);
    CREATE INDEX IF NOT EXISTS idx_vouchers_is_active ON vouchers(is_active);

    -- Table: Offer
    CREATE TABLE IF NOT EXISTS offers (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title JSONB NOT NULL,
        description JSONB,
        image_url TEXT,
        offer_type TEXT NOT NULL CHECK (offer_type IN ('WEEKLY', 'PERMANENT')),
        is_active BOOLEAN DEFAULT TRUE,
        start_date DATE,
        end_date DATE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        created_by UUID
    );

    -- Create indexes for offers table
    CREATE INDEX IF NOT EXISTS idx_offers_is_active ON offers(is_active);
    CREATE INDEX IF NOT EXISTS idx_offers_dates ON offers(start_date, end_date);

    -- Table: Review
    CREATE TABLE IF NOT EXISTS reviews (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        review_text TEXT NOT NULL,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        is_approved BOOLEAN DEFAULT FALSE,
        is_featured BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        approved_at TIMESTAMPTZ
    );

    -- Create indexes for reviews table
    CREATE INDEX IF NOT EXISTS idx_reviews_customer_id ON reviews(customer_id);
    CREATE INDEX IF NOT EXISTS idx_reviews_is_approved ON reviews(is_approved);

    -- Table: Admin User
    CREATE TABLE IF NOT EXISTS admin_users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        auth_id UUID UNIQUE,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'manager')),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        last_login_at TIMESTAMPTZ
    );

    -- Create indexes for admin_users table
    CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
    CREATE INDEX IF NOT EXISTS idx_admin_users_auth_id ON admin_users(auth_id);

    -- Table: WhatsApp Message
    CREATE TABLE IF NOT EXISTS whatsapp_messages (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        template_name TEXT NOT NULL,
        message_type TEXT NOT NULL CHECK (message_type IN ('BIRTHDAY', 'PROMOTIONAL', 'TARGETED')),
        target_audience TEXT,
        message_content JSONB,
        status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
        sent_at TIMESTAMPTZ DEFAULT NOW(),
        delivered_at TIMESTAMPTZ,
        read_at TIMESTAMPTZ,
        admin_id UUID
    );

    -- Create indexes for whatsapp_messages table
    CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_customer_id ON whatsapp_messages(customer_id);
    CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_status ON whatsapp_messages(status);
    CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_sent_at ON whatsapp_messages(sent_at);

    -- Table: Settings
    CREATE TABLE IF NOT EXISTS settings (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        setting_key TEXT NOT NULL UNIQUE,
        setting_value TEXT NOT NULL,
        description TEXT,
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        updated_by UUID
    );

    -- Table: GDPR Log
    CREATE TABLE IF NOT EXISTS gdpr_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        customer_id UUID REFERENCES customers(id),
        action TEXT NOT NULL CHECK (action IN ('EXPORT', 'DELETE', 'CONSENT_UPDATE')),
        description TEXT,
        performed_by TEXT,
        performed_at TIMESTAMPTZ DEFAULT NOW(),
        data_snapshot JSONB
    );

    -- Create indexes for gdpr_logs table
    CREATE INDEX IF NOT EXISTS idx_gdpr_logs_customer_id ON gdpr_logs(customer_id);
    CREATE INDEX IF NOT EXISTS idx_gdpr_logs_action ON gdpr_logs(action);

    -- Create view: Customer Points Balance
    CREATE OR REPLACE VIEW customer_points_balance AS
    SELECT 
        customer_id,
        SUM(points) AS total_points,
        SUM(CASE WHEN points > 0 THEN points ELSE 0 END) AS available_points,
        SUM(CASE WHEN points < 0 THEN ABS(points) ELSE 0 END) AS pending_points_redeemed
    FROM loyalty_points
    GROUP BY customer_id;

    -- Create view: Approved Reviews (limited to 20 most recent)
    CREATE OR REPLACE VIEW approved_reviews AS
    SELECT 
        id,
        c.first_name || ' ' || c.last_name AS customer_name,
        review_text,
        rating,
        r.created_at
    FROM reviews r
    JOIN customers c ON r.customer_id = c.id
    WHERE r.is_approved = TRUE
    ORDER BY r.created_at DESC
    LIMIT 20;

    -- Function to update the updated_at timestamp
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    $$ language 'plpgsql';

    -- Triggers to automatically update the updated_at column
    CREATE TRIGGER update_customers_updated_at 
        BEFORE UPDATE ON customers 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER update_offers_updated_at 
        BEFORE UPDATE ON offers 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();

    -- Insert default settings
    INSERT INTO settings (setting_key, setting_value, description) 
    VALUES 
        ('points_conversion_formula', '{"rate": 1, "currency": "EUR", "points_per_unit": 1}', 'Formula used to convert purchase amount to loyalty points') 
        ON CONFLICT (setting_key) DO NOTHING;
  `;

  let client;
  try {
    console.log('Starting database migration...');
    
    // Get a client from the pool
    client = await pool.connect();
    
    // Run the schema SQL
    await client.query(schemaSql);
    
    console.log('Database schema created successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  } finally {
    // Release the client back to the pool
    if (client) {
      client.release();
    }
    // End the pool
    await pool.end();
  }
}

// If this script is run directly, execute the migrations
if (typeof require !== 'undefined' && require.main === module) {
  runMigrations()
    .then(() => {
      console.log('Migration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

export default runMigrations;