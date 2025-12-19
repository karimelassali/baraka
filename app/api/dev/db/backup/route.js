import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(request) {
    // 1. Environment Check
    if (process.env.NODE_ENV !== 'development') {
        return NextResponse.json({ error: 'Forbidden: Dev environment only' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const table = searchParams.get('table');

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

    try {
        // Fetch all data
        const { data, error } = await supabase
            .from(table)
            .select('*');

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Return as JSON file download
        const jsonString = JSON.stringify(data, null, 2);

        return new NextResponse(jsonString, {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="${table}_backup_${new Date().toISOString().split('T')[0]}.json"`
            }
        });

    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
