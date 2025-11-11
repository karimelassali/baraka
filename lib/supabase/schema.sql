-- ------------------------------------------------------
-- Customer Loyalty Platform Database Schema (FIXED)
-- ------------------------------------------------------

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

----------------------------------------------------------
-- TABLE: Customers
----------------------------------------------------------
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

CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_auth_id ON customers(auth_id);

----------------------------------------------------------
-- TABLE: Loyalty Points
----------------------------------------------------------
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

CREATE INDEX IF NOT EXISTS idx_loyalty_points_customer_id ON loyalty_points(customer_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_points_created_at ON loyalty_points(created_at);

----------------------------------------------------------
-- TABLE: Vouchers
----------------------------------------------------------
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

CREATE INDEX IF NOT EXISTS idx_vouchers_customer_id ON vouchers(customer_id);
CREATE INDEX IF NOT EXISTS idx_vouchers_code ON vouchers(code);
CREATE INDEX IF NOT EXISTS idx_vouchers_is_active ON vouchers(is_active);

----------------------------------------------------------
-- TABLE: Offers
----------------------------------------------------------
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

CREATE INDEX IF NOT EXISTS idx_offers_is_active ON offers(is_active);
CREATE INDEX IF NOT EXISTS idx_offers_dates ON offers(start_date, end_date);

----------------------------------------------------------
-- TABLE: Reviews
----------------------------------------------------------
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

CREATE INDEX IF NOT EXISTS idx_reviews_customer_id ON reviews(customer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_is_approved ON reviews(is_approved);

----------------------------------------------------------
-- TABLE: Admin Users
----------------------------------------------------------
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

CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_auth_id ON admin_users(auth_id);

----------------------------------------------------------
-- TABLE: WhatsApp Messages
----------------------------------------------------------
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

CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_customer_id ON whatsapp_messages(customer_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_status ON whatsapp_messages(status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_sent_at ON whatsapp_messages(sent_at);

----------------------------------------------------------
-- TABLE: Settings
----------------------------------------------------------
CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key TEXT NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID
);

----------------------------------------------------------
-- TABLE: GDPR Logs
----------------------------------------------------------
CREATE TABLE IF NOT EXISTS gdpr_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id),
    action TEXT NOT NULL CHECK (action IN ('EXPORT', 'DELETE', 'CONSENT_UPDATE')),
    description TEXT,
    performed_by TEXT,
    performed_at TIMESTAMPTZ DEFAULT NOW(),
    data_snapshot JSONB
);

CREATE INDEX IF NOT EXISTS idx_gdpr_logs_customer_id ON gdpr_logs(customer_id);
CREATE INDEX IF NOT EXISTS idx_gdpr_logs_action ON gdpr_logs(action);

----------------------------------------------------------
-- VIEW: Customer Points Balance
----------------------------------------------------------
CREATE OR REPLACE VIEW customer_points_balance AS
SELECT
    customer_id,
    SUM(points) AS total_points,
    SUM(CASE WHEN points > 0 THEN points ELSE 0 END) AS available_points,
    SUM(CASE WHEN points < 0 THEN ABS(points) ELSE 0 END) AS pending_points_redeemed
FROM loyalty_points
GROUP BY customer_id;

----------------------------------------------------------
-- VIEW: Approved Reviews (FIXED)
----------------------------------------------------------
CREATE OR REPLACE VIEW approved_reviews AS
SELECT
    r.id AS review_id,
    c.first_name || ' ' || c.last_name AS customer_name,
    r.review_text,
    r.rating,
    r.created_at
FROM reviews r
JOIN customers c ON r.customer_id = c.id
WHERE r.is_approved = TRUE
ORDER BY r.created_at DESC
LIMIT 20;

----------------------------------------------------------
-- FUNCTION: Update updated_at timestamp
----------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

----------------------------------------------------------
-- TRIGGERS
----------------------------------------------------------
CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_offers_updated_at
    BEFORE UPDATE ON offers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

----------------------------------------------------------
-- DEFAULT SETTINGS
----------------------------------------------------------
INSERT INTO settings (setting_key, setting_value, description)
VALUES
(
    'points_conversion_formula',
    '{"rate": 1, "currency": "EUR", "points_per_unit": 1}',
    'Formula used to convert purchase amount to loyalty points'
)
ON CONFLICT (setting_key) DO NOTHING;
