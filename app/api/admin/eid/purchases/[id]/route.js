import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function DELETE(request, { params }) {
    try {
        const { id } = await params;
        const supabase = await createClient();

        const { error } = await supabase
            .from('eid_purchases')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting purchase:', error);
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
        const supabase = await createClient();
        const body = await request.json();

        const { tag_number, tag_color, weight, animal_type, purchase_price, notes, destination } = body;

        // Check for duplicate tag (excluding current record)
        if (tag_number) {
            const { data: existingTag } = await supabase
                .from('eid_purchases')
                .select('id')
                .eq('tag_number', tag_number)
                .neq('id', id)
                .single();

            if (existingTag) {
                return NextResponse.json({ error: `Tag number ${tag_number} already exists.` }, { status: 409 });
            }
        }

        const { data, error } = await supabase
            .from('eid_purchases')
            .update({
                tag_number,
                tag_color,
                weight: Number(weight),
                animal_type,
                purchase_price: purchase_price ? Number(purchase_price) : null,
                notes,
                destination
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating purchase:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Server error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
