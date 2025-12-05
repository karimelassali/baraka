import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            );
                        } catch {
                            // Ignored
                        }
                    },
                },
            }
        );

        // Check for authenticated user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Use Service Role for Admin operations to bypass RLS
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
        );

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const search = searchParams.get('search') || '';
        const status = searchParams.get('status') || 'all';

        const from = (page - 1) * limit;
        const to = from + limit - 1;

        // 1. Pre-fetch User IDs if Country Filter is active
        const country = searchParams.get('country') || 'all';
        let countryUserIds = null;

        if (country !== 'all') {
            const { data: matchingCustomers, error: countryError } = await supabaseAdmin
                .from('customers')
                .select('auth_id')
                .ilike('country_of_origin', country);

            if (countryError) {
                console.error('Error fetching customers by country:', countryError);
                return NextResponse.json({ error: 'Failed to filter by country' }, { status: 500 });
            }

            countryUserIds = matchingCustomers.map(c => c.auth_id);

            // If no customers found for this country, return empty result immediately
            if (countryUserIds.length === 0) {
                return NextResponse.json({
                    data: [],
                    meta: {
                        total: 0,
                        page,
                        limit,
                        totalPages: 0
                    }
                });
            }
        }

        // 2. Fetch Wishlists
        let query = supabaseAdmin
            .from('wishlists')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(from, to);

        if (search) {
            query = query.ilike('product_name', `%${search}%`);
        }

        if (status !== 'all') {
            query = query.eq('status', status);
        }

        // Apply country filter if we have matching user IDs
        if (countryUserIds !== null) {
            query = query.in('user_id', countryUserIds);
        }

        const { data: wishlists, error, count } = await query;

        if (error) {
            console.error('Error fetching wishlists:', error);
            return NextResponse.json({ error: 'Failed to fetch wishlists' }, { status: 500 });
        }

        // 3. Fetch Customers manually (since no FK exists)
        const userIds = [...new Set(wishlists.map(w => w.user_id))];
        let customersMap = {};

        if (userIds.length > 0) {
            const { data: customers, error: customersError } = await supabaseAdmin
                .from('customers')
                .select('auth_id, first_name, last_name, email, phone_number, country_of_origin')
                .in('auth_id', userIds);

            if (!customersError && customers) {
                customers.forEach(c => {
                    customersMap[c.auth_id] = c;
                });
            }
        }

        // 4. Merge Data
        const enrichedWishlists = wishlists.map(w => ({
            ...w,
            customers: customersMap[w.user_id] || null
        }));

        return NextResponse.json({
            data: enrichedWishlists,
            meta: {
                total: count,
                page,
                limit,
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
