import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'suppliers' or 'destinations'

    if (!type || !['suppliers', 'destinations'].includes(type)) {
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const tableName = type === 'suppliers' ? 'eid_suppliers' : 'eid_destinations';

    try {
        const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    const body = await request.json();
    const { type, name, extra } = body; // extra is contact_info or location

    if (!type || !['suppliers', 'destinations'].includes(type) || !name) {
        return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const tableName = type === 'suppliers' ? 'eid_suppliers' : 'eid_destinations';
    const extraField = type === 'suppliers' ? 'contact_info' : 'location';

    try {
        const { data, error } = await supabase
            .from(tableName)
            .insert([{ name, [extraField]: extra }])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    if (!type || !['suppliers', 'destinations'].includes(type) || !id) {
        return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const tableName = type === 'suppliers' ? 'eid_suppliers' : 'eid_destinations';

    try {
        const { error } = await supabase
            .from(tableName)
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
