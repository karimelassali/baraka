import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function DELETE(request, { params }) {
    try {
        const { id } = await params;
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);

        // Check if group has members? Usually we might want to prevent delete if it has paid members.
        // For now, we'll allow delete and cascade (if DB configured) or just delete.
        // Assuming DB has cascade or we delete members first.
        // Let's just try to delete the group.

        const { error } = await supabase
            .from('eid_cattle_groups')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting cattle group:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Server error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);
        const body = await request.json();

        const { group_name, cattle_weight, status } = body;

        const { data, error } = await supabase
            .from('eid_cattle_groups')
            .update({ group_name, cattle_weight, status })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating cattle group:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Server error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
