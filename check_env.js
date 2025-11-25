// Check if required environment variables are set
require('dotenv').config({ path: '.env' });

const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
];

console.log('=== Environment Variables Check ===\n');

requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
        console.log(`✅ ${varName}: Set (${value.substring(0, 10)}...)`);
    } else {
        console.log(`❌ ${varName}: NOT SET`);
    }
});

console.log('\n=== IMPORTANT ===');
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log('The SUPABASE_SERVICE_ROLE_KEY is missing!');
    console.log('This is needed for admin operations to bypass RLS.');
    console.log('\nTo fix:');
    console.log('1. Go to your Supabase Dashboard');
    console.log('2. Navigate to Project Settings > API');
    console.log('3. Copy the "service_role" key (NOT the anon key)');
    console.log('4. Add to .env file: SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
} else {
    console.log('All required environment variables are set!');
}
