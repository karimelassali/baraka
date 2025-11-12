// app/api/admin/vouchers/route.js

import { createSupabaseServerClient } from '../../../../lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request) {
  const cookieStore = cookies();
  const supabase = await createSupabaseServerClient(cookieStore);
  const { customerId, pointsToRedeem } = await request.json();

  try {
    // Start a transaction
    const { data, error } = await supabase.rpc('create_voucher_and_deduct_points', {
      p_customer_id: customerId,
      p_points_to_redeem: pointsToRedeem,
    });

    if (error) {
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
