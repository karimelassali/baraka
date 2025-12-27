-- ------------------------------------------------------
-- TABLE: Slaughtering Records
-- ------------------------------------------------------
CREATE TABLE IF NOT EXISTS slaughtering_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID REFERENCES suppliers(id),
    record_date DATE DEFAULT CURRENT_DATE,
    animal_type TEXT CHECK (animal_type IN ('bovine', 'ovine')),
    quantity INTEGER,
    live_weight DECIMAL, -- kg
    slaughtered_weight DECIMAL, -- kg
    live_purchase_price DECIMAL, -- €/kg
    final_price DECIMAL, -- €/kg
    slaughtering_cost DECIMAL, -- €
    
    -- Calculated fields stored for performance/history
    total_purchase_cost DECIMAL, -- Live Weight * Live Purchase Price
    final_total_cost DECIMAL, -- (Final Price * Slaughtered Weight) + Slaughtering Cost
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID
);

-- Indexes for reporting
CREATE INDEX IF NOT EXISTS idx_slaughtering_date ON slaughtering_records(record_date);
CREATE INDEX IF NOT EXISTS idx_slaughtering_supplier ON slaughtering_records(supplier_id);
CREATE INDEX IF NOT EXISTS idx_slaughtering_animal_type ON slaughtering_records(animal_type);

-- Trigger for updated_at
CREATE TRIGGER update_slaughtering_records_updated_at
    BEFORE UPDATE ON slaughtering_records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
