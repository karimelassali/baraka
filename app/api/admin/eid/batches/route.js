import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const supplier_id = searchParams.get('supplier_id');

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    try {
        let query = supabase
            .from('eid_purchase_batches')
            .select('*, eid_suppliers(name)');

        if (supplier_id) {
            query = query.eq('supplier_id', supplier_id);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    const body = await request.json();
    const { supplier_id, batch_number, notes } = body;

    if (!supplier_id || !batch_number) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    try {
        const { data, error } = await supabase
            .from('eid_purchase_batches')
            .insert([{ supplier_id, batch_number, notes }])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
