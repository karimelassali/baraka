import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createNotification } from '@/lib/notifications';

export async function GET(request) {
    try {
        const cookieStore = await cookies();
        const supabase = await createClient(cookieStore);
        const { searchParams } = new URL(request.url);
        const month = searchParams.get('month');
        const year = searchParams.get('year');

        let query = supabase
            .from('daily_revenue')
            .select('*')
            .order('date', { ascending: false });

        if (month && year) {
            const startDate = `${year}-${month}-01`;
            // Calculate end date (last day of the month)
            const endDate = new Date(year, month, 0).toISOString().split('T')[0];

            query = query
                .gte('date', startDate)
                .lte('date', endDate);
        } else if (year) {
            const startDate = `${year}-01-01`;
            const endDate = `${year}-12-31`;

            query = query
                .gte('date', startDate)
                .lte('date', endDate);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching revenue:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Server error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const cookieStore = await cookies();
        const supabase = await createClient(cookieStore);
        const body = await request.json();
        const { date, total_revenue, cash, card, ticket, revenue_annule } = body;

        // Basic validation
        if (!date || total_revenue === undefined) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Convert empty strings to 0 for numeric fields
        const cleanData = {
            date,
            total_revenue: total_revenue === '' ? 0 : parseFloat(total_revenue) || 0,
            cash: cash === '' ? 0 : parseFloat(cash) || 0,
            card: card === '' ? 0 : parseFloat(card) || 0,
            ticket: ticket === '' ? 0 : parseFloat(ticket) || 0,
            revenue_annule: revenue_annule === '' ? 0 : parseFloat(revenue_annule) || 0
        };

        const { data, error } = await supabase
            .from('daily_revenue')
            .insert([cleanData])
            .select()
            .single();

        if (error) {
            if (error.code === '23505') { // Unique violation
                return NextResponse.json({ error: 'Revenue entry for this date already exists' }, { status: 409 });
            }
            console.error('Error creating revenue entry:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Create notification
        await createNotification({
            type: 'success',
            title: 'Nuovo Record Entrate',
            message: `Entrate per il ${date}: ${cleanData.total_revenue} EUR`,
            link: '/admin/analytics',
            metadata: { revenueId: data.id, date, amount: cleanData.total_revenue }
        });

        return NextResponse.json(data);
    } catch (error) {
        console.error('Server error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const cookieStore = await cookies();
        const supabase = await createClient(cookieStore);
        const body = await request.json();
        const { id, date, total_revenue, cash, card, ticket, revenue_annule } = body;

        if (!id) {
            return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
        }

        // Convert empty strings to 0 for numeric fields
        const cleanData = {
            date,
            total_revenue: total_revenue === '' ? 0 : parseFloat(total_revenue) || 0,
            cash: cash === '' ? 0 : parseFloat(cash) || 0,
            card: card === '' ? 0 : parseFloat(card) || 0,
            ticket: ticket === '' ? 0 : parseFloat(ticket) || 0,
            revenue_annule: revenue_annule === '' ? 0 : parseFloat(revenue_annule) || 0
        };

        const { data, error } = await supabase
            .from('daily_revenue')
            .update(cleanData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating revenue entry:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Server error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const cookieStore = await cookies();
        const supabase = await createClient(cookieStore);
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
        }

        const { error } = await supabase
            .from('daily_revenue')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting revenue entry:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Server error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
