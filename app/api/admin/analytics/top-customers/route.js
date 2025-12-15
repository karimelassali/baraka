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

        // Try to fetch from admin_customers_extended first
        // We assume it has total_points or points_balance. 
        // If not, we might need to join tables, but let's try the view first as it's optimized.
        // We'll select * to be safe and then map.

        const { data, error } = await supabase
            .from('admin_customers_extended')
            .select('*')
            .order('total_points', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            // Fallback if view doesn't have total_points or doesn't exist (though it should)
            console.warn("Error fetching from view, trying direct query", error);
            throw error;
        }

        const result = data.map(c => ({
            customer_id: c.id,
            total_points: c.total_points || 0,
            customer: {
                first_name: c.first_name,
                last_name: c.last_name,
                email: c.email
            }
        }));

        return NextResponse.json(result);
    } catch (error) {
        console.error('Top Customers Error:', error);
        return NextResponse.json({ error: 'Failed to fetch top customers' }, { status: 500 });
    }
}
