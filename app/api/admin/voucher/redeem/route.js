import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { logAdminAction } from '@/lib/admin-logger';

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

    const { voucher_id } = await request.json();

    // 2. Service Client
    const supabaseAdmin = createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
    );

    // 3. DEBUG: Check Voucher Status BEFORE Update
    const { data: currentVoucher, error: checkError } = await supabaseAdmin
        .from('vouchers')
        .select('*')
        .eq('id', voucher_id)
        .single();

    if (checkError || !currentVoucher) {
        console.error("Debug Check Error:", checkError);
        return NextResponse.json({ error: 'Voucher non trovato nel DB (ID errato)' }, { status: 404 });
    }

    console.log("DEBUG Voucher State:", currentVoucher);

    // 4. Update Voucher Status (Corrected column: used_at)
    const { data, error } = await supabaseAdmin
        .from('vouchers')
        .update({
            is_active: false,
            used_at: new Date().toISOString(), // Changed from redeemed_at
            admin_id: adminData.id
        })
        .eq('id', voucher_id)
        .eq('is_active', true)
        .is('used_at', null) // Changed from redeemed_at
        .select()
        .single();

    if (error || !data) {
        console.error("Redeem Failed. Update Error:", error);

        let reason = "Errore sconosciuto";
        if (!currentVoucher.is_active) reason = "Voucher non attivo (is_active=false)";
        if (currentVoucher.used_at) reason = `Voucher già riscattato il ${currentVoucher.used_at}`; // Changed from redeemed_at
        if (error) reason = `DB Error: ${error.message}`;

        return NextResponse.json({
            error: `Riscatto fallito: ${reason}`,
            debug: currentVoucher
        }, { status: 400 });
    }

    // 5. Log Action
    await logAdminAction({
        action: 'REDEEM',
        resource: 'vouchers',
        resourceId: voucher_id,
        details: { voucherCode: data.code, value: data.value },
        adminId: adminData.id
    });

    return NextResponse.json({ success: true, message: 'Voucher Riscattato!' });
}
