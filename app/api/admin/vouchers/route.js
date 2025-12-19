import { createClient } from '../../../../lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createNotification } from '@/lib/notifications';

export async function POST(request) {
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

  const { customer_id, points_to_convert, description } = await request.json();
  const cleanCustomerId = customer_id?.trim();

  try {
    // Validate the required fields
    if (!cleanCustomerId) {
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
    }
    if (!points_to_convert || points_to_convert <= 0) {
      return NextResponse.json({ error: 'Points to convert is required and must be greater than 0' }, { status: 400 });
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

    // First, check if the customer has enough points
    // We calculate the balance manually to ensure accuracy, as the view might be outdated
    const { data: pointsHistory, error: pointsError } = await supabaseAdmin
      .from('loyalty_points')
      .select('points')
      .eq('customer_id', cleanCustomerId);

    if (pointsError) {
      return NextResponse.json({ error: 'Error fetching customer points: ' + pointsError.message }, { status: 500 });
    }

    // Calculate total balance by summing all points (positive and negative)
    const totalPoints = pointsHistory.reduce((sum, record) => sum + record.points, 0);
    const pointsNeeded = Number(points_to_convert);

    console.log(`Voucher Creation Debug: Customer ${cleanCustomerId} has ${totalPoints} points (calculated). Needs ${pointsNeeded}.`);

    if (totalPoints < pointsNeeded) {
      return NextResponse.json({
        error: `Insufficient points. Customer has ${totalPoints} points, but ${pointsNeeded} are required.`
      }, { status: 400 });
    }

    // Generate a unique voucher code
    const voucherCode = `VOUCHER${Date.now()}${Math.floor(Math.random() * 1000)}`.toUpperCase();

    // Calculate the value of the voucher (assuming 10 points = 1 currency unit)
    const value = points_to_convert / 10;

    // Create the voucher record
    const { data: newVoucher, error: insertError } = await supabaseAdmin
      .from('vouchers')
      .insert([{
        code: voucherCode,
        customer_id: cleanCustomerId,
        points_redeemed: points_to_convert,
        value: value,
        currency: 'EUR', // Default to EUR, can be set based on user preference
        is_active: true,
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // Expire in 1 year
        description: description || `Voucher created from ${points_to_convert} points`,
        admin_id: adminData.id
      }])
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    // Add a negative entry in loyalty_points to deduct the points
    const { data: pointDeduction, error: pointError } = await supabaseAdmin
      .from('loyalty_points')
      .insert([{
        customer_id: cleanCustomerId,
        points: -points_to_convert,
        transaction_type: 'REDEEMED',
        reference_id: newVoucher.id,
        description: description || `Points redeemed for voucher ${voucherCode}`,
        admin_id: adminData.id
      }])
      .select()
      .single();

    if (pointError) {
      // If point deduction fails, we should ideally rollback the voucher creation
      // For now, we'll just throw the error
      throw pointError;
    }

    // Fetch customer name for notification
    const { data: customer } = await supabaseAdmin
      .from('customers')
      .select('first_name, last_name')
      .eq('id', cleanCustomerId)
      .single();

    const customerName = customer ? `${customer.first_name} ${customer.last_name}` : 'Customer';

    // Create notification
    await createNotification({
      type: 'success',
      title: 'Nuovo Voucher Creato',
      message: `Voucher ${voucherCode} creato per ${customerName} (${value} EUR)`,
      link: `/admin/customers?id=${cleanCustomerId}`,
      metadata: { customerId: cleanCustomerId, voucherCode, value }
    });

    return NextResponse.json({
      success: true,
      message: 'Voucher created successfully',
      voucher: newVoucher
    });
  } catch (error) {
    console.error('Error creating voucher:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
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

  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get('customer_id');

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

  let query = supabaseAdmin.from('vouchers').select('*');

  if (customerId) {
    query = query.eq('customer_id', customerId);
  }

  // Order by created_at desc
  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}