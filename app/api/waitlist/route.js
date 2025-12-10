import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const body = await request.json();
        const { firstName, lastName, phoneNumber, country, email, city } = body;

        // Validation
        if (!firstName || !lastName || !phoneNumber || !country) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Initialize Supabase Admin Client (to bypass RLS if needed, or just standard client if public)
        // Using service role key to ensure we can write to the table regardless of RLS for now, 
        // though ideally this should be a public insert policy.
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
        );

        // Check if already exists in Waitlist
        const { data: existingWaitlist } = await supabase
            .from('waitlist')
            .select('id')
            .eq('phone_number', phoneNumber)
            .single();

        if (existingWaitlist) {
            return NextResponse.json({ error: 'You are already on the waitlist!', code: 'ALREADY_WAITLISTED' }, { status: 409 });
        }

        // Check if already exists in Customers (active user)
        const { data: existingCustomer } = await supabase
            .from('customers')
            .select('id')
            .eq('phone_number', phoneNumber)
            .single();

        if (existingCustomer) {
            return NextResponse.json({ error: 'You are already a registered member!', code: 'ALREADY_MEMBER' }, { status: 409 });
        }

        const { data, error } = await supabase
            .from('waitlist')
            .insert([
                {
                    first_name: firstName,
                    last_name: lastName,
                    phone_number: phoneNumber,
                    country: country,
                    email: email || null,
                    city: city || null,
                    status: 'pending'
                }
            ])
            .select();

        if (error) throw error;

        return NextResponse.json({ success: true, data });

    } catch (error) {
        console.error('Error registering for waitlist:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
