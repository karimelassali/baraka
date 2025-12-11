
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

async function checkPoints() {
    const customerId = 'd1567e84-f4ee-4e69-813f-a116972a8569'; // The user from previous logs

    console.log(`Checking points for customer ${customerId}...`);

    // 1. Get Balance from View
    const { data: balance, error: balanceError } = await supabase
        .from('customer_points_balance')
        .select('*')
        .eq('customer_id', customerId)
        .maybeSingle();

    if (balanceError) console.error('Error fetching balance:', balanceError);
    console.log('Current Balance View:', balance);

    // 2. Get Raw History
    const { data: history, error: historyError } = await supabase
        .from('loyalty_points')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

    if (historyError) console.error('Error fetching history:', historyError);

    console.log('\nPoints History:');
    let calculatedSum = 0;
    history.forEach(h => {
        console.log(`[${h.created_at}] ${h.transaction_type}: ${h.points} (Ref: ${h.reference_id})`);
        calculatedSum += h.points;
    });
    console.log(`\nCalculated Sum from History: ${calculatedSum}`);
}

checkPoints();
