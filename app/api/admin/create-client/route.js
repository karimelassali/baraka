import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const body = await request.json();
        const { email, password, firstName, lastName, phoneNumber, countryOfOrigin, residence } = body;

        if (!email || !password || !firstName || !lastName) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Initialize Supabase Admin Client
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        );

        // 1. Create user with email_confirm: false to prevent auto-email
        // Note: email_confirm: true would automatically confirm them. 
        // We want them unverified but NO email sent. 
        // Supabase's default behavior sends an email unless we auto-confirm.
        // However, to suppress the email but keep them unverified, we might need to rely on 
        // Supabase settings or use the admin API carefully.
        // Actually, admin.createUser usually auto-confirms unless specified otherwise, 
        // BUT it does NOT send an email by default unlike signUp.
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: false, // This ensures they are NOT verified immediately
            user_metadata: {
                first_name: firstName,
                last_name: lastName,
                phone_number: phoneNumber
            }
        });

        if (authError) throw authError;

        if (authData.user) {
            // 2. Create customer profile
            const { error: profileError } = await supabaseAdmin
                .from('customers')
                .insert([{
                    auth_id: authData.user.id,
                    email: email,
                    first_name: firstName,
                    last_name: lastName,
                    phone_number: phoneNumber,
                    country_of_origin: countryOfOrigin,
                    residence: residence,
                    gdpr_consent: true,
                    gdpr_consent_at: new Date().toISOString(),
                    is_active: true
                }]);

            if (profileError) {
                // If profile creation fails, we should probably delete the auth user to maintain consistency
                await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
                throw profileError;
            }
        }

        return NextResponse.json({ success: true, user: authData.user });

    } catch (error) {
        console.error('Error creating client:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
