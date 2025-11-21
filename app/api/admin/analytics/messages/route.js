import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    try {
        const { data, error } = await supabase
            .from('whatsapp_messages')
            .select('status');

        if (error) throw error;

        const statusCounts = data.reduce((acc, curr) => {
            const status = curr.status || 'unknown';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});

        const result = Object.entries(statusCounts).map(([name, value]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            value
        }));

        return NextResponse.json(result);
    } catch (error) {
        console.error('Analytics Messages Error:', error);
        return NextResponse.json({ error: 'Failed to fetch message analytics' }, { status: 500 });
    }
}
