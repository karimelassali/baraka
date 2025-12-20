import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '../../../../lib/supabase/server';
import { NextResponse } from 'next/server';
import { logAdminAction } from '../../../../lib/admin-logger';

export async function POST(request) {
    try {
        // Verify admin access first
        const supabase = await createServerClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: adminData, error: adminError } = await supabase
            .from('admin_users')
            .select('id')
            .eq('auth_id', user.id)
            .eq('is_active', true)
            .single();

        if (adminError || !adminData) {
            return NextResponse.json({ error: 'Access denied: Admin role required' }, { status: 403 });
        }

        const body = await request.json();
        const { email, password, firstName, lastName, phoneNumber, countryOfOrigin, residence } = body;

        if (!password || !firstName || !lastName || !phoneNumber) {
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

        // Check for existing client
        const { data: existingClients, error: searchError } = await supabaseAdmin
            .from('customers')
            .select('id, email, phone_number')
            .or(`phone_number.eq.${phoneNumber}${email ? `,email.eq.${email}` : ''}`);

        if (searchError) throw searchError;

        if (existingClients && existingClients.length > 0) {
            return NextResponse.json({
                error: 'Client already exists',
                code: 'DUPLICATE_CLIENT',
                details: existingClients[0]
            }, { status: 409 });
        }

        // Handle missing email
        const finalEmail = email || `${phoneNumber.replace(/\D/g, '')}@noemail.baraka`;

        // 1. Create user
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: finalEmail,
            password,
            email_confirm: false, // Do not auto-confirm. Admin can send verification later.
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
                    email: finalEmail,
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

            // Log the action
            await logAdminAction({
                action: 'CREATE',
                resource: 'customers',
                resourceId: authData.user.id,
                details: {
                    email: finalEmail,
                    firstName,
                    lastName,
                    phoneNumber,
                    country: countryOfOrigin
                },
                adminId: adminData.id
            });
        }

        return NextResponse.json({ success: true, user: authData.user });

    } catch (error) {
        console.error('Error creating client:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

