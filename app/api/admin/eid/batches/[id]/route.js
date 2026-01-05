import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request, { params }) {
    const { id } = await params;
    const supabase = await createClient();

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
    const supabase = await createClient();

    try {
        // Manually cascade delete purchases because FK might be SET NULL or RESTRICT
        const { error: purchasesError } = await supabase
            .from('eid_purchases')
            .delete()
            .eq('batch_id', id);

        if (purchasesError) {
            console.error('Error deleting linked purchases:', purchasesError);
            throw purchasesError;
        }

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

    const supabase = await createClient();

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
