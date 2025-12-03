// app/api/admin/customers/route.js

import { createClient } from '../../../../lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request) {
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

  const { searchParams } = new URL(request.url);

  const search = searchParams.get('search');
  const name = searchParams.get('name');
  const country = searchParams.get('country');
  const residence = searchParams.get('residence');
  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')) : 20;
  const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')) : 0;
  const sortBy = searchParams.get('sort_by') || 'first_name'; // Default sort by first name
  const sortOrder = searchParams.get('sort_order') || 'asc'; // Default sort ascending

  // Initialize Service Role Client for fetching data (bypasses RLS for the View)
  const supabaseAdmin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  // Use the optimized view with Admin Client
  let query = supabaseAdmin
    .from('admin_customers_extended')
    .select('*', { count: 'exact' })
    .range(offset, offset + limit - 1)
    .order(sortBy, { ascending: sortOrder === 'asc' });

  if (search) {
    query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%`);
  } else if (name) {
    query = query.or(`first_name.ilike.%${name}%,last_name.ilike.%${name}%`);
  }
  if (country) {
    query = query.ilike('country_of_origin', `%${country}%`);
  }
  if (residence) {
    query = query.ilike('residence', `%${residence}%`);
  }

  const { data: customers, count, error: customerError } = await query;

  if (customerError) {
    console.error('Error fetching customers:', customerError);
    return NextResponse.json({ error: customerError.message }, { status: 500 });
  }

  return NextResponse.json({
    customers: customers || [],
    total: count || 0,
    limit,
    offset
  });
}
