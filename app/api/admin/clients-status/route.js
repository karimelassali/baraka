import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        // Initialize Supabase Admin Client
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

        // 1. Fetch paginated customers
        const { data: customers, count, error: customersError } = await supabaseAdmin
            .from('customers')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(from, to);

        if (customersError) throw customersError;

        // 2. Fetch auth details for these specific customers
        const enrichedCustomers = await Promise.all(customers.map(async (customer) => {
            try {
                const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(customer.auth_id);

                // If user not found (deleted?), handle gracefully
                if (userError || !user) {
                    return {
                        ...customer,
                        is_verified: false,
                        email_confirmed_at: null
                    };
                }

                const isDummyEmail = user.email?.endsWith('@noemail.baraka');
                const isVerified = !!user.email_confirmed_at && !isDummyEmail;

                return {
                    ...customer,
                    is_verified: isVerified,
                    email_confirmed_at: user.email_confirmed_at
                };
            } catch (e) {
                console.error(`Error fetching auth user for ${customer.id}:`, e);
                return { ...customer, is_verified: false };
            }
        }));

        return NextResponse.json({
            clients: enrichedCustomers,
            total: count,
            page,
            limit,
            hasMore: (from + limit) < count
        });

    } catch (error) {
        console.error('Error fetching clients status:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
