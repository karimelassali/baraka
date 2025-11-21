// app/api/admin/vouchers/route.js

import { createClient } from '../../../../lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

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

  try {
    // Validate the required fields
    if (!customer_id) {
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
    }
    if (!points_to_convert || points_to_convert <= 0) {
      return NextResponse.json({ error: 'Points to convert is required and must be greater than 0' }, { status: 400 });
    }

    // First, check if the customer has enough points
    const { data: points, error: pointsError } = await supabase
      .from('loyalty_points')
      .select('points')
      .eq('customer_id', customer_id);

    if (pointsError) {
      return NextResponse.json({ error: 'Error fetching customer points' }, { status: 500 });
    }

    const totalPoints = points.reduce((sum, point) => sum + (point.points || 0), 0);
    if (totalPoints < points_to_convert) {
      return NextResponse.json({ error: 'Insufficient points for this voucher' }, { status: 400 });
    }

    // Generate a unique voucher code
    const voucherCode = `VOUCHER${Date.now()}${Math.floor(Math.random() * 1000)}`.toUpperCase();

    // Calculate the value of the voucher (assuming 10 points = 1 currency unit)
    const value = points_to_convert / 10;

    // Create the voucher record
    const { data: newVoucher, error: insertError } = await supabase
      .from('vouchers')
      .insert([{
        code: voucherCode,
        customer_id: customer_id,
        points_redeemed: points_to_convert,
        value: value,
        currency: 'EUR', // Default to EUR, can be set based on user preference
        is_active: true,
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // Expire in 1 year
        description: description || `Voucher created from ${points_to_convert} points`
      }])
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    // Add a negative entry in loyalty_points to deduct the points
    const { data: pointDeduction, error: pointError } = await supabase
      .from('loyalty_points')
      .insert([{
        customer_id: customer_id,
        points: -points_to_convert,
        transaction_type: 'REDEEMED',
        reference_id: newVoucher.id,
        description: description || `Points redeemed for voucher ${voucherCode}`
      }])
      .select()
      .single();

    if (pointError) {
      throw pointError;
    }

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

  let query = supabase.from('vouchers').select('*');

  if (customerId) {
    query = query.eq('customer_id', customerId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}