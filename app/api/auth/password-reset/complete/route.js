import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';


// Initialize Supabase Admin Client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY,
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
        const { resetToken, newPassword } = body;

        if (!resetToken || !newPassword) {
            return NextResponse.json({ error: 'Token and Password required' }, { status: 400 });
        }

        // 1. Verify Token
        const jwt = require('jsonwebtoken');
        const secret = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

        let payload;
        try {
            payload = jwt.verify(resetToken, secret);
        } catch (err) {
            return NextResponse.json({ error: 'Token non valido o scaduto: ' + err.message }, { status: 403 });
        }

        if (payload.purpose !== 'password_reset') {
            return NextResponse.json({ error: 'Token invalido per questa operazione.' }, { status: 403 });
        }

        // 2. Update Password
        const { error: updateError } = await supabase.auth.admin.updateUserById(
            payload.userId,
            { password: newPassword }
        );

        if (updateError) {
            throw updateError;
        }

        return NextResponse.json({
            success: true,
            message: 'Password aggiornata con successo.'
        });

    } catch (error) {
        console.error('Complete Reset Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
