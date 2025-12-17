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
    .maybeSingle();

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

  // Use upsert with email as conflict target since auth_id is not unique in schema
  // Add gdpr_consent fields for new records
  const { data, error } = await supabase
    .from('customers')
    .upsert({
      auth_id: user.id,
      email: user.email,
      first_name,
      last_name,
      date_of_birth,
      residence,
      phone_number,
      country_of_origin,
      language_preference,
      updated_at: new Date().toISOString(),
      // Default values for required fields if creating new record
      gdpr_consent: true,
      gdpr_consent_at: new Date().toISOString(),
      is_active: true
    }, { onConflict: 'email' })
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
