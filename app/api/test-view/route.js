
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
    );

    const { data, error } = await supabaseAdmin
        .from('admin_customers_extended')
        .select('id')
        .limit(1);

    return NextResponse.json({ data, error });
}
