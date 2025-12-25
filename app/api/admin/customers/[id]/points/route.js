import { createClient } from '../../../../../../lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createNotification } from '@/lib/notifications';
import { logAdminAction } from '../../../../../../lib/admin-logger';

export async function GET(request, { params }) {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

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

  const { id } = await params;
  const cleanId = id?.trim();

  // Validate UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!cleanId || !uuidRegex.test(cleanId)) {
    return NextResponse.json({ error: 'Invalid customer ID' }, { status: 400 });
  }

  // Use Service Role Client for DB operations to bypass RLS
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

  const { data: history, error } = await supabaseAdmin
    .from('loyalty_points')
    .select('*')
    .eq('customer_id', cleanId)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ history });
}

export async function PUT(request, { params }) {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

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

  const { id } = await params;
  const cleanId = id?.trim();

  // Validate UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!cleanId || !uuidRegex.test(cleanId)) {
    return NextResponse.json({ error: `Invalid customer ID: ${cleanId}` }, { status: 400 });
  }

  const { points, description } = await request.json();

  // Determine transaction type based on points value
  const transaction_type = points > 0 ? 'EARNED' : 'ADJUSTED';

  // Use Service Role Client for DB operations to bypass RLS
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

  const { data: newPoints, error } = await supabaseAdmin
    .from('loyalty_points')
    .insert({
      customer_id: cleanId,
      points,
      description,
      transaction_type,
      admin_id: adminData.id  // Record which admin made the change
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding points:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Update last_scan_date for the customer (Activity Tracking)
  await supabaseAdmin
    .from('customers')
    .update({ last_scan_date: new Date().toISOString() })
    .eq('id', cleanId);

  // Fetch customer name for notification
  const { data: customer } = await supabaseAdmin
    .from('customers')
    .select('first_name, last_name')
    .eq('id', cleanId)
    .single();

  const customerName = customer ? `${customer.first_name} ${customer.last_name}` : 'Customer';

  // Create notification
  await createNotification({
    type: 'info',
    title: 'Punti Aggiornati',
    message: `${points > 0 ? 'Aggiunti' : 'Dedotti'} ${Math.abs(points)} punti per ${customerName}`,
    link: `/admin/customers?id=${cleanId}`,
    metadata: { customerId: cleanId, points }
  });

  // Log the action
  await logAdminAction({
    action: points > 0 ? 'ADD_POINTS' : 'DEDUCT_POINTS',
    resource: 'loyalty_points',
    resourceId: newPoints.id,
    details: { customerName, points, description },
    adminId: adminData.id
  });

  // --- Google Wallet Update ---
  // Attempt to update the user's Google Wallet pass if linked.
  // We do this asynchronously (fire-and-forget) or await it, depending on desired strictness.
  // We need the AUTH ID of the customer, not just the UUID.
  const { data: customerWithAuth } = await supabaseAdmin
    .from('customers')
    .select('auth_id')
    .eq('id', cleanId)
    .single();

  if (customerWithAuth?.auth_id) {
    // Calculate new total points
    const { data: totalPointsData } = await supabaseAdmin
      .from("customer_points_balance")
      .select("total_points")
      .eq("customer_id", cleanId)
      .single();

    const newTotal = totalPointsData?.total_points || 0;

    // Importing dynamically to avoid Top-Level Await issues if any, usually fine in Next.js App Router
    const { updateGoogleWalletPoints } = await import('@/lib/actions/update-wallet-points');

    // We run this without awaiting strictly to return response faster, 
    // BUT for debugging now let's await to see errors in logs if any.
    const msg = points > 0
      ? `You earned ${points} points!`
      : `Your balance was updated.`;

    await updateGoogleWalletPoints(customerWithAuth.auth_id, newTotal, msg)
      .catch(err => console.error("Failed to update Google Wallet:", err));
  }
  // ---------------------------

  return NextResponse.json(newPoints);
}

