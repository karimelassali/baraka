import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

export const sendSms = async (to, body) => {
    if (!accountSid || !authToken) {
        console.error("Missing Twilio configuration");
        return { success: false, error: "Missing Twilio config" };
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
        return { success: false, error: error.message };
    }
};
