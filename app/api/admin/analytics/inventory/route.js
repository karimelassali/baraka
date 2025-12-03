import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    try {
        const { data, error } = await supabase.rpc('get_inventory_analytics');

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error) {
        console.error('Inventory Analytics Error:', error);
        return NextResponse.json({ error: 'Failed to fetch inventory analytics' }, { status: 500 });
    }
}
