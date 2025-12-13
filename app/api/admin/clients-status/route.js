import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const search = searchParams.get('search') || '';
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

        let query = supabaseAdmin
            .from('admin_customers_extended')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false });

        if (search) {
            query = query.or(`phone_number.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
        }

        const { data: customers, count, error: customersError } = await query.range(from, to);

        if (customersError) throw customersError;

        // Map the view data to match the expected frontend structure
        const enrichedCustomers = customers.map(customer => {
            const isDummyEmail = customer.auth_email?.endsWith('@noemail.baraka');
            const isVerified = !!customer.email_confirmed_at && !isDummyEmail;

            return {
                ...customer,
                is_verified: isVerified,
                email_confirmed_at: customer.email_confirmed_at
            };
        });

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
