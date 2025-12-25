import twilio from 'twilio';

// Fallback to NEXT_PUBLIC_ prefixed vars (though not recommended for secrets)
const accountSid = process.env.TWILIO_ACCOUNT_SID || process.env.NEXT_PUBLIC_TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN || process.env.NEXT_PUBLIC_TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER || process.env.NEXT_PUBLIC_TWILIO_PHONE_NUMBER || process.env.TWILIO_SMS_NUMBER;

// Helper to format phone number to E.164
const formatPhoneNumber = (phone) => {
    if (!phone) return null;
    // Remove spaces, parens, dashes
    let p = phone.replace(/[\s\-\(\)\.]/g, '');

    // If it starts with +, trust it
    if (p.startsWith('+')) return p;

    // If it starts with 00, replace with +
    if (p.startsWith('00')) return '+' + p.substring(2);

    // Heuristics for Italy (most likely audience)
    // Mobile numbers usually start with 3 and are 10 digits
    // Landlines start with 0
    if (p.length >= 9 && p.length <= 10) {
        return '+39' + p;
    }

    // Default: prepend + assuming country code was intended but + omitted? 
    // Or if it's really raw like '3331234567', treating as IT is safer for this user base.
    // If it's 11+ digits, maybe it has country code but no +?
    if (p.length > 10 && (p.startsWith('39') || p.startsWith('33') || p.startsWith('1'))) {
        return '+' + p;
    }

    // Last resort
    return '+' + p;
};

/**
 * Send SMS using Twilio
 * @param {string} to - Recipient number (e.g. +39...)
 * @param {string} body - Text content
 * @param {string} [mediaUrl] - Optional URL of image to attach (MMS)
 */
export const sendSms = async (to, body, mediaUrl) => {
    if (!accountSid || !authToken) {
        console.error("Missing Twilio Account SID or Auth Token");
        return { success: false, error: "Missing Twilio config in .env" };
    }

    if (!fromNumber) {
        console.error("Missing TWILIO_PHONE_NUMBER in .env");
        return { success: false, error: "Missing 'From' number in .env" };
    }

    const formattedTo = formatPhoneNumber(to);
    if (!formattedTo) {
        return { success: false, error: "Invalid Phone Number" };
    }

    const client = twilio(accountSid, authToken);

    try {
        const messageOptions = {
            body: body,
            from: fromNumber,
            to: formattedTo
        };

        if (mediaUrl) {
            messageOptions.mediaUrl = [mediaUrl];
        }

        const message = await client.messages.create(messageOptions);

        console.log(`SMS/MMS Sent to ${formattedTo}: ${message.sid}. Media: ${mediaUrl || 'None'}`);
        return { success: true, sid: message.sid };
    } catch (error) {
        console.error(`Failed to send SMS to ${formattedTo} (Cleaned from ${to}):`, error);
        return { success: false, error: error.message || error };
    }
};
