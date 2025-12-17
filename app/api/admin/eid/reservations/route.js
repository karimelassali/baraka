import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { notifySuperAdmins } from '../../../../../lib/email/notifications';

export async function GET(request) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const statusFilter = searchParams.get('statusFilter'); // PAID, UNPAID, COLLECTED, NOT_COLLECTED
        const destination = searchParams.get('destination');
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const sort = searchParams.get('sort') || 'desc';
        const offset = (page - 1) * limit;

        let query = supabase
            .from('eid_reservations')
            .select(`
                *,
                customers (
                    first_name,
                    last_name,
                    phone_number
                ),
                eid_deposits (
                    amount
                )
            `, { count: 'exact' })
            .order('created_at', { ascending: sort === 'asc' })
            .range(offset, offset + limit - 1);

        if (status) {
            query = query.in('status', status.split(','));
        }

        if (destination && destination !== 'ALL') {
            query = query.eq('destination', destination);
        }

        if (statusFilter && statusFilter !== 'ALL') {
            const filters = statusFilter.split(',');
            const orConditions = [];

            if (filters.includes('PAID')) orConditions.push('is_paid.eq.true');
            if (filters.includes('UNPAID')) orConditions.push('is_paid.eq.false');
            if (filters.includes('COLLECTED')) orConditions.push('status.eq.COLLECTED');
            if (filters.includes('NOT_COLLECTED')) orConditions.push('status.neq.COLLECTED');

            if (orConditions.length > 0) {
                query = query.or(orConditions.join(','));
            }
        }

        const search = searchParams.get('search');
        if (search) {
            // Optimized Search: 1. Find matching customers
            const { data: customers } = await supabase
                .from('customers')
                .select('id')
                .or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,phone_number.ilike.%${search}%`)
                .limit(50);

            const customerIds = customers?.map(c => c.id) || [];

            // 2. Build query
            if (customerIds.length > 0) {
                const isNumber = !isNaN(search);
                let orQuery = `customer_id.in.(${customerIds.join(',')})`;
                if (isNumber) orQuery += `,order_number.eq.${search}`;

                query = query.or(orQuery);
            } else if (!isNaN(search)) {
                query = query.eq('order_number', search);
            } else {
                // No matching customers and not a number -> return empty
                return NextResponse.json({
                    data: [],
                    metadata: { total: 0, page, limit, totalPages: 0 }
                });
            }
        }

        const { data, count, error } = await query;

        if (error) {
            console.error('Error fetching reservations:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Calculate total deposits for each reservation
        const enrichedData = data.map(reservation => {
            // Precise float calculation
            const totalDeposit = reservation.eid_deposits?.reduce((sum, deposit) => {
                return sum + (Number(deposit.amount) || 0);
            }, 0) || 0;

            return {
                ...reservation,
                total_deposit: Number(totalDeposit.toFixed(2))
            };
        });

        return NextResponse.json({
            data: enrichedData,
            metadata: {
                total: count,
                page,
                limit,
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Server error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const supabase = await createClient();
        const body = await request.json();
        const { customer_id, animal_type, requested_weight, pickup_time, notes, deposit_amount } = body;

        if (!customer_id || !animal_type || !requested_weight) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Create Reservation
        const { data: reservation, error: reservationError } = await supabase
            .from('eid_reservations')
            .insert([{
                customer_id,
                animal_type,
                requested_weight,
                pickup_time,
                notes,
                status: 'PENDING'
            }])
            .select()
            .single();

        if (reservationError) {
            console.error('Error creating reservation:', reservationError);
            return NextResponse.json({ error: reservationError.message }, { status: 500 });
        }

        // 2. Add Initial Deposit if provided
        if (deposit_amount && Number(deposit_amount) > 0) {
            const { error: depositError } = await supabase
                .from('eid_deposits')
                .insert([{
                    reservation_id: reservation.id,
                    amount: Number(deposit_amount),
                    notes: 'Initial deposit'
                }]);

            if (depositError) {
                console.error('Error adding initial deposit:', depositError);
                // We don't fail the whole request, but we should log it.
            }
        }

        // 3. Notify Admins
        try {
            // Fetch customer name for the email
            const { data: customer } = await supabase
                .from('customers')
                .select('first_name, last_name, phone_number')
                .eq('id', customer_id)
                .single();

            const customerName = customer ? `${customer.first_name} ${customer.last_name}` : 'Unknown Customer';

            await notifySuperAdmins({
                subject: `Nuova Prenotazione Eid: ${animal_type} (${requested_weight}kg)`,
                html: `
                    <h3>Nuova Prenotazione Eid Ricevuta</h3>
                    <p>Una nuova prenotazione è stata effettuata da <strong>${customerName}</strong>.</p>
                    <ul>
                        <li><strong>Tipo Animale:</strong> ${animal_type}</li>
                        <li><strong>Peso Richiesto:</strong> ${requested_weight} kg</li>
                        <li><strong>Acconto:</strong> €${deposit_amount || 0}</li>
                        <li><strong>Orario Ritiro:</strong> ${pickup_time || 'Non specificato'}</li>
                        <li><strong>Note:</strong> ${notes || 'Nessuna'}</li>
                    </ul>
                    <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/eid/reservations">Visualizza nella Dashboard</a></p>
                `
            });
        } catch (notifyError) {
            console.error('Failed to notify admins of new reservation:', notifyError);
        }

        return NextResponse.json(reservation);
    } catch (error) {
        console.error('Server error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
