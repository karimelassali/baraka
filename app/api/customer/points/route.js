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

  // Get the customer's points balance from the view using Admin Client
  const { data: pointsBalance, error: balanceError } = await supabaseAdmin
    .from('customer_points_balance')
    .select('*')
    .eq('customer_id', customer.id)
    .maybeSingle();

  // Now fetch the detailed points history using Admin Client
  const { data: pointsHistory, error: pointsError } = await supabaseAdmin
    .from('loyalty_points')
    .select('*')
    .eq('customer_id', customer.id)
    .order('created_at', { ascending: false });

  if (pointsError) {
    return NextResponse.json({ error: pointsError.message }, { status: 500 });
  }

  // Use the balance data from the view if available, otherwise calculate manually
  const totalPoints = pointsBalance?.total_points || 0;
  const availablePoints = pointsBalance?.available_points || 0;
  const pendingPoints = pointsBalance?.pending_points_redeemed || 0;

  return NextResponse.json({
    total_points: totalPoints,
    available_points: availablePoints,
    pending_points: pendingPoints,
    points_history: pointsHistory
  });
}