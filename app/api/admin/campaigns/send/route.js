// app/api/admin/campaigns/send/route.js

import { createClient } from '../../../../../lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getCurrentUser } from '../../../../../lib/auth/server';
import { sendBulkMessages } from '../../../../../lib/services/twilioService';

export async function POST(request) {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { message, targetGroup, nationality, pointsThreshold } = await request.json();

  // Validate message
  if (!message || message.trim().length === 0) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 });
  }

  // Fetch target customers based on targetGroup
  let customersQuery = supabase
    .from('customers')
    .select('id, email, phone_number, first_name, last_name')
    .not('phone_number', 'is', null); // Only customers with phone numbers

  if (targetGroup === 'nationality' && nationality) {
    customersQuery = customersQuery.ilike('country_of_origin', `%${nationality}%`);
  } else if (targetGroup === 'points' && pointsThreshold) {
    customersQuery = customersQuery.gte('total_points', parseInt(pointsThreshold));
  }

  const { data: customers, error: customersError } = await customersQuery;

  if (customersError) {
    return NextResponse.json({ error: customersError.message }, { status: 500 });
  }

  if (!customers || customers.length === 0) {
    return NextResponse.json({ error: 'No customers found matching the criteria' }, { status: 400 });
  }

  // Prepare recipients for bulk sending
  // For WhatsApp compliance, we use template messages by default
  const recipients = customers.map(customer => ({
    phoneNumber: customer.phone_number,
    message: message, // This will be ignored if using template
    variables: {
      "1": customer.first_name || "Customer",
      "2": message // Use the message as one of the template variables
    },
    customerId: customer.id
  }));

  let twilioResults = null;
  let twilioError = null;

  // Try to send via Twilio using template (true) or custom message (false)
  // WhatsApp requires approved templates, so we use template by default
  try {
    twilioResults = await sendBulkMessages(recipients, true); // Use template
  } catch (error) {
    console.error('Twilio bulk send error:', error);
    twilioError = error.message;
  }

  // Store campaign in database regardless of Twilio success
  const messagesToInsert = customers.map((customer, index) => {
    const twilioDetail = twilioResults?.details?.[index];

    return {
      customer_id: customer.id,
      message_content: message,
      template_name: 'TEST',
      message_type: 'PROMOTIONAL',
      status: twilioDetail?.success ? 'sent' : 'failed',
      error_message: twilioDetail?.error || twilioError || null
    };
  });

  if (messagesToInsert.length > 0) {
    const { error: insertError } = await supabase
      .from('whatsapp_messages')
      .insert(messagesToInsert);

    if (insertError) {
      console.error('Error saving messages:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
  }

  // Prepare response message
  let responseMessage = '';
  if (twilioResults) {
    responseMessage = `Campaign processed: ${twilioResults.success} sent successfully, ${twilioResults.failed} failed out of ${twilioResults.total} total`;
  } else {
    responseMessage = `Campaign saved to database for ${customers.length} customers, but WhatsApp delivery failed: ${twilioError}`;
  }

  return NextResponse.json({
    message: responseMessage,
    results: {
      total: customers.length,
      success: twilioResults?.success || 0,
      failed: twilioResults?.failed || customers.length,
      twilioError: twilioError
    }
  });
}
