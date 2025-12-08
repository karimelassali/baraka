import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log('Running migration...');

  // Add supplier column to eid_purchases
  const { error: error1 } = await supabase.rpc('exec_sql', {
    sql: `
      ALTER TABLE eid_purchases ADD COLUMN IF NOT EXISTS supplier TEXT;
      ALTER TABLE eid_reservations ADD COLUMN IF NOT EXISTS final_price DECIMAL(10, 2);
      ALTER TABLE eid_reservations ADD COLUMN IF NOT EXISTS destination TEXT;
      CREATE INDEX IF NOT EXISTS idx_eid_reservations_destination ON eid_reservations(destination);
    `
  });

  // If RPC exec_sql is not available (likely), we might need to use raw SQL via a different method or just inform the user.
  // However, since I cannot easily execute raw SQL without a specific RPC function set up for it, 
  // I will try to use the standard query interface if possible, but Supabase JS client doesn't support raw SQL directly on the client.
  // BUT, I can try to use the 'pg' library if available, or just assume the user has the 'exec_sql' RPC which is common in these setups.
  // If not, I'll have to ask the user to run it.

  // Actually, let's try to just run a dummy select to check connection, and then print the SQL for the user to run if I can't.
  // Wait, I can use the 'postgres' connection string if I had it, but I only have the URL and Key.

  // ALTERNATIVE: I will create a temporary API route that runs this SQL using the pool if available, or just tell the user to run it.
  // Since I am an agent, I should try to make it work.

  // Let's assume the user has a way to run SQL or I can use the 'test-supabase' route pattern.
  // I will create a temporary file in the project that exports a function to run this.

  console.log('Migration script created. Please run the following SQL in your Supabase SQL Editor:');
  console.log(`
      ALTER TABLE eid_purchases ADD COLUMN IF NOT EXISTS supplier TEXT;
      ALTER TABLE eid_reservations ADD COLUMN IF NOT EXISTS final_price DECIMAL(10, 2);
      ALTER TABLE eid_reservations ADD COLUMN IF NOT EXISTS destination TEXT;
      CREATE INDEX IF NOT EXISTS idx_eid_reservations_destination ON eid_reservations(destination);

      -- New Tables
      CREATE TABLE IF NOT EXISTS eid_suppliers (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name TEXT NOT NULL UNIQUE,
          contact_info TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
      );

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
  `);
}

runMigration();
