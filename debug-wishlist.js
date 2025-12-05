const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: Missing Supabase credentials in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testWishlistFlow() {
    console.log('--- Starting Wishlist Debug Script ---');

    // 1. Fetch all wishlists (Admin View)
    console.log('\n1. Fetching all wishlists (Admin View)...');
    const { data: allWishlists, error: fetchError } = await supabase
        .from('wishlists')
        .select('*');

    if (fetchError) {
        console.error('Error fetching wishlists:', fetchError);
        return;
    }
    console.log(`Found ${allWishlists.length} total wishlist items.`);

    if (allWishlists.length === 0) {
        console.log('No wishlists found. Skipping further tests.');
        return;
    }

    // 2. Check User IDs and Customer Data
    console.log('\n2. Checking User IDs and Customer Data...');
    const userIds = [...new Set(allWishlists.map(w => w.user_id))];
    console.log(`Unique User IDs in wishlists: ${userIds.length}`);

    const { data: customers, error: customerError } = await supabase
        .from('customers')
        .select('auth_id, first_name, last_name, country_of_origin')
        .in('auth_id', userIds);

    if (customerError) {
        console.error('Error fetching customers:', customerError);
    } else {
        console.log(`Found ${customers.length} matching customers.`);
        customers.forEach(c => {
            console.log(`- Customer: ${c.first_name} ${c.last_name} (AuthID: ${c.auth_id}, Country: ${c.country_of_origin})`);
        });

        // Check for missing customers
        const foundAuthIds = customers.map(c => c.auth_id);
        const missingAuthIds = userIds.filter(id => !foundAuthIds.includes(id));
        if (missingAuthIds.length > 0) {
            console.warn(`WARNING: The following User IDs exist in wishlists but NOT in the customers table:`, missingAuthIds);
        }
    }

    // 3. Simulate Country Filtering
    console.log('\n3. Simulating Country Filtering...');
    const testCountry = 'Italy'; // Change this to a country you expect to find
    const customersInCountry = customers.filter(c => c.country_of_origin === testCountry);
    const authIdsInCountry = customersInCountry.map(c => c.auth_id);

    const filteredWishlists = allWishlists.filter(w => authIdsInCountry.includes(w.user_id));
    console.log(`Filtering by country '${testCountry}': Found ${filteredWishlists.length} items.`);

    // 4. Check RLS Policies (Simulated)
    console.log('\n4. Checking RLS Policies (Information only)...');
    console.log('Ensure that "Users can view own wishlists" policy exists and uses (auth.uid() = user_id).');
    console.log('Ensure that Admin API uses Service Role Key (which bypasses RLS).');

    console.log('\n--- Debug Script Complete ---');
}

testWishlistFlow();
