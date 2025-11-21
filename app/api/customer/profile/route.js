import { createClient } from '../../../../lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request) {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // The issue was that the auth user ID doesn't match the customer table ID
  // We need to first get the customer record using the auth_id field
  const { data: profile, error, status } = await supabase
    .from('customers')
    .select('*')
    .eq('auth_id', user.id)
    .single();

  if (error && status !== 406) {
    // Don't return error if no rows found (status 406), just return empty profile
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(profile || {});
}

export async function PUT(request) {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      first_name,
      last_name,
      date_of_birth,
      residence,
      phone_number,
      country_of_origin,
      language_preference,
    } = await request.json();

    const { data, error } = await supabase
      .from('customers')
      .update({
        first_name,
        last_name,
        date_of_birth,
        residence,
        phone_number,
        country_of_origin,
        language_preference,
      })
      .eq('auth_id', user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ...data, message: 'Profile updated successfully' });
  }
