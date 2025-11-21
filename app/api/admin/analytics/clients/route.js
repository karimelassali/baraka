import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const days = range === '7d' ? 7 : range === '90d' ? 90 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    try {
        const { data, error } = await supabase
            .from('customers')
            .select('created_at')
            .gte('created_at', startDate.toISOString())
            .order('created_at', { ascending: true });

        if (error) throw error;

        // Aggregate by date
        const aggregated = {};
        // Initialize all dates in range with 0
        for (let i = 0; i < days; i++) {
            const d = new Date();
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
