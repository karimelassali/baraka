import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { logAdminAction } from '../../../../../../lib/admin-logger';

export async function DELETE(request, { params }) {
    try {
        const { id } = await params;
        const supabase = await createClient();

        // Verify admin
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const { data: adminData } = await supabase
            .from('admin_users')
            .select('id')
            .eq('auth_id', user.id)
            .eq('is_active', true)
            .single();
        if (!adminData) {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        // Get deposit details before deleting for logging using 'eid_deposits' table
        const { data: deposit, error: fetchError } = await supabase
            .from('eid_deposits')
            .select('amount, reservation_id')
            .eq('id', id)
            .single();

        if (fetchError || !deposit) {
            return NextResponse.json({ error: 'Deposit not found' }, { status: 404 });
        }

        // Delete the deposit
        const { error: deleteError } = await supabase
            .from('eid_deposits')
            .delete()
            .eq('id', id);

        if (deleteError) {
            return NextResponse.json({ error: deleteError.message }, { status: 500 });
        }

        // Log action
        await logAdminAction({
            action: 'DELETE',
            resource: 'eid_deposits',
            resourceId: id,
            details: { amount: deposit.amount, reservationId: deposit.reservation_id },
            adminId: adminData.id
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting deposit:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
