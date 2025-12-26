
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
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

        const { phone_number, code } = await request.json();

        if (!phone_number || !code) {
            return NextResponse.json({ error: 'Phone number and code are required' }, { status: 400 });
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

        // 3. Verify OTP
        const { data: otpData, error: otpError } = await supabaseAdmin
            .from('otp_codes')
            .select('*')
            .eq('code', code)
            .eq('phone_number', cleanedPhone)
            .maybeSingle();

        if (otpError || !otpData) {
            return NextResponse.json({ error: 'Invalid or expired verification code' }, { status: 400 });
        }

        // Check expiry (10 mins)
        const expiryTime = new Date(new Date(otpData.created_at).getTime() + 10 * 60 * 1000);
        if (new Date() > expiryTime) {
            return NextResponse.json({ error: 'Verification code has expired.' }, { status: 400 });
        }

        // 4. Update Phone Number in Database

        // A. Update Auth User
        const { error: updateAuthError } = await supabaseAdmin.auth.admin.updateUserById(
            user.id,
            { phone: cleanedPhone, phone_confirm: true }
        );

        if (updateAuthError) {
            console.error("Auth Update Error", updateAuthError);
            return NextResponse.json({ error: 'Failed to update authentication record.' }, { status: 500 });
        }

        // B. Update Public Customer Record
        const { error: updateDbError } = await supabaseAdmin
            .from('customers')
            .update({
                phone_number: cleanedPhone,
                is_verified: true // Ensure verifying flag is set
            })
            .eq('auth_id', user.id);

        if (updateDbError) {
            console.error("DB Update Error", updateDbError);
            return NextResponse.json({ error: 'Failed to update customer profile.' }, { status: 500 });
        }

        // 5. Cleanup OTP
        await supabaseAdmin
            .from('otp_codes')
            .delete()
            .eq('id', otpData.id);

        return NextResponse.json({ success: true, message: 'Phone number updated successfully' });

    } catch (error) {
        console.error('Update Phone Confirm Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
