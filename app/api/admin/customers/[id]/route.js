// app/api/admin/customers/[id]/route.js
import { createClient } from '../../../../../lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function PUT(request, { params }) {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  // Verify admin access
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
  const { id: customerId } = await params;

  if (!customerId) {
    return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
  }

  const updates = await request.json();

  // Update the customer record
  const { data: updatedCustomer, error: updateError } = await supabase
    .from('customers')
    .update(updates)
    .eq('id', customerId)
    .select()
    .single();

  if (updateError) {
    console.error('Error updating customer:', updateError);
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json(updatedCustomer);
}

// Also handle DELETE if needed
export async function DELETE(request, { params }) {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  // Verify admin access
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
  const { id: customerId } = await params;

  if (!customerId) {
    return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
  }

  // This would normally delete the customer, but for safety, we'll just deactivate
  const { data: updatedCustomer, error: updateError } = await supabase
    .from('customers')
    .update({ is_active: false })
    .eq('id', customerId)
    .select()
    .single();

  if (updateError) {
    console.error('Error deactivating customer:', updateError);
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Customer deactivated successfully', customer: updatedCustomer });
}