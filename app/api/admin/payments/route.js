import { createClient } from '../../../../lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { notifySuperAdmins } from '../../../../lib/email/notifications';
import { createNotification } from '@/lib/notifications';

export async function GET(request) {
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

    const { searchParams } = new URL(request.url);

    const status = searchParams.get('status');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const recipient = searchParams.get('recipient');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')) : 50;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')) : 0;
    const sortBy = searchParams.get('sort_by') || 'due_date';
    const sortOrder = searchParams.get('sort_order') || 'asc';

    let query = supabase
        .from('payments')
        .select('*', { count: 'exact' })
        .range(offset, offset + limit - 1)
        .order(sortBy, { ascending: sortOrder === 'asc' });

    if (status) {
        query = query.eq('status', status);
    }
    if (startDate) {
        query = query.gte('due_date', startDate);
    }
    if (endDate) {
        query = query.lte('due_date', endDate);
    }
    if (recipient) {
        query = query.ilike('recipient', `%${recipient}%`);
    }

    const { data: payments, count, error } = await query;

    if (error) {
        console.error('Error fetching payments:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
        payments,
        total: count,
        limit,
        offset
    });
}

export async function POST(request) {
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
        const { due_date, recipient, amount, payment_type, check_number, notes } = body;

        // Validate required fields
        if (!due_date || !recipient || !amount || !payment_type) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const { data: payment, error } = await supabase
            .from('payments')
            .insert({
                due_date,
                recipient,
                amount,
                payment_type,
                check_number,
                notes,
                status: 'Pending'
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating payment:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Notify Admins
        try {
            const formattedAmount = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(amount);

            // System Notification
            await createNotification({
                type: 'info',
                title: 'Nuovo Pagamento Programmato',
                message: `Pagamento di ${formattedAmount} a ${recipient} programmato per il ${due_date}.`,
                link: '/admin/payments',
                metadata: { paymentId: payment.id, amount, recipient }
            });

            await notifySuperAdmins({
                subject: `Nuovo Pagamento Programmato: ${formattedAmount} a ${recipient}`,
                html: `
                    <h3>Nuovo Pagamento Programmato</h3>
                    <p>È stato programmato un nuovo pagamento.</p>
                    <ul>
                        <li><strong>Destinatario:</strong> ${recipient}</li>
                        <li><strong>Importo:</strong> ${formattedAmount}</li>
                        <li><strong>Data Scadenza:</strong> ${due_date}</li>
                        <li><strong>Tipo:</strong> ${payment_type}</li>
                        <li><strong>Numero Assegno:</strong> ${check_number || 'N/A'}</li>
                        <li><strong>Note:</strong> ${notes || 'Nessuna'}</li>
                    </ul>
                    <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/payments">Visualizza nella Dashboard</a></p>
                `
            });
        } catch (notifyError) {
            console.error('Failed to notify admins of new payment:', notifyError);
        }

        return NextResponse.json({ payment }, { status: 201 });
    } catch (error) {
        console.error('Error processing request:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
