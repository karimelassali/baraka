import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { findUserByPhone, normalizePhone } from '@/lib/phone-utils';

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
        const { phone_number, code } = body;

        if (!phone_number || !code) {
            return NextResponse.json({ error: 'Phone number and code are required' }, { status: 400 });
        }

        const cleanedPhone = normalizePhone(phone_number);

        // 1. Verify OTP
        const withPrefix = cleanedPhone.startsWith('+') ? cleanedPhone : '+39' + cleanedPhone;

        const { data: otpData, error: otpError } = await supabase
            .from('otp_codes')
            .select('*')
            .eq('code', code)
            .or(`phone_number.eq.${cleanedPhone},phone_number.eq.${phone_number},phone_number.eq.${withPrefix}`)
            .limit(1)
            .maybeSingle();

        if (otpError || !otpData) {
            return NextResponse.json({ error: 'Codice non valido o scaduto.' }, { status: 400 });
        }

        // Check expiry (10 mins)
        const expiryTime = new Date(new Date(otpData.created_at).getTime() + 10 * 60 * 1000);
        if (new Date() > expiryTime) {
            return NextResponse.json({ error: 'Il codice è scaduto. Richiedine uno nuovo.' }, { status: 400 });
        }

        // 2. Find User - Robust Lookup
        const { data: user, error: userError } = await findUserByPhone(supabase, phone_number, 'customers', 'auth_id, id');

        if (userError || !user) {
            return NextResponse.json({ error: 'Nessun utente trovato con questo numero.' }, { status: 404 });
        }

        // 3. Generate Temporary Reset Token with JWT
        const jwt = require('jsonwebtoken');
        const secret = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

        if (!secret) {
            console.error("No service role key found for signing token");
            return NextResponse.json({ error: "Configuration error" }, { status: 500 });
        }

        const resetToken = jwt.sign(
            {
                userId: user.auth_id,
                purpose: 'password_reset'
            },
            secret,
            { expiresIn: '5m' }
        );

        // Delete used OTP
        await supabase.from('otp_codes').delete().eq('id', otpData.id);

        return NextResponse.json({
            success: true,
            resetToken: resetToken
        });

    } catch (error) {
        console.error('Reset Verify Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
