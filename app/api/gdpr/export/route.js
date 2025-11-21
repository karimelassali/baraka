// app/api/gdpr/export/route.js

import { createClient } from '../../../../lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request) {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);
  const { customerId } = await request.json();

  const { data: customer, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', customerId)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(customer);
}
