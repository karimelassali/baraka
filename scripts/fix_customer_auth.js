
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

async function fixCustomerAuth(email) {
    console.log(`Fixing auth mismatch for ${email}...`);

    // 1. Get the Auth User ID
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers({ perPage: 1000 });

    if (authError) {
        console.error('Error fetching auth users:', authError);
        return;
    }

    console.log('Auth Users found:', users.map(u => u.email));

    const authUser = users.find(u => u.email?.toLowerCase() === email.toLowerCase());

    if (!authUser) {
        console.error(`No auth user found for email ${email}`);
        return;
    }

    console.log(`Found Auth User: ID=${authUser.id}`);

    // 2. Get the Customer Record
    const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('email', email)
        .single();

    if (customerError) {
        console.error('Error fetching customer:', customerError);
        return;
    }

    console.log(`Found Customer Record: ID=${customer.id}, Current AuthID=${customer.auth_id}`);

    if (customer.auth_id === authUser.id) {
        console.log('Auth IDs already match. No fix needed.');
        return;
    }

    // 3. Update the Customer Record
    console.log(`Updating customer ${customer.id} auth_id to ${authUser.id}...`);

    const { error: updateError } = await supabase
        .from('customers')
        .update({ auth_id: authUser.id })
        .eq('id', customer.id);

    if (updateError) {
        console.error('Error updating customer:', updateError);
    } else {
        console.log('Successfully updated customer auth_id!');
    }
}

// Run for test@gmail.com
fixCustomerAuth('test@gmail.com');
