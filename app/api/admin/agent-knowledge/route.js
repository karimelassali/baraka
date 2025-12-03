import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);

        const { data: knowledge, error } = await supabase
            .from('agent_knowledge')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching agent knowledge:', error);
            return NextResponse.json({ error: 'Failed to fetch knowledge', details: error.message || error }, { status: 500 });
        }

        return NextResponse.json({ knowledge });
    } catch (error) {
        console.error('Server error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);
        const body = await request.json();
        const { title, content, type } = body;

        if (!title || !content || !type) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('agent_knowledge')
            .insert([{ title, content, type, is_active: true }])
            .select()
            .single();

        if (error) {
            console.error('Error creating knowledge item:', error);
            return NextResponse.json({ error: 'Failed to create knowledge item' }, { status: 500 });
        }

        return NextResponse.json({ knowledge: data });
    } catch (error) {
        console.error('Server error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
