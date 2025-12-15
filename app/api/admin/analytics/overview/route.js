import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request) {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const range = searchParams.get('range');

    // Calculate date range if range is provided
    let start = startDate;
    let end = endDate;

    if (!start && range) {
        const now = new Date();
        end = now.toISOString();
        const d = new Date();
        if (range === '7d') d.setDate(d.getDate() - 7);
        else if (range === '30d') d.setDate(d.getDate() - 30);
        else if (range === '90d') d.setDate(d.getDate() - 90);
        else if (range === '12m') d.setMonth(d.getMonth() - 12);
        start = d.toISOString();
    }

    try {
        // 1. Total Customers (Absolute count)
        const { count: totalCustomers } = await supabase
            .from('customers')
            .select('*', { count: 'exact', head: true });

        // 2. Active Offers
        const { count: activeOffers } = await supabase
            .from('offers')
            .select('*', { count: 'exact', head: true })
            .eq('is_active', true);

        // 3. Total Voucher Value (Revenue) & Counts - Filtered by date
        let revenueQuery = supabase.from('vouchers').select('value, is_used');
        if (start) revenueQuery = revenueQuery.gte('created_at', start);
        if (end) revenueQuery = revenueQuery.lte('created_at', end);

        const { data: revenueData } = await revenueQuery;

        const revenue = revenueData?.reduce((sum, v) => sum + (v.value || 0), 0) || 0;
        const voucherCount = revenueData?.length || 0;
        const redeemedCount = revenueData?.filter(v => v.is_used).length || 0;

        // 4. Engagement (Messages) - Filtered by date
        let msgQuery = supabase.from('whatsapp_messages').select('*', { count: 'exact', head: true });
        if (start) msgQuery = msgQuery.gte('created_at', start);
        if (end) msgQuery = msgQuery.lte('created_at', end);

        const { count: totalMessages } = await msgQuery;

        return NextResponse.json({
            totalCustomers: totalCustomers || 0,
            activeOffers: activeOffers || 0,
            totalVouchers: voucherCount,
            redeemedVouchers: redeemedCount,
            totalVoucherValue: revenue,
            totalMessages: totalMessages || 0
        });

    } catch (error) {
        console.error('Analytics Overview Error:', error);
        return NextResponse.json({ error: 'Failed to fetch analytics overview' }, { status: 500 });
    }
}
