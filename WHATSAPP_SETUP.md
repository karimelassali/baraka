# Twilio WhatsApp Setup Guide

## Important: WhatsApp Opt-In Requirement

Before you can receive WhatsApp messages, **you must opt-in to the Twilio Sandbox**:

### Steps to Opt-In:

1. **Send a WhatsApp message** from your phone (+393791815268) to the Twilio number: `+1 415 523 8886`

2. **Message content**: Send exactly this text:
   ```
   join cattle-carbon
   ```
   (This code may be different - check your Twilio console for your specific join code)

3. **Wait for confirmation**: You should receive a reply from Twilio confirming you've joined the sandbox.

4. **Now test the campaign**: After opt-in, send a test campaign and you should receive the message.

## How to Find Your Join Code:

1. Go to Twilio Console: https://console.twilio.com/
2. Navigate to **Messaging** → **Try it out** → **Send a WhatsApp message**
3. Look for the "Sandbox" section - it will show your join code

## Template Variables:

The current template (contentSid: `HXb5b62575e6e4ff6129ad7c8efe1f983e`) expects 2 variables:
- `"1"`: Customer first name (we use this)
- `"2"`: Custom message content (we pass your campaign message here)

## Troubleshooting:

**Still not receiving messages?**
1. ✓ Check if you've opted in (send the join message)
2. ✓ Verify your WhatsApp number matches: +393791815268
3. ✓ Check Twilio console logs for delivery status
4. ✓ Ensure the template is approved in Twilio

**Production Setup (when ready):**
- Request WhatsApp Business API access from Twilio
- Get your message templates approved
- Update from Sandbox to production number
