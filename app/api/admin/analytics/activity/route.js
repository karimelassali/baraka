import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    try {
        const { data, error } = await supabase
            .from('whatsapp_messages')
            .select(`
        id,
        message_content,
        status,
        sent_at,
        customers (
          first_name,
          last_name,
          phone_number
        )
      `)
            .order('sent_at', { ascending: false })
            .limit(10);

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error) {
        console.error('Analytics Activity Error:', error);
        return NextResponse.json({ error: 'Failed to fetch activity logs' }, { status: 500 });
    }
}
