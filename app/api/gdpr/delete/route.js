// app/api/gdpr/delete/route.js

import { createClient } from '../../../../lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request) {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);
  const { customerId } = await request.json();

  const { error } = await supabase
    .from('customers')
    .update({
      first_name: 'Anonymized',
      last_name: 'User',
      email: `${customerId}@anonymized.com`,
      phone_number: null,
      residence: null,
      date_of_birth: null,
      country_of_origin: null,
    })
    .eq('id', customerId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Customer data anonymized' });
}
