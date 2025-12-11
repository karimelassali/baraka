import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    try {
        const { data, error } = await supabase.rpc('get_analytics_overview');

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error) {
        console.error('Analytics Overview Error:', error);
        return NextResponse.json({ error: 'Failed to fetch analytics overview' }, { status: 500 });
    }
}
