import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request) {
    try {
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);
        const body = await request.json();
        const { reservation_id, amount, notes, payment_method } = body;

        if (!reservation_id || !amount) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('eid_deposits')
            .insert([{
                reservation_id,
                amount: Number(amount),
                notes,
                payment_method
            }])
            .select()
            .single();

        if (error) {
            console.error('Error adding deposit:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Server error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(request) {
    try {
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);
        const { searchParams } = new URL(request.url);
        const reservation_id = searchParams.get('reservation_id');

        if (!reservation_id) {
            return NextResponse.json({ error: 'Missing reservation_id' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('eid_deposits')
            .select('*')
            .eq('reservation_id', reservation_id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching deposits:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Server error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
