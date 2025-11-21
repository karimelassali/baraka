// app/api/admin/campaigns/preview/route.js

import { createClient } from '../../../../../lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getCurrentUser } from '../../../../../lib/auth/server';

export async function POST(request) {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);
    const user = await getCurrentUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { targetGroup, nationality, pointsThreshold } = await request.json();

    // Build query based on target group
    let query = supabase
        .from('customers')
        .select('id', { count: 'exact', head: true });

    if (targetGroup === 'nationality' && nationality) {
        query = query.ilike('country_of_origin', `%${nationality}%`);
    } else if (targetGroup === 'points' && pointsThreshold) {
        query = query.gte('total_points', parseInt(pointsThreshold));
    }

    // Only count customers with phone numbers
    query = query.not('phone_number', 'is', null);

    const { count, error } = await query;

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ count: count || 0 });
}
