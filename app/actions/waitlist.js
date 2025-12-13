'use server';

import { createClient } from '@supabase/supabase-js';

export async function joinWaitlist(prevState, formData) {
    const firstName = formData.get('firstName');
    const lastName = formData.get('lastName');
    const phoneNumber = formData.get('phoneNumber');
    const country = formData.get('country');
    const email = formData.get('email');
    const city = formData.get('city');

    // Validation
    if (!firstName || !lastName || !phoneNumber || !country) {
        return { error: 'Missing required fields', success: false };
    }

    try {
        // Initialize Supabase Admin Client
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
            return { error: 'You are already on the waitlist!', code: 'ALREADY_WAITLISTED', success: false };
        }

        // Check if already exists in Customers (active user)
        const { data: existingCustomer } = await supabase
            .from('customers')
            .select('id')
            .eq('phone_number', phoneNumber)
            .single();

        if (existingCustomer) {
            return { error: 'You are already a registered member!', code: 'ALREADY_MEMBER', success: false };
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

        return { success: true, data };

    } catch (error) {
        console.error('Error registering for waitlist:', error);
        return { error: 'Internal Server Error', success: false };
    }
}
