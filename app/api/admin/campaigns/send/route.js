// app/api/admin/campaigns/send/route.js

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getCurrentUser } from '../../../../../lib/auth/server';
import { parsePhoneNumber } from 'libphonenumber-js';

// Twilio credentials
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_SMS_NUMBER || process.env.TWILIO_PHONE_NUMBER;

// Function to send SMS via Twilio API
async function sendSms(to, body) {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;

  const formData = new URLSearchParams();
  formData.append('Body', body);
  formData.append('To', to);
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

  const { message, targetGroup, nationality, pointsThreshold, selectedCustomerIds } = await request.json();

  // Validate message
  if (!message || message.trim().length === 0) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 });
  }

  // Check Twilio configuration
  if (!TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    return NextResponse.json({
      error: 'SMS service not configured. Please set TWILIO_AUTH_TOKEN and TWILIO_PHONE_NUMBER environment variables.'
    }, { status: 500 });
  }

  // Use admin client to bypass RLS and ensure access to views
  const supabaseAdmin = createAdminClient();

  // Fetch target customers based on targetGroup
  let customersQuery = supabaseAdmin
    .from('customers')
    .select('id, email, phone_number, first_name, last_name')
    .not('phone_number', 'is', null); // Only customers with phone numbers

  if (targetGroup === 'nationality' && nationality) {
    customersQuery = customersQuery.ilike('country_of_origin', `%${nationality}%`);
  } else if (targetGroup === 'points' && pointsThreshold) {
    // Join with view to filter by points
    customersQuery = supabaseAdmin
      .from('customers')
      .select('id, email, phone_number, first_name, last_name, customer_points_balance!inner(total_points)')
      .not('phone_number', 'is', null)
      .gte('customer_points_balance.total_points', parseInt(pointsThreshold));
  } else if (targetGroup === 'specific' && selectedCustomerIds && selectedCustomerIds.length > 0) {
    customersQuery = customersQuery.in('id', selectedCustomerIds);
  }

  const { data: customers, error: customersError } = await customersQuery;

  if (customersError) {
    return NextResponse.json({ error: customersError.message }, { status: 500 });
  }

  if (!customers || customers.length === 0) {
    return NextResponse.json({ error: 'No customers found matching the criteria' }, { status: 400 });
  }

  // Send SMS to each customer
  const results = {
    total: customers.length,
    success: 0,
    failed: 0,
    details: []
  };



  for (const customer of customers) {
    try {
      let phone = customer.phone_number;

      // Robust Phone Formatting
      try {
        // Default to IT if no country code provided
        const phoneNumber = parsePhoneNumber(phone, 'IT');
        if (phoneNumber && phoneNumber.isValid()) {
          phone = phoneNumber.number; // E.164 format (e.g., +393331234567)
        } else {
          // If parsing fails but it's not empty, we might try sending as is, or log warning
          console.warn(`Invalid phone format for customer ${customer.id}: ${phone}. Trying to send anyway.`);
        }
      } catch (e) {
        console.warn(`Error parsing phone ${phone}: ${e.message}`);
      }

      await sendSms(phone, message);
      results.success++;
      results.details.push({
        customerId: customer.id,
        phone: phone, // Log the formatted phone
        success: true
      });
    } catch (error) {
      results.failed++;
      results.details.push({
        customerId: customer.id,
        phone: customer.phone_number,
        success: false,
        error: error.message
      });
      console.error(`Failed to send SMS to ${customer.phone_number}:`, error.message);
    }
  }

  // Store campaign in database
  const messagesToInsert = customers.map((customer, index) => {
    const detail = results.details[index];
    return {
      customer_id: customer.id,
      message_content: message,
      template_name: null,
      message_type: 'SMS',
      status: detail?.success ? 'sent' : 'failed',
      error_message: detail?.error || null
    };
  });

  if (messagesToInsert.length > 0) {
    // Try to insert into sms_messages table, fallback to whatsapp_messages if not exists
    const { error: insertError } = await supabase
      .from('sms_messages')
      .insert(messagesToInsert);

    if (insertError) {
      // If sms_messages table doesn't exist, try whatsapp_messages
      const { error: fallbackError } = await supabase
        .from('whatsapp_messages')
        .insert(messagesToInsert);

      if (fallbackError) {
        console.error('Error saving messages:', fallbackError);
        // Don't return error as SMS was already sent
      }
    }
  }

  return NextResponse.json({
    message: `SMS Campaign completed: ${results.success} sent successfully, ${results.failed} failed out of ${results.total} total`,
    results
  });
}
