
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { sendSms } from '@/lib/sms';
import { normalizePhone } from '@/lib/phone-utils';

export async function POST(request) {
    try {
        const cookieStore = await cookies();
        const supabase = await createClient(cookieStore);

        // 1. Verify Authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { phone_number } = await request.json();

        if (!phone_number) {
            return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
        }

        const cleanedPhone = normalizePhone(phone_number);

        // 2. Initialize Admin Client
        const supabaseAdmin = createServiceClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        );

        // 3. Check if phone is already taken by ANOTHER user
        // (We exclude the current user's potential duplicate entry if any, though auth_id check is key)
        const { data: existingUser, error: checkError } = await supabaseAdmin
            .from('customers')
            .select('id')
            .eq('phone_number', cleanedPhone)
            .neq('auth_id', user.id) // It's okay if it's currently assigned to THIS user (though that means no change)
            .maybeSingle();

        if (existingUser) {
            return NextResponse.json({ error: 'Phone number is already in use by another account.' }, { status: 409 });
        }

        // 4. Generate & Save OTP
        const code = Math.floor(100000 + Math.random() * 900000).toString().padStart(6, '0');

        // Delete old codes for this phone
        await supabaseAdmin
            .from('otp_codes')
            .delete()
            .eq('phone_number', cleanedPhone);

        const { error: insertError } = await supabaseAdmin
            .from('otp_codes')
            .insert({
                phone_number: cleanedPhone,
                code: code,
                created_at: new Date().toISOString()
            });

        if (insertError) {
            throw new Error('Failed to generate verification code');
        }

        // 5. Send SMS
        const smsResult = await sendSms(cleanedPhone, `Il tuo codice di verifica per cambiare numero su Baraka è: ${code}`);

        if (!smsResult.success) {
            throw new Error('Failed to send SMS: ' + smsResult.error);
        }

        return NextResponse.json({ success: true, message: 'OTP sent successfully' });

    } catch (error) {
        console.error('Update Phone Request Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
