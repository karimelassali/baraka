// app/api/admin/customers/[id]/points/route.js

import { createSupabaseServerClient } from '../../../../../../lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function PUT(request, { params }) {
  const cookieStore = cookies();
  const supabase = await createSupabaseServerClient(cookieStore);
  const { id } = params;
  const { points, reason } = await request.json();

  const { data: newPoints, error } = await supabase
    .from('loyalty_points')
    .insert({ customer_id: id, points, reason })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(newPoints);
}
