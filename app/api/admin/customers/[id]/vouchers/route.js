// app/api/admin/customers/[id]/vouchers/route.js
import { createSupabaseServerClient } from '../../../../../../lib/supabase/server';
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

  // Fetch vouchers for the specified customer
  const { data: vouchers, error: vouchersError } = await supabase
    .from('vouchers')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false }); // Order by most recent first

  if (vouchersError) {
    console.error('Error fetching customer vouchers:', vouchersError);
    return NextResponse.json({ error: vouchersError.message }, { status: 500 });
  }

  return NextResponse.json({
    vouchers: vouchers
  });
}