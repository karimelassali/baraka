import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient as createServerClient } from '@/lib/supabase/server';

export async function GET(request, { params }) {
    const cookieStore = await cookies();
    const supabase = await createServerClient(cookieStore);

    // Verify admin access
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if the user is an admin
    const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('id')
        .eq('auth_id', user.id)
        .eq('is_active', true)
        .single();

    if (adminError || !adminData) {
        return NextResponse.json({ error: 'Access denied: Admin role required' }, { status: 403 });
    }

    const { id } = await params;

    if (!id) {
        return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
    }

    // Initialize Service Role Client for fetching data (bypasses RLS)
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );

    try {
        // 1. Fetch Customer Basic Info
        const { data: customer, error: customerError } = await supabaseAdmin
            .from('customers')
            .select('*')
            .eq('id', id)
            .single();

        if (customerError) throw customerError;

        // 2. Fetch Vouchers
        const { data: vouchers, error: vouchersError } = await supabaseAdmin
            .from('vouchers')
            .select('*')
            .eq('customer_id', id);

        if (vouchersError) console.warn('Error fetching vouchers:', vouchersError);

        // 3. Fetch Points
        const { data: points, error: pointsError } = await supabaseAdmin
            .from('loyalty_points')
            .select('points_balance')
            .eq('customer_id', id)
            .maybeSingle();

        if (pointsError) console.warn('Error fetching points:', pointsError);

        // 4. Fetch Eid Reservations
        const { data: eidReservations, error: eidError } = await supabaseAdmin
            .from('eid_reservations')
            .select('*')
            .eq('customer_id', id);

        if (eidError) console.warn('Error fetching eid reservations:', eidError);

        // 5. Fetch History (Admin Logs for this user)
        // We look for logs where resourceId is the customer ID
        const { data: history, error: historyError } = await supabaseAdmin
            .from('admin_logs')
            .select('*')
            .eq('resource_id', id)
            .order('created_at', { ascending: false })
            .limit(5);

        if (historyError) console.warn('Error fetching history:', historyError);

        return NextResponse.json({
            customer,
            vouchers: vouchers || [],
            points: points?.points_balance || 0,
            eidReservations: eidReservations || [],
            history: history || []
        });

    } catch (error) {
        console.error('Error fetching customer details:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
