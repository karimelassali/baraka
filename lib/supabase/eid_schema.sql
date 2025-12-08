-- ------------------------------------------------------
-- Eid al Adha Module Schema (Optimized)
-- ------------------------------------------------------

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------
-- TABLE: Eid Reservations (Section 1 & 4)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS eid_reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number SERIAL,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    animal_type TEXT NOT NULL CHECK (animal_type IN ('SHEEP', 'GOAT')),
    requested_weight TEXT NOT NULL,
    pickup_time TEXT,
    notes TEXT,
    
    -- Delivery / Finalization fields
    final_weight DECIMAL(10, 2), -- Precision for weight
    tag_number TEXT,
    final_price DECIMAL(10, 2), -- Actual price paid
    destination TEXT, -- Delivery destination
    is_paid BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'COLLECTED', 'CANCELLED')),
    collected_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for high-performance filtering and sorting
CREATE INDEX IF NOT EXISTS idx_eid_reservations_customer_id ON eid_reservations(customer_id);
CREATE INDEX IF NOT EXISTS idx_eid_reservations_status ON eid_reservations(status);
CREATE INDEX IF NOT EXISTS idx_eid_reservations_created_at ON eid_reservations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_eid_reservations_order_number ON eid_reservations(order_number);
CREATE INDEX IF NOT EXISTS idx_eid_reservations_animal_type ON eid_reservations(animal_type);
CREATE INDEX IF NOT EXISTS idx_eid_reservations_destination ON eid_reservations(destination);

-- ----------------------------------------------------------
-- TABLE: Eid Deposits (Section 1)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS eid_deposits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reservation_id UUID NOT NULL REFERENCES eid_reservations(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL, -- Precision for money
    payment_method TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID
);

CREATE INDEX IF NOT EXISTS idx_eid_deposits_reservation_id ON eid_deposits(reservation_id);

-- ----------------------------------------------------------
-- TABLE: Eid Cattle Groups (Section 2)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS eid_cattle_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_name TEXT NOT NULL,
    cattle_weight DECIMAL(10, 2),
    total_deposit DECIMAL(10, 2) DEFAULT 0,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'COMPLETED', 'CANCELLED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eid_cattle_groups_status ON eid_cattle_groups(status);
CREATE INDEX IF NOT EXISTS idx_eid_cattle_groups_created_at ON eid_cattle_groups(created_at DESC);

-- ----------------------------------------------------------
-- TABLE: Eid Cattle Members (Section 2)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS eid_cattle_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES eid_cattle_groups(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    member_number INTEGER CHECK (member_number BETWEEN 1 AND 7),
    role TEXT DEFAULT 'MEMBER',
    deposit_amount DECIMAL(10, 2) DEFAULT 0,
    is_paid BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eid_cattle_members_group_id ON eid_cattle_members(group_id);
CREATE INDEX IF NOT EXISTS idx_eid_cattle_members_customer_id ON eid_cattle_members(customer_id);

-- ----------------------------------------------------------
-- TABLE: Eid Purchases (Section 3 - Farmer)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS eid_purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tag_number TEXT NOT NULL,
    tag_color TEXT,
    weight DECIMAL(10, 2) NOT NULL,
    animal_type TEXT NOT NULL CHECK (animal_type IN ('SHEEP', 'GOAT', 'CATTLE')),
    purchase_price DECIMAL(10, 2),
    supplier TEXT, -- Supplier name or identifier
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eid_purchases_tag ON eid_purchases(tag_number);
CREATE INDEX IF NOT EXISTS idx_eid_purchases_created_at ON eid_purchases(created_at DESC);

-- ----------------------------------------------------------
-- TRIGGERS
-- ----------------------------------------------------------
CREATE TRIGGER update_eid_reservations_updated_at
    BEFORE UPDATE ON eid_reservations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_eid_cattle_groups_updated_at
    BEFORE UPDATE ON eid_cattle_groups
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------
-- RLS POLICIES
-- ----------------------------------------------------------
ALTER TABLE eid_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE eid_deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE eid_cattle_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE eid_cattle_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE eid_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all access for authenticated users" ON eid_reservations FOR ALL TO authenticated USING (true);
CREATE POLICY "Enable all access for authenticated users" ON eid_deposits FOR ALL TO authenticated USING (true);
CREATE POLICY "Enable all access for authenticated users" ON eid_cattle_groups FOR ALL TO authenticated USING (true);
CREATE POLICY "Enable all access for authenticated users" ON eid_cattle_members FOR ALL TO authenticated USING (true);
CREATE POLICY "Enable all access for authenticated users" ON eid_purchases FOR ALL TO authenticated USING (true);

-- ----------------------------------------------------------
-- TABLE: Eid Suppliers
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS eid_suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    contact_info TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------
-- TABLE: Eid Destinations
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS eid_destinations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    location TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE eid_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE eid_destinations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all access for authenticated users" ON eid_suppliers FOR ALL TO authenticated USING (true);
CREATE POLICY "Enable all access for authenticated users" ON eid_destinations FOR ALL TO authenticated USING (true);
