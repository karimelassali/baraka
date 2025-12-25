// app/api/admin/campaigns/send-one/route.js
// API to send SMS to a single recipient - used for real-time animation

import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '../../../../../lib/auth/server';
import { sendSms } from '@/lib/sms';

export async function POST(request) {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);
    const user = await getCurrentUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { phoneNumber, message, customerId, customerName, imageUrl } = await request.json();

    // Validate
    if (!phoneNumber || !message) {
        return NextResponse.json({ error: 'Phone number and message are required' }, { status: 400 });
    }

    try {
        // Use shared helper which handles formatting, environment checks, and MMS (mediaUrl)
        const twilioResult = await sendSms(phoneNumber, message, imageUrl);

        if (!twilioResult.success) {
            throw new Error(twilioResult.error);
        }

        // Log successfully sent SMS to database
        const { error: insertError } = await supabase
            .from('whatsapp_messages')
            .insert({
                customer_id: customerId,
                message_content: message + (imageUrl ? ` [Image: ${imageUrl}]` : ''),
                template_name: 'SMS_CAMPAIGN',
                message_type: 'SMS',
                status: 'sent',
                error_message: null
            });

        if (insertError) {
            console.error('Error logging SMS:', insertError);
        }

        return NextResponse.json({
            success: true,
            customerId,
            customerName,
            phoneNumber,
            messageSid: twilioResult.sid
        });

    } catch (error) {
        console.error(`Failed to send SMS to ${phoneNumber}:`, error.message);

        // Log failure to database
        await supabase
            .from('whatsapp_messages')
            .insert({
                customer_id: customerId,
                message_content: message + (imageUrl ? ` [Image: ${imageUrl}]` : ''),
                template_name: 'SMS_CAMPAIGN',
                message_type: 'SMS',
                status: 'failed',
                error_message: error.message
            });

        return NextResponse.json({
            success: false,
            customerId,
            customerName,
            phoneNumber,
            error: error.message
        });
    }
}
