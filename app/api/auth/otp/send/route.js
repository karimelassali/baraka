import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { sendSms } from '@/lib/sms';
import { normalizePhone } from '@/lib/phone-utils';

// Initialize Supabase Admin Client (needed to write to otp_codes if RLS is strict, or just to be safe)
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
        const { phone_number } = body;

        if (!phone_number) {
            return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
        }

        // Clean phone number (remove spaces, etc)
        const cleanedPhone = normalizePhone(phone_number);

        // Generate 6-digit code - Ensure string padding
        const code = Math.floor(100000 + Math.random() * 900000).toString().padStart(6, '0');

        // Save to Database
        // 1. Delete any existing codes for this number (invalidate old ones)
        const withPrefix = cleanedPhone.startsWith('+') ? cleanedPhone : '+39' + cleanedPhone;

        const { error: deleteError } = await supabase
            .from('otp_codes')
            .delete()
            .or(`phone_number.eq.${cleanedPhone},phone_number.eq.${phone_number},phone_number.eq.${withPrefix}`);

        // 2. Insert new code
        const { error: dbError } = await supabase
            .from('otp_codes')
            .insert({
                phone_number: cleanedPhone,
                code: code,
                created_at: new Date().toISOString()
            });

        if (dbError) {
            console.error('Database ID error:', dbError);
            throw new Error('Failed to generate verification code');
        }

        // Send SMS
        const smsResult = await sendSms(cleanedPhone, `Il tuo codice di verifica Baraka è: ${code}`);

        if (!smsResult.success) {
            throw new Error('Failed to send SMS: ' + smsResult.error);
        }

        return NextResponse.json({ success: true, message: 'OTP sent successfully' });

    } catch (error) {
        console.error('OTP Send Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
