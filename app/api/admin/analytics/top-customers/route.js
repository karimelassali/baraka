import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request) {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit')) || 5;
        const offset = parseInt(searchParams.get('offset')) || 0;

        // Fetch top customers by points balance
        const { data: pointsData, error: pointsError } = await supabase
            .from('customer_points_balance')
            .select('customer_id, total_points')
            .order('total_points', { ascending: false })
            .range(offset, offset + limit - 1);

        if (pointsError) throw pointsError;

        if (!pointsData || pointsData.length === 0) {
            return NextResponse.json([]);
        }

        // Fetch customer details
        const customerIds = pointsData.map(p => p.customer_id);
        const { data: customersData, error: customersError } = await supabase
            .from('customers')
            .select('id, first_name, last_name, email')
            .in('id', customerIds);

        if (customersError) throw customersError;

        // Merge data
        const result = pointsData.map(p => {
            const customer = customersData.find(c => c.id === p.customer_id);
            return {
                ...p,
                customer: customer || { first_name: 'Unknown', last_name: 'User', email: '' }
            };
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error('Top Customers Error:', error);
        return NextResponse.json({ error: 'Failed to fetch top customers' }, { status: 500 });
    }
}
