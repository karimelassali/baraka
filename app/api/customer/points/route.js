import { createClient } from '../../../../lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
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

  // First get the customer record to retrieve the correct customer ID
  // We can use the standard client for this as users should be able to read their own profile
  // But to be safe and consistent, let's use admin client here too since we verified auth above
  const { data: customer, error: customerError } = await supabaseAdmin
    .from('customers')
    .select('id')
    .eq('auth_id', user.id)
    .maybeSingle();

  if (customerError) {
    return NextResponse.json({ error: customerError.message }, { status: 500 });
  }

  if (!customer) {
    // Customer record not found (e.g. not fully registered yet)
    return NextResponse.json({
      total_points: 0,
      available_points: 0,
      pending_points: 0,
      points_history: []
    });
  }

  // Fetch points history
  const { data: history, error: historyError } = await supabaseAdmin
    .from('loyalty_points')
    .select('*')
    .eq('customer_id', customer.id)
    .order('created_at', { ascending: false });

  if (historyError) {
    return NextResponse.json({ error: historyError.message }, { status: 500 });
  }

  // Calculate totals manually to ensure accuracy
  const total_points = history.reduce((sum, record) => sum + record.points, 0);
  const pending_points = history
    .filter(record => record.transaction_type === 'PENDING')
    .reduce((sum, record) => sum + record.points, 0);

  return NextResponse.json({
    total_points,
    available_points: total_points, // Available is same as total (net balance)
    pending_points,
    points_history: history
  });
}