import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function PUT(request) {
    try {
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

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error updating client:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
