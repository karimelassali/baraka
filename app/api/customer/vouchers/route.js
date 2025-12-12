import { createClient } from '../../../../lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Initialize Service Role Client to bypass RLS
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    console.error('CRITICAL: Service Role Key is missing!');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  const supabaseAdmin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  // First, get the customer record to retrieve the correct customer ID
  const { data: customer, error: customerError } = await supabaseAdmin
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
  const { data: vouchers, error: vouchersError } = await supabaseAdmin
    .from('vouchers')
    .select('*')
    .eq('customer_id', customer.id)
    .order('created_at', { ascending: false });

  if (vouchersError) {
    return NextResponse.json({ error: vouchersError.message }, { status: 500 });
  }

  return NextResponse.json(vouchers);
}
