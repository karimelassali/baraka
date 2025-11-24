
import { createClient } from '../../../../../lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getCurrentUser } from '../../../../../lib/auth/server';

export async function GET(request) {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);
    const user = await getCurrentUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch recent messages grouped by created_at (approximate grouping for "campaigns" since we don't have a campaigns table)
    // Since we insert individual messages, we might need to group them by time or just show a list of recent messages.
    // Ideally, we should have a 'campaigns' table, but for now we'll just list the messages.
    // To make it look like "campaigns", we can select distinct message_content and created_at (truncated to minute) or just show the last 50 messages.

    // Let's just fetch the last 50 messages for now.
    const { data: messages, error } = await supabase
        .from('whatsapp_messages')
        .select(`
      id,
      created_at,
      message_content,
      status,
      customers (
        first_name,
        last_name,
        phone_number
      )
    `)
        .order('created_at', { ascending: false })
        .limit(50);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ messages });
}
