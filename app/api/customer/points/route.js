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

  const { data: points, error } = await supabase
    .from('loyalty_points')
    .select('*')
    .eq('customer_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(points);
}
