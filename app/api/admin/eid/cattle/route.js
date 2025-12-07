import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request) {
    try {
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const offset = (page - 1) * limit;

        const { data, count, error } = await supabase
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
            `, { count: 'exact' })
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
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);
        const body = await request.json();
        const { group_name, cattle_weight, total_deposit } = body;

        if (!group_name) {
            return NextResponse.json({ error: 'Missing group name' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('eid_cattle_groups')
            .insert([{
                group_name,
                cattle_weight: cattle_weight ? Number(cattle_weight) : null,
                total_deposit: total_deposit ? Number(total_deposit) : 0,
                status: 'PENDING'
            }])
            .select()
            .single();

        if (error) {
            console.error('Error creating cattle group:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Server error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
