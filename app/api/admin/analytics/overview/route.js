import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    try {
        const [
            { count: totalCustomers },
            { count: activeOffers },
            { count: pendingReviews },
            { data: totalVouchersData },
            { data: redeemedVouchersData },
            { count: totalMessages }
        ] = await Promise.all([
            supabase.from('customers').select('*', { count: 'exact', head: true }),
            supabase.from('offers').select('*', { count: 'exact', head: true }).eq('is_active', true),
            supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('is_approved', false),
            supabase.from('vouchers').select('value', { count: 'exact', head: false }),
            supabase.from('vouchers').select('value', { count: 'exact', head: false }).eq('is_used', true),
            supabase.from('whatsapp_messages').select('*', { count: 'exact', head: true })
        ]);

        const totalVouchers = totalVouchersData || [];
        const redeemedVouchers = redeemedVouchersData || [];

        const totalVoucherValue = totalVouchers.reduce((sum, v) => sum + (Number(v.value) || 0), 0);
        const redeemedVoucherValue = redeemedVouchers.reduce((sum, v) => sum + (Number(v.value) || 0), 0);

        return NextResponse.json({
            totalCustomers: totalCustomers || 0,
            activeOffers: activeOffers || 0,
            pendingReviews: pendingReviews || 0,
            totalVouchers: totalVouchers.length || 0,
            redeemedVouchers: redeemedVouchers.length || 0,
            totalVoucherValue,
            redeemedVoucherValue,
            totalMessages: totalMessages || 0
        });
    } catch (error) {
        console.error('Analytics Overview Error:', error);
        return NextResponse.json({ error: 'Failed to fetch analytics overview' }, { status: 500 });
    }
}
