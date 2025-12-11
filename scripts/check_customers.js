
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing Supabase URL or Service Role Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkCustomers() {
    console.log('Checking customers table...');

    const { data: customers, error } = await supabase
        .from('customers')
        .select('id, email, auth_id, first_name, last_name')
        .eq('id', 'd1567e84-f4ee-4e69-813f-a116972a8569');

    if (error) {
        console.error('Error fetching customers:', error);
        return;
    }

    console.log(`Found ${customers.length} customers:`);
    customers.forEach(c => {
        console.log(`- ${c.first_name} ${c.last_name} (${c.email})`);
        console.log(`  ID: ${c.id}`);
        console.log(`  Auth ID: ${c.auth_id}`);
    });

    // Also check loyalty points
    console.log('\nChecking loyalty points...');
    const { data: points, error: pointsError } = await supabase
        .from('loyalty_points')
        .select('*')
        .eq('customer_id', 'd1567e84-f4ee-4e69-813f-a116972a8569');

    if (pointsError) {
        console.error('Error fetching points:', pointsError);
        return;
    }

    console.log(`Found ${points.length} points records.`);
    points.forEach(p => {
        console.log(`- Customer: ${p.customer_id}, Points: ${p.points}, Type: ${p.transaction_type}`);
    });

    // Check admins
    console.log('\nChecking admin users...');
    const { data: admins, error: adminError } = await supabase
        .from('admin_users')
        .select('id, email, auth_id, full_name');

    if (adminError) {
        console.error('Error fetching admins:', adminError);
    } else {
        console.log(`Found ${admins.length} admins:`);
        admins.forEach(a => {
            console.log(`- ${a.full_name} (${a.email})`);
            console.log(`  ID: ${a.id}`);
            console.log(`  Auth ID: ${a.auth_id}`);
        });
    }
}

checkCustomers();
