// app/api/admin/campaigns/send/route.js

import { createSupabaseServerClient } from '../../../../../lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getCurrentUser } from '../../../../../lib/auth/server';

export async function POST(request) {
  const cookieStore = cookies();
  const supabase = await createSupabaseServerClient(cookieStore);
  const user = await getCurrentUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { message, targetGroup, nationality, pointsThreshold } = await request.json();

  // Fetch target customers based on targetGroup
  let customersQuery = supabase
    .from('customers')
    .select('id, email, phone_number');
  
  if (targetGroup === 'nationality' && nationality) {
    customersQuery = customersQuery.ilike('country_of_origin', nationality);
  } else if (targetGroup === 'points' && pointsThreshold) {
    // For points-based campaigns, we would need to join with loyalty_points
    // For now, just fetch all customers
    customersQuery = customersQuery;
  }

  const { data: customers, error: customersError } = await customersQuery;

  if (customersError) {
    return NextResponse.json({ error: customersError.message }, { status: 500 });
  }

  // Insert messages for each customer
  const messagesToInsert = customers.map(customer => ({
    customer_id: customer.id,
    message_content: message,
    message_type: 'PROMOTIONAL',
    status: 'sent'
  }));

  if (messagesToInsert.length > 0) {
    const { error: insertError } = await supabase
      .from('whatsapp_messages')
      .insert(messagesToInsert);
    
    if (insertError) {
      console.error('Error saving messages:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ 
    message: `Campaign sent successfully to ${customers.length} customers` 
  });
}
