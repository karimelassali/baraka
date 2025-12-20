import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '../../../../lib/supabase/server';
import { NextResponse } from 'next/server';
import { logAdminAction } from '../../../../lib/admin-logger';

export async function PUT(request) {
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
        const { id, firstName, lastName, email, phoneNumber, countryOfOrigin, residence } = body;

        if (!id) {
            return NextResponse.json({ error: 'Missing client ID' }, { status: 400 });
        }

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
        );

        // Update customers table
        const { error: updateError } = await supabaseAdmin
            .from('customers')
            .update({
                first_name: firstName,
                last_name: lastName,
                email: email,
                phone_number: phoneNumber,
                country_of_origin: countryOfOrigin,
                residence: residence
            })
            .eq('id', id);

        if (updateError) throw updateError;

        // Log the action
        await logAdminAction({
            action: 'UPDATE',
            resource: 'customers',
            resourceId: id,
            details: {
                firstName,
                lastName,
                email,
                phoneNumber,
                country: countryOfOrigin,
                residence
            },
            adminId: adminData.id
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error updating client:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

