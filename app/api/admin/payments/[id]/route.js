import { createClient } from '../../../../../lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createNotification } from '@/lib/notifications';
import { logAdminAction } from '../../../../../lib/admin-logger';

export async function PUT(request, { params }) {
    const { id } = await params;
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    // Verify admin access
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if the user is an admin
    const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('id')
        .eq('auth_id', user.id)
        .eq('is_active', true)
        .single();

    if (adminError || !adminData) {
        return NextResponse.json({ error: 'Access denied: Admin role required' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { status, ...updates } = body;

        const updateData = { ...updates };

        if (status) {
            updateData.status = status;
            if (status === 'Paid') {
                updateData.paid_at = new Date().toISOString();
                updateData.paid_by = user.id; // Using auth_id for now, or adminData.id if we want to link to admin_users table
            } else if (status === 'Pending') {
                updateData.paid_at = null;
                updateData.paid_by = null;
            }
        }

        const { data: payment, error } = await supabase
            .from('payments')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating payment:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Create notification for status change
        if (status) {
            const type = status === 'Paid' ? 'success' : (status === 'Overdue' ? 'error' : 'info');
            const statusMap = {
                'Paid': 'Pagato',
                'Overdue': 'Scaduto',
                'Pending': 'In Attesa'
            };
            const translatedStatus = statusMap[status] || status;

            await createNotification({
                type,
                title: 'Aggiornamento Stato Pagamento',
                message: `Il pagamento a ${payment.recipient} è ora ${translatedStatus}.`,
                link: '/admin/payments',
                metadata: { paymentId: payment.id, status, recipient: payment.recipient }
            });
        }

        // Log the action
        await logAdminAction({
            action: 'UPDATE',
            resource: 'payments',
            resourceId: id,
            details: { recipient: payment.recipient, amount: payment.amount, status },
            adminId: adminData.id
        });

        return NextResponse.json({ payment });
    } catch (error) {
        console.error('Error processing request:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    const { id } = await params;
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    // Verify admin access
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if the user is an admin
    const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('id')
        .eq('auth_id', user.id)
        .eq('is_active', true)
        .single();

    if (adminError || !adminData) {
        return NextResponse.json({ error: 'Access denied: Admin role required' }, { status: 403 });
    }

    const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting payment:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log the action
    await logAdminAction({
        action: 'DELETE',
        resource: 'payments',
        resourceId: id,
        details: { id },
        adminId: adminData.id
    });

    return NextResponse.json({ success: true });
}
