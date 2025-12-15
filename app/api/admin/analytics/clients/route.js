import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range');
    const startParam = searchParams.get('startDate');
    const endParam = searchParams.get('endDate');

    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    let startDate = new Date();
    let endDate = new Date();
    let days = 30;

    if (startParam && endParam) {
        startDate = new Date(startParam);
        endDate = new Date(endParam);
        // Calculate days difference
        const diffTime = Math.abs(endDate - startDate);
        days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    } else {
        days = range === '7d' ? 7 : range === '90d' ? 90 : 30;
        startDate.setDate(startDate.getDate() - days);
    }

    try {
        const { data, error } = await supabase
            .from('customers')
            .select('created_at')
            .gte('created_at', startDate.toISOString())
            .lte('created_at', endDate.toISOString())
            .order('created_at', { ascending: true });

        if (error) throw error;

        // Aggregate by date
        const aggregated = {};
        // Initialize all dates in range with 0
        for (let i = 0; i < days; i++) {
            const d = new Date(endDate);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            aggregated[dateStr] = 0;
        }

        data.forEach(customer => {
            const dateStr = new Date(customer.created_at).toISOString().split('T')[0];
            if (aggregated[dateStr] !== undefined) {
                aggregated[dateStr]++;
            }
        });

        const result = Object.entries(aggregated)
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        return NextResponse.json(result);
    } catch (error) {
        console.error('Analytics Clients Error:', error);
        return NextResponse.json({ error: 'Failed to fetch client analytics' }, { status: 500 });
    }
}
