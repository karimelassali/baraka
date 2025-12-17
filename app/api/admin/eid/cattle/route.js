import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { notifySuperAdmins } from '../../../../../lib/email/notifications';

export async function GET(request) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const offset = (page - 1) * limit;

        let query = supabase
            .from('eid_cattle_groups')
            .select(`
                *,
                eid_cattle_members (
                    id,
                    member_number,
                    role,
                    deposit_amount,
                    is_paid,
                    customers (
                        first_name,
                        last_name,
                        phone_number
                    )
                )
            `, { count: 'exact' });

        const status = searchParams.get('status');
        if (status) {
            query = query.in('status', status.split(','));
        }

        const { data, count, error } = await query
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            console.error('Error fetching cattle groups:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            data,
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
        const { group_name, cattle_weight, price, total_deposit } = body;

        if (!group_name) {
            return NextResponse.json({ error: 'Missing group name' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('eid_cattle_groups')
            .insert([{
                group_name,
                cattle_weight: cattle_weight ? Number(cattle_weight) : null,
                price: price ? Number(price) : null,
                total_deposit: total_deposit ? Number(total_deposit) : 0,
                status: 'PENDING'
            }])
            .select()
            .single();

        if (error) {
            console.error('Error creating cattle group:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Notify Admins
        try {
            await notifySuperAdmins({
                subject: `Nuovo Gruppo Bestiame Eid: ${group_name}`,
                html: `
                    <h3>Nuovo Gruppo Bestiame Eid Creato</h3>
                    <p>È stato creato un nuovo gruppo di bestiame.</p>
                    <ul>
                        <li><strong>Nome Gruppo:</strong> ${group_name}</li>
                        <li><strong>Peso:</strong> ${cattle_weight || 'N/A'} kg</li>
                        <li><strong>Prezzo:</strong> €${price || 'N/A'}</li>
                        <li><strong>Acconto Totale:</strong> €${total_deposit || 0}</li>
                    </ul>
                    <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/eid/cattle">Visualizza nella Dashboard</a></p>
                `
            });
        } catch (notifyError) {
            console.error('Failed to notify admins of new cattle group:', notifyError);
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Server error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const supabase = await createClient();
        const body = await request.json();
        const { id, group_name, cattle_weight, price, status, tag_number } = body;

        if (!id) {
            return NextResponse.json({ error: 'Missing group ID' }, { status: 400 });
        }

        const updates = {};
        if (group_name !== undefined) updates.group_name = group_name;
        if (cattle_weight !== undefined) updates.cattle_weight = cattle_weight ? Number(cattle_weight) : null;
        if (price !== undefined) updates.price = price ? Number(price) : null;
        if (status !== undefined) updates.status = status;

        // Handle tag assignment if provided
        if (tag_number) {
            // Find a member without a tag
            const { data: members } = await supabase
                .from('eid_cattle_members')
                .select('id, tag_number')
                .eq('group_id', id);

            const emptyMember = members?.find(m => !m.tag_number);

            if (emptyMember) {
                await supabase
                    .from('eid_cattle_members')
                    .update({ tag_number: tag_number })
                    .eq('id', emptyMember.id);
            } else {
                // Optional: Handle case where all members have tags (maybe overwrite first? or ignore?)
                // For now, we'll ignore to prevent accidental overwrites
            }
        }

        const { data, error } = await supabase
            .from('eid_cattle_groups')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating cattle group:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Server error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
