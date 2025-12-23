// app/api/admin/campaigns/preview/route.js

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getCurrentUser } from '../../../../../lib/auth/server';

export const dynamic = 'force-dynamic';

export async function POST(request) {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);
    const user = await getCurrentUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { targetGroup, nationality, pointsThreshold } = await request.json();

    // Use admin client to bypass RLS
    const supabaseAdmin = createAdminClient();
    console.log('Campaign Preview: Admin client created');

    console.log('Campaign Preview Params:', { targetGroup, nationality, pointsThreshold });

    // Build query based on target group
    let query = supabaseAdmin
        .from('customers')
        .select('*', { count: 'exact', head: true });

    if (targetGroup === 'nationality' && nationality) {
        query = query.ilike('country_of_origin', `%${nationality}%`);
    } else if (targetGroup === 'points' && pointsThreshold) {
        const threshold = parseInt(pointsThreshold);
        if (!isNaN(threshold)) {
            // We need to join with the view to filter by points
            // Using !inner to ensure we only get customers who satisfy the condition
            query = supabaseAdmin
                .from('customers')
                .select('*, customer_points_balance!inner(total_points)', { count: 'exact', head: true })
                .gte('customer_points_balance.total_points', threshold);
        } else {
            console.warn('Invalid points threshold:', pointsThreshold);
        }
    }

    // Only count customers with phone numbers
    query = query.not('phone_number', 'is', null);

    // Check if we need to return the actual users (for demo/preview list)
    const returnUsers = await request.nextUrl.searchParams.get('returnUsers') === 'true';

    if (returnUsers) {
        // Remove head: true to get actual data
        // We need to rebuild the query without head: true because .select() is chainable but modifying options might be tricky
        // So let's just re-declare the select part or use a different approach.
        // Easier to just branch logic.

        let dataQuery = supabaseAdmin
            .from('customers')
            .select('id, first_name, last_name, phone_number, country_of_origin, email'); // Select specific fields

        if (targetGroup === 'nationality' && nationality) {
            dataQuery = dataQuery.ilike('country_of_origin', `%${nationality}%`);
        } else if (targetGroup === 'points' && pointsThreshold) {
            const threshold = parseInt(pointsThreshold);
            if (!isNaN(threshold)) {
                dataQuery = supabaseAdmin
                    .from('customers')
                    .select('id, first_name, last_name, phone_number, country_of_origin, email, customer_points_balance!inner(total_points)')
                    .gte('customer_points_balance.total_points', threshold);
            }
        }

        dataQuery = dataQuery.not('phone_number', 'is', null).limit(50); // Limit for demo

        const { data, error } = await dataQuery;

        if (error) {
            console.error('Campaign preview data error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ count: data.length, users: data });
    }

    const { count, error } = await query;

    if (error) {
        console.error('Campaign preview RAW error:', error);
        return NextResponse.json({
            error: error.message || 'Unknown database error',
            details: JSON.stringify(error)
        }, { status: 500 });
    }

    return NextResponse.json({ count: count || 0 });
}
