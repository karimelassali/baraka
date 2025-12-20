import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { logAdminAction } from '../../../../lib/admin-logger';

export async function PUT(request) {
    try {
        const body = await request.json();
        const { id, firstName, lastName, email, phoneNumber, countryOfOrigin, residence, accessPassword } = body;

        // Verify access via password (no session needed)
        const expectedPassword = process.env.NEXT_PUBLIC_ADD_CLIENT_PASSWORD;
        if (!accessPassword || accessPassword !== expectedPassword) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

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

        // Log the action (no admin session, so use null for adminId)
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
                residence,
                source: 'add-client-page'
            },
            adminId: null
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error updating client:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
