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
        const withPrefix = cleanedPhone.startsWith('+') ? cleanedPhone : '+39' + cleanedPhone;

        // Check the code
        const { data: otpData, error: otpError } = await supabase
            .from('otp_codes')
            .select('*')
            .eq('code', code)
            .or(`phone_number.eq.${cleanedPhone},phone_number.eq.${phone_number},phone_number.eq.${withPrefix}`)
            .limit(1)
            .maybeSingle();

        if (otpError || !otpData) {
            return NextResponse.json({ error: 'Invalid or expired verification code' }, { status: 400 });
        }

        // Check expiry (10 mins)
        const expiryTime = new Date(new Date(otpData.created_at).getTime() + 10 * 60 * 1000);
        if (new Date() > expiryTime) {
            return NextResponse.json({ error: 'Verification code has expired. Please request a new one.' }, { status: 400 });
        }

        // Code is valid - Mark user as verified
        // We need to look up the customer by phone number

        // 1. Find User Robustly using our new helper (need auth_id too)
        const { data: user, error: userError } = await findUserByPhone(supabase, phone_number, 'customers', 'id, auth_id');

        if (userError || !user) {
            return NextResponse.json({ error: 'Utente non trovato.' }, { status: 404 });
        }

        console.log('[OTP Verify] Found user:', user.id, 'auth_id:', user.auth_id);

        // 2. Update status in customers table
        const { error: updateError } = await supabase
            .from('customers')
            .update({ is_verified: true })
            .eq('id', user.id);

        if (updateError) {
            console.error("Verification Update Error:", updateError);
            return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
        }

        // 3. CRITICAL: Also confirm the user in Supabase Auth
        // This sets email_confirmed_at so user can login without "Email not confirmed" error
        if (user.auth_id) {
            console.log('[OTP Verify] Confirming Supabase Auth user:', user.auth_id);
            const { error: authError } = await supabase.auth.admin.updateUserById(
                user.auth_id,
                {
                    email_confirm: true,
                    // Also mark phone as confirmed if we want
                    phone_confirm: true
                }
            );

            if (authError) {
                console.error('[OTP Verify] Failed to confirm auth user:', authError);
                // Don't fail the whole request, user is still verified in customers table
            } else {
                console.log('[OTP Verify] Successfully confirmed Supabase Auth user');
            }
        }

        // Delete the used OTP
        await supabase
            .from('otp_codes')
            .delete()
            .eq('id', otpData.id);

        return NextResponse.json({
            success: true,
            message: 'Phone number verified successfully',
            user: user
        });

    } catch (error) {
        console.error('OTP Verify Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
