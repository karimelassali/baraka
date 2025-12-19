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

    // 3. Measure Performance & Fetch Stats
    const start = performance.now();

    try {
        // Fetch count
        const { count, error } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });

        const end = performance.now();
        const timeMs = Math.round(end - start);

        if (error) {
            return NextResponse.json({
                table,
                status: 'error',
                error: error.message,
                timeMs
            });
        }

        return NextResponse.json({
            table,
            count,
            timeMs,
            status: 'healthy'
        });

    } catch (err) {
        return NextResponse.json({
            table,
            status: 'error',
            error: err.message,
            timeMs: 0
        });
    }
}
