import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function PUT(request, { params }) {
    try {
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);
        const { id } = await params;
        const body = await request.json();

        // Fields that can be updated
        const {
            animal_type,
            requested_weight,
            pickup_time,
            notes,
            status,
            final_weight,
            tag_number,
            is_paid,
            collected_at
        } = body;

        const updateData = {};
        if (animal_type) updateData.animal_type = animal_type;
        if (requested_weight) updateData.requested_weight = requested_weight;
        if (pickup_time) updateData.pickup_time = pickup_time;
        if (notes !== undefined) updateData.notes = notes;
        if (status) updateData.status = status;
        if (final_weight) updateData.final_weight = final_weight;
        if (tag_number) updateData.tag_number = tag_number;
        if (is_paid !== undefined) updateData.is_paid = is_paid;
        if (collected_at) updateData.collected_at = collected_at;

        const { data, error } = await supabase
            .from('eid_reservations')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating reservation:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Server error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);
        const { id } = await params;

        const { error } = await supabase
            .from('eid_reservations')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting reservation:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Server error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
