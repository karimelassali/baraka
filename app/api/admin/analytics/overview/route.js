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
        // Calculate comparison date range
        const startTime = start ? new Date(start).getTime() : new Date().setMonth(new Date().getMonth() - 1); // Default 30d back
        const endTime = end ? new Date(end).getTime() : new Date().getTime();
        const duration = endTime - startTime;

        const previousStart = new Date(startTime - duration).toISOString();
        const previousEnd = new Date(startTime).toISOString();

        // 1. Customers
        // Total customers (Absolute)
        const { count: totalCustomers } = await supabase
            .from('customers')
            .select('*', { count: 'exact', head: true });

        // New customers in current period
        const { count: newCustomersCurrent } = await supabase
            .from('customers')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
            .lte('created_at', end || new Date().toISOString());

        // New customers in previous period
        const { count: newCustomersPrevious } = await supabase
            .from('customers')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', previousStart)
            .lt('created_at', previousEnd);

        // 2. Active Offers
        // Active Count (Absolute)
        const { count: activeOffers } = await supabase
            .from('offers')
            .select('*', { count: 'exact', head: true })
            .eq('is_active', true);

        // New offers (Trend)
        const { count: newOffersCurrent } = await supabase.from('offers').select('*', { count: 'exact', head: true }).gte('created_at', start || previousEnd).lte('created_at', end || new Date().toISOString());
        const { count: newOffersPrevious } = await supabase.from('offers').select('*', { count: 'exact', head: true }).gte('created_at', previousStart).lt('created_at', previousEnd);

        // 3. Revenue & Vouchers
        // Revenue (Same as before)
        let revenueQuery = supabase.from('daily_revenue').select('total_revenue');
        if (start) revenueQuery = revenueQuery.gte('date', start);
        if (end) revenueQuery = revenueQuery.lte('date', end);
        const { data: revenueData } = await revenueQuery;
        const revenue = revenueData?.reduce((sum, r) => sum + (Number(r.total_revenue) || 0), 0) || 0;

        let prevRevenueQuery = supabase.from('daily_revenue').select('total_revenue').gte('date', previousStart).lt('date', previousEnd);
        const { data: prevRevenueData } = await prevRevenueQuery;
        const prevRevenue = prevRevenueData?.reduce((sum, r) => sum + (Number(r.total_revenue) || 0), 0) || 0;

        // Vouchers Absolute
        const { count: voucherCount } = await supabase.from('vouchers').select('*', { count: 'exact', head: true });

        // Vouchers Trend (New Issued)
        const { count: newVouchersCurrent } = await supabase.from('vouchers').select('*', { count: 'exact', head: true }).gte('created_at', start || previousEnd).lte('created_at', end || new Date().toISOString());
        const { count: newVouchersPrevious } = await supabase.from('vouchers').select('*', { count: 'exact', head: true }).gte('created_at', previousStart).lt('created_at', previousEnd);

        const { count: redeemedCount } = await supabase.from('vouchers').select('*', { count: 'exact', head: true }).eq('is_used', true);

        // 4. Reviews
        // Pending Reviews (Absolute)
        const { count: pendingReviews } = await supabase
            .from('reviews')
            .select('*', { count: 'exact', head: true })
            .eq('is_approved', false);

        // Reviews Trend (New submitted)
        const { count: newReviewsCurrent } = await supabase.from('reviews').select('*', { count: 'exact', head: true }).gte('created_at', start || previousEnd).lte('created_at', end || new Date().toISOString());
        const { count: newReviewsPrevious } = await supabase.from('reviews').select('*', { count: 'exact', head: true }).gte('created_at', previousStart).lt('created_at', previousEnd);

        // 5. Engagement (Messages)
        let msgQuery = supabase.from('whatsapp_messages').select('*', { count: 'exact', head: true });
        if (start) msgQuery = msgQuery.gte('sent_at', start);
        if (end) msgQuery = msgQuery.lte('sent_at', end);
        const { count: totalMessages } = await msgQuery;

        const { count: prevMessages } = await supabase.from('whatsapp_messages')
            .select('*', { count: 'exact', head: true })
            .gte('sent_at', previousStart)
            .lt('sent_at', previousEnd);

        // Calculate Trends
        const calculateTrend = (current, previous) => {
            if (!previous && current > 0) return 100;
            if (!previous && current === 0) return 0;
            return ((current - previous) / previous) * 100;
        };

        const trends = {
            customers: calculateTrend(newCustomersCurrent || 0, newCustomersPrevious || 0),
            revenue: calculateTrend(revenue, prevRevenue),
            messages: calculateTrend(totalMessages || 0, prevMessages || 0),
            offers: calculateTrend(newOffersCurrent || 0, newOffersPrevious || 0),
            vouchers: calculateTrend(newVouchersCurrent || 0, newVouchersPrevious || 0),
            reviews: calculateTrend(newReviewsCurrent || 0, newReviewsPrevious || 0)
        };

        return NextResponse.json({
            totalCustomers: totalCustomers || 0,
            activeOffers: activeOffers || 0,
            totalVouchers: voucherCount || 0,
            redeemedVouchers: redeemedCount || 0,
            pendingReviews: pendingReviews || 0,
            totalVoucherValue: revenue,
            totalMessages: totalMessages || 0,
            trends // Include calculated trends
        });

    } catch (error) {
        console.error('Analytics Overview Error:', error);
        return NextResponse.json({ error: 'Failed to fetch analytics overview' }, { status: 500 });
    }
}
