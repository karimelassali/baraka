import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function PUT(request, { params }) {
    try {
        const cookieStore = await cookies();
        const supabase = await createClient(cookieStore);
        const { id } = params;
        const body = await request.json();

        const { data, error } = await supabase
            .from('agent_knowledge')
            .update(body)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating knowledge item:', error);
            return NextResponse.json({ error: 'Failed to update knowledge item' }, { status: 500 });
        }

        return NextResponse.json({ knowledge: data });
    } catch (error) {
        console.error('Server error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const cookieStore = await cookies();
        const supabase = await createClient(cookieStore);
        const { id } = params;

        const { error } = await supabase
            .from('agent_knowledge')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting knowledge item:', error);
            return NextResponse.json({ error: 'Failed to delete knowledge item' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Server error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
