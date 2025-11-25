import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { code } = await request.json();
        const trimmedCode = code?.trim();

        if (!trimmedCode) {
            return NextResponse.json({ error: 'Voucher code is required' }, { status: 400 });
        }

        // Use admin client to bypass RLS
        const supabase = createAdminClient();

        // Use ilike for case-insensitive search
        const { data: voucher, error } = await supabase
            .from('vouchers')
            .select(`
        *,
        customers (
          first_name,
          last_name,
          email
        )
      `)
            .ilike('code', trimmedCode)
            .single();

        if (error) {
            console.error('Voucher query error:', error);
            return NextResponse.json({ error: 'Voucher not found' }, { status: 404 });
        }

        return NextResponse.json({ voucher });
    } catch (error) {
        console.error('Verify voucher error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
