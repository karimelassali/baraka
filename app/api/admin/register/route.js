// app/api/admin/register/route.js

import { createClient } from '../../../../lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { registerCustomer } from '../../../../lib/auth/register';

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

  try {
    const { firstName, lastName, email, password } = await request.json();

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const registrationResult = await registerCustomer({
      first_name: firstName,
      last_name: lastName,
      email,
      password,
      gdpr_consent: true, // Automatically consent GDPR for admin-created users
    });

    if (!registrationResult.success) {
      return NextResponse.json({ error: registrationResult.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, user: registrationResult.user });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
