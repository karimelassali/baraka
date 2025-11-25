-- Create offer_categories table
CREATE TABLE IF NOT EXISTS offer_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name JSONB NOT NULL, -- Stores {"en": "...", "it": "...", "ar": "..."}
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add columns to offers table
ALTER TABLE offers 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES offer_categories(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS is_popup BOOLEAN DEFAULT FALSE;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_offers_category_id ON offers(category_id);
CREATE INDEX IF NOT EXISTS idx_offers_is_popup ON offers(is_popup);
