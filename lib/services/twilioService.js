// lib/services/twilioService.js

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';
const contentSid = process.env.TWILIO_CONTENT_SID;

let twilioClient = null;

// Initialize Twilio client
function getTwilioClient() {
    if (!twilioClient) {
        if (!accountSid || !authToken) {
            throw new Error('Twilio credentials not configured');
        }
        const twilio = require('twilio');
        twilioClient = twilio(accountSid, authToken);
    }
    return twilioClient;
}

/**
 * Format phone number to WhatsApp format
 * @param {string} phoneNumber - Phone number (with or without country code)
 * @returns {string} Formatted WhatsApp number
 */
function formatWhatsAppNumber(phoneNumber) {
    if (!phoneNumber) return null;

    // Remove all non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, '');

    // If number doesn't start with country code, assume it's Italian (+39)
    if (!cleaned.startsWith('39') && cleaned.length === 10) {
        cleaned = '39' + cleaned;
    }

    return `whatsapp:+${cleaned}`;
}

/**
 * Send WhatsApp message using template
 * @param {string} to - Recipient phone number
 * @param {object} contentVariables - Template variables
 * @returns {Promise<object>} Message result
 */
async function sendTemplateMessage(to, contentVariables = {}) {
    try {
        const client = getTwilioClient();
        const formattedTo = formatWhatsAppNumber(to);

        if (!formattedTo) {
            throw new Error('Invalid phone number');
        }

        const messageData = {
            from: whatsappFrom,
            to: formattedTo,
        };

        // Use content template if available
        if (contentSid) {
            messageData.contentSid = contentSid;
            messageData.contentVariables = JSON.stringify(contentVariables);
        } else {
            throw new Error('Content SID not configured');
        }

        const message = await client.messages.create(messageData);

        return {
            success: true,
            sid: message.sid,
            status: message.status,
            to: formattedTo
        };
    } catch (error) {
        console.error('Twilio error:', error);
        return {
            success: false,
            error: error.message,
            to: formatWhatsAppNumber(to)
        };
    }
}

/**
 * Send custom WhatsApp message
 * @param {string} to - Recipient phone number
 * @param {string} body - Message body
 * @returns {Promise<object>} Message result
 */
async function sendCustomMessage(to, body) {
    try {
        const client = getTwilioClient();
        const formattedTo = formatWhatsAppNumber(to);

        if (!formattedTo) {
            throw new Error('Invalid phone number');
        }

        const message = await client.messages.create({
            from: whatsappFrom,
            to: formattedTo,
            body: body
        });

        return {
            success: true,
            sid: message.sid,
            status: message.status,
            to: formattedTo
        };
    } catch (error) {
        console.error('Twilio error:', error);
        return {
            success: false,
            error: error.message,
            to: formatWhatsAppNumber(to)
        };
    }
}

/**
 * Send bulk WhatsApp messages with rate limiting
 * @param {Array} recipients - Array of {phoneNumber, message, variables}
 * @param {boolean} useTemplate - Whether to use template (default: true for WhatsApp compliance)
 * @returns {Promise<object>} Bulk send results
 */
async function sendBulkMessages(recipients, useTemplate = true) {
    const results = {
        total: recipients.length,
        success: 0,
        failed: 0,
        details: []
    };

    console.log(`Starting bulk send to ${recipients.length} recipients (useTemplate: ${useTemplate})`);

    // Send messages with a small delay to avoid rate limiting
    for (const recipient of recipients) {
        let result;

        try {
            if (useTemplate) {
                // For template messages, extract variables or use default
                const variables = recipient.variables || {
                    "1": recipient.message || "Hello",
                    "2": "Baraka Restaurant"
                };
                result = await sendTemplateMessage(recipient.phoneNumber, variables);
            } else {
                result = await sendCustomMessage(recipient.phoneNumber, recipient.message);
            }

            if (result.success) {
                results.success++;
                console.log(`✓ Message sent to ${recipient.phoneNumber}`);
            } else {
                results.failed++;
                console.error(`✗ Failed to send to ${recipient.phoneNumber}: ${result.error}`);
            }

            results.details.push({
                phoneNumber: recipient.phoneNumber,
                ...result
            });

            // Add delay between messages (respecting Twilio rate limits)
            // Twilio allows 1 message per second for WhatsApp
            if (recipients.indexOf(recipient) < recipients.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 1100));
            }
        } catch (error) {
            console.error(`Exception sending to ${recipient.phoneNumber}:`, error);
            results.failed++;
            results.details.push({
                phoneNumber: recipient.phoneNumber,
                success: false,
                error: error.message
            });
        }
    }

    console.log(`Bulk send complete: ${results.success} success, ${results.failed} failed`);
    return results;
}

module.exports = {
    sendTemplateMessage,
    sendCustomMessage,
    sendBulkMessages,
    formatWhatsAppNumber
};
