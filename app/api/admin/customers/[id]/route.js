// app/api/admin/customers/[id]/route.js

import { createSupabaseServerClient } from '../../../../../lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function PUT(request, { params }) {
  const cookieStore = cookies();
  const supabase = await createSupabaseServerClient(cookieStore);
  const { id } = params;
  const data = await request.json();

  const { data: updatedCustomer, error } = await supabase
    .from('customers')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(updatedCustomer);
}
