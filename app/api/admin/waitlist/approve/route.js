import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const body = await request.json();
        const { id } = body; // Waitlist ID

        if (!id) {
            return NextResponse.json({ error: 'Missing waitlist ID' }, { status: 400 });
        }

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

        // 1. Get waitlist entry
        const { data: entry, error: fetchError } = await supabase
            .from('waitlist')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError || !entry) {
            return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
        }

        if (entry.status === 'approved') {
            return NextResponse.json({ error: 'Already approved' }, { status: 400 });
        }

        // 2. Create User & Customer (Logic similar to create-client)
        const email = entry.email || `${entry.phone_number.replace(/\D/g, '')}@noemail.baraka`;
        const password = 'TempPassword123!'; // Default password for now

        // Check for existing user in auth or customers to avoid duplicates
        // (Simplified check, ideally check both)

        // Create Auth User
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true, // Auto confirm since admin approved
            user_metadata: {
                first_name: entry.first_name,
                last_name: entry.last_name,
                phone_number: entry.phone_number
            }
        });

        if (authError) {
            // If user already exists, we might just want to link them or error out.
            // For now, let's error out to be safe.
            throw authError;
        }

        // Create Customer Profile
        if (authData.user) {
            const { error: profileError } = await supabase
                .from('customers')
                .insert([{
                    auth_id: authData.user.id,
                    email: email,
                    first_name: entry.first_name,
                    last_name: entry.last_name,
                    phone_number: entry.phone_number,
                    country_of_origin: entry.country,
                    residence: entry.city || '', // Map city to residence if available
                    gdpr_consent: true,
                    gdpr_consent_at: new Date().toISOString(),
                    is_active: true
                }]);

            if (profileError) {
                // Cleanup auth user if profile fails
                await supabase.auth.admin.deleteUser(authData.user.id);
                throw profileError;
            }
        }

        // 3. Update Waitlist Status
        const { error: updateError } = await supabase
            .from('waitlist')
            .update({ status: 'approved' })
            .eq('id', id);

        if (updateError) console.error('Failed to update waitlist status', updateError);

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error approving waitlist entry:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
