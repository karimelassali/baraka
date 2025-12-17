import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { notifySuperAdmins } from '../../../../../lib/email/notifications';

export async function POST(request) {
    try {
        const supabase = await createClient();
        const body = await request.json();
        const { reservation_id, amount, notes, payment_method } = body;

        if (!reservation_id || !amount) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('eid_deposits')
            .insert([{
                reservation_id,
                amount: Number(amount),
                notes,
                payment_method
            }])
            .select()
            .single();

        if (error) {
            console.error('Error adding deposit:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Notify Admins
        try {
            // Fetch reservation details for context
            const { data: reservation } = await supabase
                .from('eid_reservations')
                .select(`
                    *,
                    customers (first_name, last_name)
                `)
                .eq('id', reservation_id)
                .single();

            const customerName = reservation?.customers
                ? `${reservation.customers.first_name} ${reservation.customers.last_name}`
                : 'Unknown Customer';

            await notifySuperAdmins({
                subject: `Nuovo Acconto Eid: €${amount} per ${customerName}`,
                html: `
                    <h3>Nuovo Acconto Eid Ricevuto</h3>
                    <p>È stato registrato un nuovo acconto.</p>
                    <ul>
                        <li><strong>Cliente:</strong> ${customerName}</li>
                        <li><strong>Importo:</strong> €${amount}</li>
                        <li><strong>Metodo di Pagamento:</strong> ${payment_method || 'N/A'}</li>
                        <li><strong>Note:</strong> ${notes || 'Nessuna'}</li>
                        <li><strong>ID Prenotazione:</strong> ${reservation_id}</li>
                    </ul>
                    <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/eid/reservations">Visualizza nella Dashboard</a></p>
                `
            });
        } catch (notifyError) {
            console.error('Failed to notify admins of new deposit:', notifyError);
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Server error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(request) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(request.url);
        const reservation_id = searchParams.get('reservation_id');

        if (!reservation_id) {
            return NextResponse.json({ error: 'Missing reservation_id' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('eid_deposits')
            .select('*')
            .eq('reservation_id', reservation_id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching deposits:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Server error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
