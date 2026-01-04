// app/api/admin/customers/[id]/route.js
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { logAdminAction } from '../../../../../lib/admin-logger';
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

  // Sanitize date_of_birth
  if (updates.date_of_birth === '') {
    updates.date_of_birth = null;
  }

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

  await logAdminAction({
    action: 'UPDATE',
    resource: 'customers',
    resourceId: customerId,
    details: updates,
    adminId: adminData.id
  });

  return NextResponse.json(updatedCustomer);
}

// Handle DELETE (Hard Delete)
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

  // Initialize Admin Client to bypass RLS
  const { createAdminClient } = await import('@/lib/supabase/admin');
  const supabaseAdmin = createAdminClient();

  // 1. Fetch customer to get auth_id before deleting
  const { data: customer, error: fetchError } = await supabaseAdmin
    .from('customers')
    .select('auth_id, first_name, last_name, email')
    .eq('id', customerId)
    .single();

  if (fetchError) {
    return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
  }

  // 2. Delete related records manually using Admin Client to bypass RLS

  // Delete loyalty points
  const { error: pointsError } = await supabaseAdmin.from('loyalty_points').delete().eq('customer_id', customerId);
  if (pointsError) console.error('Error deleting loyalty points:', pointsError);

  // Delete vouchers
  const { error: vouchersError } = await supabaseAdmin.from('vouchers').delete().eq('customer_id', customerId);
  if (vouchersError) console.error('Error deleting vouchers:', vouchersError);

  // Delete reviews
  const { error: reviewsError } = await supabaseAdmin.from('reviews').delete().eq('customer_id', customerId);
  if (reviewsError) console.error('Error deleting reviews:', reviewsError);

  // Delete offers created by the customer (if any)
  const { error: offersError } = await supabaseAdmin.from('offers').delete().eq('created_by', customerId);
  if (offersError) console.error('Error deleting offers:', offersError);

  // Delete whatsapp messages
  const { error: waError } = await supabaseAdmin.from('whatsapp_messages').delete().eq('customer_id', customerId);
  if (waError) console.error('Error deleting whatsapp messages:', waError);

  // Delete GDPR logs
  const { error: gdprError } = await supabaseAdmin.from('gdpr_logs').delete().eq('customer_id', customerId);
  if (gdprError) console.error('Error deleting GDPR logs:', gdprError);

  // Delete Eid cattle members (if applicable)
  const { error: eidError } = await supabaseAdmin.from('eid_cattle_members').delete().eq('customer_id', customerId);
  if (eidError) console.error('Error deleting Eid cattle members:', eidError);

  // 3. Delete from customers table using Admin Client
  const { error: deleteError } = await supabaseAdmin
    .from('customers')
    .delete()
    .eq('id', customerId);

  if (deleteError) {
    console.error('Error deleting customer:', deleteError);
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  // 4. If auth_id exists, delete from auth.users using Admin Client
  if (customer.auth_id) {
    try {
      const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(customer.auth_id);

      if (authDeleteError) {
        console.error('Error deleting auth user:', authDeleteError);
        // We don't return error here because the main customer record is already deleted
      } else {
        console.log(`Auth user ${customer.auth_id} deleted successfully`);
      }
    } catch (err) {
      console.error('Failed to delete auth user:', err);
    }
  }

  await logAdminAction({
    action: 'DELETE',
    resource: 'customers',
    resourceId: customerId,
    details: {
      name: `${customer.first_name} ${customer.last_name}`,
      email: customer.email,
      auth_id: customer.auth_id
    },
    adminId: adminData.id
  });

  return NextResponse.json({ message: 'Customer permanently deleted' });
}