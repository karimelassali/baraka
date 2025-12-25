import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request) {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    // 1. Verify Authentication (Admin)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: adminData } = await supabase
        .from('admin_users')
        .select('id')
        .eq('auth_id', user.id)
        .single();

    if (!adminData) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // 2. Parse Code
    const { code } = await request.json();
    if (!code) {
        return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    // 3. Service Client (Bypass RLS)
    const supabaseAdmin = createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
    );

    // 4. Find Voucher
    const { data: voucher, error } = await supabaseAdmin
        .from('vouchers')
        .select(`
        *,
        customers (
            first_name,
            last_name,
            email,
            phone_number
        )
    `)
        .eq('code', code)
        .single();

    if (error || !voucher) {
        return NextResponse.json({ error: 'Voucher non trovato' }, { status: 404 });
    }

    // 5. Validation
    const now = new Date();

    if (!voucher.is_active || voucher.used_at) { // Changed from redeemed_at
        return NextResponse.json({
            error: 'Voucher già utilizzato o non attivo',
            voucher,
            status: 'redeemed_or_inactive'
        }, { status: 400 });
    }

    if (voucher.expires_at && new Date(voucher.expires_at) < now) {
        return NextResponse.json({
            error: 'Voucher scaduto',
            voucher,
            status: 'expired'
        }, { status: 400 });
    }

    // 6. Return Details (Ready for Redemption)
    return NextResponse.json({
        success: true,
        voucher: {
            id: voucher.id,
            code: voucher.code,
            value: voucher.value,
            currency: voucher.currency,
            description: voucher.description,
            customer: voucher.customers,
            created_at: voucher.created_at,
            expires_at: voucher.expires_at
        }
    });
}
