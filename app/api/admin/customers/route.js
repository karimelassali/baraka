// app/api/admin/customers/route.js

import { createSupabaseServerClient } from '../../../../lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request) {
  const cookieStore = cookies();
  const supabase = await createSupabaseServerClient(cookieStore);
  
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
  
  const { searchParams } = new URL(request.url);

  const search = searchParams.get('search');
  const name = searchParams.get('name');
  const country = searchParams.get('country');
  const residence = searchParams.get('residence');
  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')) : 20;
  const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')) : 0;
  const sortBy = searchParams.get('sort_by') || 'first_name'; // Default sort by first name
  const sortOrder = searchParams.get('sort_order') || 'asc'; // Default sort ascending

  // First, get the customers
  let customerQuery = supabase
    .from('customers')
    .select(`
      id,
      auth_id,
      first_name,
      last_name,
      email,
      date_of_birth,
      residence,
      phone_number,
      country_of_origin,
      created_at
    `)
    .range(offset, offset + limit - 1)
    .order(sortBy, { ascending: sortOrder === 'asc' });

  if (search) {
    customerQuery = customerQuery.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%`);
  } else if (name) {
    customerQuery = customerQuery.or(`first_name.ilike.%${name}%,last_name.ilike.%${name}%`);
  }
  if (country) {
    customerQuery = customerQuery.ilike('country_of_origin', `%${country}%`);
  }
  if (residence) {
    customerQuery = customerQuery.ilike('residence', `%${residence}%`);
  }

  const { data: customers, error: customerError } = await customerQuery;

  if (customerError) {
    console.error('Error fetching customers:', customerError);
    return NextResponse.json({ error: customerError.message }, { status: 500 });
  }

  // For each customer, get their total points and voucher count
  const customersWithDetails = await Promise.all(
    customers.map(async (customer) => {
      // Get total points
      const { data: points, error: pointsError } = await supabase
        .from('loyalty_points')
        .select('points')
        .eq('customer_id', customer.id);

      let totalPoints = 0;
      if (!pointsError) {
        totalPoints = points.reduce((sum, point) => sum + (point.points || 0), 0);
      }

      // Get voucher count
      const { count: vouchersCount, error: vouchersError } = await supabase
        .from('vouchers')
        .select('id', { count: 'exact', head: true })
        .eq('customer_id', customer.id);

      let vouchersCountValue = 0;
      if (!vouchersError) {
        vouchersCountValue = vouchersCount || 0;
      }

      // Get user details from auth
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(customer.auth_id);
      
      console.log('Customer:', customer);
      console.log('Auth User:', authUser);

      return { 
        ...customer, 
        total_points: totalPoints,
        vouchers_count: vouchersCountValue,
        email_confirmed: authUser.user?.email_confirmed_at ? true : false,
      };
    })
  );

  // Also get the total count for potential pagination info
  let countQuery = supabase
    .from('customers')
    .select('id', { count: 'exact', head: true });

  if (search) {
    countQuery = countQuery.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%`);
  } else if (name) {
    countQuery = countQuery.or(`first_name.ilike.%${name}%,last_name.ilike.%${name}%`);
  }
  if (country) {
    countQuery = countQuery.ilike('country_of_origin', `%${country}%`);
  }
  if (residence) {
    countQuery = countQuery.ilike('residence', `%${residence}%`);
  }

  const { count, error: countError } = await countQuery;

  if (countError) {
    console.error('Error fetching customer count:', countError);
    return NextResponse.json({ error: countError.message }, { status: 500 });
  }

  return NextResponse.json({
    customers: customersWithDetails,
    total: count,
    limit,
    offset
  });
}
