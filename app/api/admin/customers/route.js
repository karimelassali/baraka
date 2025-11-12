// app/api/admin/customers/route.js

import { createSupabaseServerClient } from '../../../../lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request) {
  const cookieStore = cookies();
  const supabase = await createSupabaseServerClient(cookieStore);
  const { searchParams } = new URL(request.url);

  const name = searchParams.get('name');
  const country = searchParams.get('country');
  const residence = searchParams.get('residence');

  let query = supabase.from('customers').select('*');

  if (name) {
    query = query.ilike('first_name', `%${name}%`);
  }
  if (country) {
    query = query.eq('country_of_origin', country);
  }
  if (residence) {
    query = query.ilike('residence', `%${residence}%`);
  }

  const { data: customers, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(customers);
}
