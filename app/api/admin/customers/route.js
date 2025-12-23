// app/api/admin/customers/route.js

import { createClient } from '../../../../lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request) {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const { searchParams } = new URL(request.url);
  const accessPassword = searchParams.get('accessPassword') || request.headers.get('x-access-password');
  const envPassword = process.env.NEXT_PUBLIC_ADD_CLIENT_PASSWORD;

  console.log(`[API Customers] Auth check. AccessPassword provided: ${!!accessPassword}, Matches Env: ${accessPassword === envPassword}`);

  // Verify access: Either via Supabase Admin User OR via Shared Password
  let isAuthorized = false;

  // 1. Check Shared Password
  if (accessPassword && accessPassword === envPassword) {
    isAuthorized = true;
  } else {
    // 2. Check Supabase Auth (Admin User)
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('id')
        .eq('auth_id', user.id)
        .eq('is_active', true)
        .single();

      if (!adminError && adminData) {
        isAuthorized = true;
      }
    }
  }

  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY,
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

  console.log(`[API Customers] Request params: limit=${limit}, offset=${offset}, skip_auth=${searchParams.get('skip_auth')}`);

  const { data: customers, count, error: customerError } = await query;

  if (customerError) {
    console.error('Error fetching customers:', customerError);
    return NextResponse.json({ error: customerError.message }, { status: 500 });
  }

  console.log(`[API Customers] Found ${customers?.length || 0} customers (Total: ${count})`);

  // --- ENHANCEMENT: Fetch Auth Data for these customers ---
  // We need to get the actual Auth User object to check 'user_metadata' and 'email_confirmed_at'
  // accurately, as the database view might be out of sync or missing protected metadata.

  const skipAuth = searchParams.get('skip_auth') === 'true';

  // --- ENHANCEMENT: Fetch Auth Data for these customers ---
  // We need to get the actual Auth User object to check 'user_metadata' and 'email_confirmed_at'
  // accurately, as the database view might be out of sync or missing protected metadata.

  // Extract auth_ids from the fetched customers
  const authIds = customers.map(c => c.auth_id).filter(id => id);

  if (!skipAuth && authIds.length > 0) {
    // Unfortunately, listUsers doesn't support "in" filter for IDs directly in a simple way without iterating
    // But for a page of 20-50 users, we can fetch them. 
    // Actually, 'listUsers' is for ALL users. 'getUserById' is one by one.
    // Optimization: We can't easily fetch JUST these 20 users from Auth API in one go without a custom function.
    // However, since we are admin, we can use the `auth.users` table if we had direct access, but we only have API.
    // Alternative: We iterate and fetch user data? No, too slow (N+1).
    // BETTER ALTERNATIVE: We assume the DB view is mostly correct, BUT for the specific "force_password_change" flag,
    // we might need to rely on what we have. 
    // WAIT: The user specifically said "try use role auth key... and some users im 100% not verified i see next to them verified".
    // This implies the DB view `is_verified` column is WRONG.

    // Let's try to fetch the users. For 20 users, parallel requests might be okay-ish, or we fetch a larger page of users
    // and filter in memory? No, that's bad for scaling.

    // Actually, supabaseAdmin.auth.admin.listUsers() returns a list. We can't filter by ID list.
    // But we CAN use `supabaseAdmin.from('auth.users')` if we have permissions? No, `auth` schema is protected.

    // Let's stick to the plan: We will try to fetch the specific users if possible, or just accept the overhead
    // of fetching the users one by one in parallel (Promise.all) for the current page. 
    // 20 requests is acceptable for an admin dashboard page.

    const authUsersMap = {};

    await Promise.all(authIds.map(async (authId) => {
      try {
        const { data: { user }, error } = await supabaseAdmin.auth.admin.getUserById(authId);
        if (user && !error) {
          authUsersMap[authId] = user;
        }
      } catch (e) {
        // Ignore errors for individual users
      }
    }));

    // Merge data back into customers
    customers.forEach(customer => {
      if (customer.auth_id && authUsersMap[customer.auth_id]) {
        const authUser = authUsersMap[customer.auth_id];

        // Update Verified Status
        // Logic: Verified if email_confirmed_at OR phone_confirmed_at is present
        const isVerified = !!(authUser.email_confirmed_at || authUser.phone_confirmed_at);
        customer.is_verified = isVerified;
        customer.email_confirmed_at = authUser.email_confirmed_at;
        customer.phone_confirmed_at = authUser.phone_confirmed_at;

        // Update Metadata (Force Password Change)
        // Ensure we have the latest metadata
        const oldMeta = customer.user_metadata || {};
        const newMeta = authUser.user_metadata || {};

        customer.user_metadata = {
          ...oldMeta,
          ...newMeta
        };

        // Debug log for specific user (optional, or log all for now since it's dev)
        // console.log(`[AuthDebug] User ${customer.email}: force_password_change = ${customer.user_metadata.force_password_change} (Auth: ${newMeta.force_password_change}, DB: ${oldMeta.force_password_change})`);

      } else if (customer.auth_id) {
        // Auth ID exists but user not found in Auth system? 
        // This implies a broken link or deleted user.
        // Mark as unverified to be safe.
        customer.is_verified = false;
      }
    });
  }

  return NextResponse.json({
    customers: customers || [],
    total: count || 0,
    limit,
    offset
  });
}
