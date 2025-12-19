import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request) {
    // 1. Environment Check
    if (process.env.NODE_ENV !== 'development') {
        return NextResponse.json({ error: 'Forbidden: Dev environment only' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { table } = body;

        if (!table) {
            return NextResponse.json({ error: 'Table name is required' }, { status: 400 });
        }

        // 2. Initialize Service Role Client
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
        if (!serviceRoleKey) {
            return NextResponse.json({ error: 'Service Role Key missing' }, { status: 500 });
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            serviceRoleKey,
            { auth: { persistSession: false } }
        );

        // 3. Clear Data (Delete all rows)
        // Using a condition that is always true for UUIDs to delete all
        // Assuming 'id' column exists and is not null. 
        // Most tables have 'id'. If not, this might fail.
        const { error } = await supabase
            .from(table)
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete everything that isn't the nil UUID (which shouldn't exist anyway)

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: `Table ${table} cleared successfully` });

    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
