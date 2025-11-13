import { createSupabaseServerClient } from '../../../../lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request) {
  const cookieStore = cookies();
  const supabase = await createSupabaseServerClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // First get the customer record to retrieve the correct customer ID
  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .select('id')
    .eq('auth_id', user.id)
    .single();

  if (customerError) {
    return NextResponse.json({ error: customerError.message }, { status: 500 });
  }

  // Get the customer's points balance from the view
  const { data: pointsBalance, error: balanceError } = await supabase
    .from('customer_points_balance')
    .select('*')
    .eq('customer_id', customer.id)
    .single();

  // Now fetch the detailed points history
  const { data: pointsHistory, error: pointsError } = await supabase
    .from('loyalty_points')
    .select('*')
    .eq('customer_id', customer.id)
    .order('created_at', { ascending: false }); // Order by most recent first

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