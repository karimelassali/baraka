import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { findUserByPhone } from '@/lib/phone-utils';

// Initialize Supabase Admin Client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

export async function POST(request) {
    try {
        const body = await request.json();
        const { phone } = body;

        if (!phone) {
            return NextResponse.json({ error: 'Phone number required' }, { status: 400 });
        }

        console.log('[LookupUser] Received phone:', phone);

        // Use helper to find user robustly
        const { data: user, error } = await findUserByPhone(supabase, phone, 'customers', 'email');

        console.log('[LookupUser] Result:', { found: !!user, email: user?.email, error });

        if (error) {
            console.error('Lookup DB Error:', error);
            return NextResponse.json({ error: 'System error' }, { status: 500 });
        }

        if (!user) {
            // Return 404
            return NextResponse.json({ error: 'Utente non trovato' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            email: user.email
        });

    } catch (error) {
        console.error('Lookup Error:', error);
        return NextResponse.json({ error: 'System error' }, { status: 500 });
    }
}
