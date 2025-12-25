import twilio from 'twilio';

// Fallback to NEXT_PUBLIC_ prefixed vars (though not recommended for secrets)
const accountSid = process.env.TWILIO_ACCOUNT_SID || process.env.NEXT_PUBLIC_TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN || process.env.NEXT_PUBLIC_TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER || process.env.NEXT_PUBLIC_TWILIO_PHONE_NUMBER || process.env.TWILIO_SMS_NUMBER;

export const sendSms = async (to, body) => {
    if (!accountSid || !authToken) {
        console.error("Missing Twilio Account SID or Auth Token");
        return { success: false, error: "Missing Twilio config in .env" };
    }

    if (!fromNumber) {
        console.error("Missing TWILIO_PHONE_NUMBER in .env");
        return { success: false, error: "Missing 'From' number in .env" };
    }

    const client = twilio(accountSid, authToken);

    try {
        const message = await client.messages.create({
            body: body,
            from: fromNumber,
            to: to // Must include country code like +39...
        });

        console.log(`SMS Sent to ${to}: ${message.sid}`);
        return { success: true, sid: message.sid };
    } catch (error) {
        console.error(`Failed to send SMS to ${to}:`, error);
        return { success: false, error: error.message || error };
    }
};
