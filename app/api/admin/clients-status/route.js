import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Initialize Supabase Admin Client with Service Role Key
        // Note: We use the environment variable directly. 
        // Ideally, this key should NOT be prefixed with NEXT_PUBLIC_ to avoid exposing it to the client.
        // However, we are using it server-side here, so it's safe within this scope.
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        );

        // 1. Fetch all customers from the public table
        const { data: customers, error: customersError } = await supabaseAdmin
            .from('customers')
            .select('*')
            .order('created_at', { ascending: false });

        if (customersError) throw customersError;

        // 2. Fetch all users from Auth (to check email verification status)
        // Note: listUsers might be paginated. For now, we fetch the first page (default 50).
        // In a real app, you'd handle pagination.
        const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers({
            perPage: 1000 // Fetch up to 1000 users to cover most cases for now
        });

        if (authError) throw authError;

        // 3. Map customers to their auth status
        const enrichedCustomers = customers.map(customer => {
            const authUser = users.find(u => u.id === customer.auth_id);

            // Determine verification status
            // A user is "Verified" if they have a confirmed email address
            const isVerified = authUser ? !!authUser.email_confirmed_at : false;

            return {
                ...customer,
                is_verified: isVerified,
                // Add other auth details if needed
                email_confirmed_at: authUser?.email_confirmed_at
            };
        });

        return NextResponse.json(enrichedCustomers);

    } catch (error) {
        console.error('Error fetching clients status:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
