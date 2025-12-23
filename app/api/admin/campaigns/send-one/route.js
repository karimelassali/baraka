// app/api/admin/campaigns/send-one/route.js
// API to send SMS to a single recipient - used for real-time animation

import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '../../../../../lib/auth/server';

// Twilio credentials
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
// Use SMS phone number from env (supports TWILIO_SMS_NUMBER, TWILIO_PHONE_NUMBER, or extracted from WhatsApp)
const TWILIO_PHONE_NUMBER = process.env.TWILIO_SMS_NUMBER || process.env.TWILIO_PHONE_NUMBER ||
    (process.env.TWILIO_WHATSAPP_FROM ? process.env.TWILIO_WHATSAPP_FROM.replace('whatsapp:', '') : null);

// Phone number formatting algorithm for E.164 format
function formatPhoneNumber(phone) {
    if (!phone) return null;

    // Remove all non-numeric characters except +
    let cleaned = phone.replace(/[^\d+]/g, '');

    // If already starts with +, assume it's correct format
    if (cleaned.startsWith('+')) {
        return cleaned;
    }

    // Remove leading zeros
    cleaned = cleaned.replace(/^0+/, '');

    // Common country code patterns detection
    // Italian numbers: start with 3 (mobile) after removing 0, typically 10 digits
    // Irish numbers: start with 353
    // US/Canada: 10 digits, add +1
    // UK: starts with 44

    // If starts with known country codes, just add +
    const countryCodePrefixes = ['1', '33', '34', '39', '41', '43', '44', '45', '46', '47', '48', '49',
        '61', '81', '86', '91', '353', '354', '358', '380', '420', '421'];

    for (const code of countryCodePrefixes) {
        if (cleaned.startsWith(code)) {
            // Check if this looks like a valid number with this code
            const afterCode = cleaned.slice(code.length);
            // Mobile numbers typically have 9-10 digits after country code
            if (afterCode.length >= 8 && afterCode.length <= 12) {
                return '+' + cleaned;
            }
        }
    }

    // If number is 10 digits and starts with 3 (Italian mobile pattern)
    if (cleaned.length === 10 && cleaned.startsWith('3')) {
        return '+39' + cleaned; // Add Italian country code
    }

    // If number is 9 digits (could be Italian without leading 0)
    if (cleaned.length === 9 && cleaned.startsWith('3')) {
        return '+39' + cleaned;
    }

    // If 10-11 digits, assume it needs + prefix
    if (cleaned.length >= 10 && cleaned.length <= 13) {
        return '+' + cleaned;
    }

    // Last resort: just add + and hope for the best
    return '+' + cleaned;
}

// Function to send SMS via Twilio API
async function sendSms(to, body) {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;

    // Format phone number to E.164
    const formattedPhone = formatPhoneNumber(to);

    if (!formattedPhone) {
        throw new Error('Invalid phone number format');
    }

    const formData = new URLSearchParams();
    formData.append('Body', body);
    formData.append('To', formattedPhone);
    formData.append('From', TWILIO_PHONE_NUMBER);

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || 'Failed to send SMS');
    }

    return result;
}

export async function POST(request) {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);
    const user = await getCurrentUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { phoneNumber, message, customerId, customerName } = await request.json();

    // Validate
    if (!phoneNumber || !message) {
        return NextResponse.json({ error: 'Phone number and message are required' }, { status: 400 });
    }

    // Check Twilio configuration
    if (!TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
        return NextResponse.json({
            error: 'SMS service not configured. Please set TWILIO_AUTH_TOKEN and TWILIO_PHONE_NUMBER (or TWILIO_WHATSAPP_FROM) environment variables.'
        }, { status: 500 });
    }

    try {
        const twilioResult = await sendSms(phoneNumber, message);

        // Log to database
        const { error: insertError } = await supabase
            .from('whatsapp_messages')
            .insert({
                customer_id: customerId,
                message_content: message,
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
                message_content: message,
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
