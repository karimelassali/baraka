require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDates() {
    try {
        const { data: customers, error } = await supabase
            .from('customers')
            .select('created_at')
            .order('created_at', { ascending: false })
            .limit(5);

        if (error) throw error;

        console.log('--- Recent Customers ---');
        customers.forEach(c => console.log(c.created_at));
        console.log('------------------------');
    } catch (error) {
        console.error('Error checking dates:', error);
    }
}

checkDates();
