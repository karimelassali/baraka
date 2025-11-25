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

        // First check if voucher exists and is valid (case-insensitive)
        const { data: voucher, error: fetchError } = await supabase
            .from('vouchers')
            .select('*')
            .ilike('code', trimmedCode)
            .single();

        if (fetchError || !voucher) {
            return NextResponse.json({ error: 'Voucher not found' }, { status: 404 });
        }

        if (voucher.is_used) {
            return NextResponse.json({ error: 'Voucher already used' }, { status: 400 });
        }

        if (!voucher.is_active) {
            return NextResponse.json({ error: 'Voucher is not active' }, { status: 400 });
        }

        if (new Date(voucher.expires_at) < new Date()) {
            return NextResponse.json({ error: 'Voucher has expired' }, { status: 400 });
        }

        // Update voucher status
        const { data: updatedVoucher, error: updateError } = await supabase
            .from('vouchers')
            .update({
                is_used: true,
                used_at: new Date().toISOString(),
            })
            .eq('id', voucher.id)
            .select()
            .single();

        if (updateError) {
            return NextResponse.json({ error: 'Failed to redeem voucher' }, { status: 500 });
        }

        return NextResponse.json({ voucher: updatedVoucher });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
