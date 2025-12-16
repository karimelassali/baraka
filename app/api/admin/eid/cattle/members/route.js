import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request) {
    try {
        const supabase = await createClient();
        const body = await request.json();
        const { group_id, customer_id, member_number, deposit_amount, is_paid } = body;

        if (!group_id || !customer_id || !member_number) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('eid_cattle_members')
            .insert([{
                group_id,
                customer_id,
                member_number,
                deposit_amount: deposit_amount ? Number(deposit_amount) : 0,
                is_paid: is_paid || false
            }])
            .select()
            .single();

        if (error) {
            console.error('Error adding group member:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Server error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const supabase = await createClient();
        const body = await request.json();
        const { id, is_paid, deposit_amount } = body;

        if (!id) {
            return NextResponse.json({ error: 'Missing member ID' }, { status: 400 });
        }

        const updates = {};
        if (is_paid !== undefined) updates.is_paid = is_paid;
        if (deposit_amount !== undefined) updates.deposit_amount = Number(deposit_amount);

        const { data, error } = await supabase
            .from('eid_cattle_members')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating group member:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Server error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
        }

        const { error } = await supabase
            .from('eid_cattle_members')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error removing group member:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Server error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
