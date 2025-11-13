// app/api/customer/[id]/points/route.js
import { createSupabaseServerClient } from '../../../../../lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request, { params }) {
  const cookieStore = cookies();
  const supabase = await createSupabaseServerClient(cookieStore);

  // First verify that the requesting user is an admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if the user is an admin
  const { data: adminData, error: adminError } = await supabase
    .from('admin_users')
    .select('id')
    .eq('auth_id', user.id)
    .eq('is_active', true)
    .single();

  if (adminError || !adminData) {
    return NextResponse.json({ error: 'Access denied: Admin role required' }, { status: 403 });
  }

  // Extract customer id from params
  const customerId = params.id;

  if (!customerId) {
    return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
  }

  // Fetch loyalty points for the specified customer
  const { data: points, error: pointsError } = await supabase
    .from('loyalty_points')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false }); // Order by most recent first

  if (pointsError) {
    console.error('Error fetching customer points:', pointsError);
    return NextResponse.json({ error: pointsError.message }, { status: 500 });
  }

  // Get the customer's points balance from the view instead of calculating manually
  const { data: pointsBalance, error: balanceError } = await supabase
    .from('customer_points_balance')
    .select('*')
    .eq('customer_id', customerId)
    .single();

  // Format points history as per the contract
  const pointsHistory = points.map(point => ({
    id: point.id,
    points: point.points,
    transaction_type: point.transaction_type,
    description: point.description,
    reference_id: point.reference_id,
    created_at: point.created_at
  }));

  // Use the balance data from the view if available, otherwise calculate manually
  const totalPoints = pointsBalance?.total_points || points.reduce((sum, point) => sum + (point.points || 0), 0);
  const availablePoints = pointsBalance?.available_points || totalPoints;
  const pendingPoints = pointsBalance?.pending_points || 0;

  return NextResponse.json({
    total_points: totalPoints,
    available_points: availablePoints,
    pending_points: pendingPoints,
    points_history: pointsHistory
  });
}