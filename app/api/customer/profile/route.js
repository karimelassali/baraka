import { createServer } from '../../../../lib/supabaseServer';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const supabase = createServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(profile);
}

export async function PUT(request) {
    const supabase = createServer();

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
      })
      .eq('id', user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  }
