// app/api/customer/vouchers/route.js

import { createClient } from '../../../../lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request) {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // First, get the customer record to retrieve the correct customer ID
  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .select('id')
    .eq('auth_id', user.id)
    .maybeSingle();

  if (customerError) {
    return NextResponse.json({ error: customerError.message }, { status: 500 });
  }

  if (!customer) {
    return NextResponse.json([]);
  }

  // Now fetch vouchers for this customer
  const { data: vouchers, error: vouchersError } = await supabase
    .from('vouchers')
    .select('*')
    .eq('customer_id', customer.id);

  if (vouchersError) {
    return NextResponse.json({ error: vouchersError.message }, { status: 500 });
  }

  return NextResponse.json(vouchers);
}
