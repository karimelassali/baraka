import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request, { params }) {
    const { id } = await params;
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    try {
        const { data, error } = await supabase
            .from('eid_purchase_batches')
            .select('*, eid_suppliers(name)')
            .eq('id', id)
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    const { id } = await params;
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    try {
        // First, unlink purchases from this batch (optional, or cascade delete if configured)
        // But our schema has ON DELETE SET NULL for batch_id in eid_purchases, so we can just delete the batch.

        const { error } = await supabase
            .from('eid_purchase_batches')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    const { id } = await params;
    const body = await request.json();
    const { batch_number, notes, is_pinned } = body;

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    try {
        const updates = {};
        if (batch_number !== undefined) updates.batch_number = batch_number;
        if (notes !== undefined) updates.notes = notes;
        if (is_pinned !== undefined) updates.is_pinned = is_pinned;

        const { data, error } = await supabase
            .from('eid_purchase_batches')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
