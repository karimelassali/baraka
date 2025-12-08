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
        const search = searchParams.get('search');
        const type = searchParams.get('type');
        const supplier = searchParams.get('supplier');

        let query = supabase
            .from('eid_purchases')
            .select('*', { count: 'exact' });

        if (search) {
            query = query.ilike('tag_number', `%${search}%`);
        }
        if (type && type !== 'ALL') {
            query = query.eq('animal_type', type);
        }
        if (supplier && supplier !== 'ALL') {
            query = query.eq('supplier', supplier);
        }

        const { data, count, error } = await query
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            console.error('Error fetching purchases:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Fetch all unique suppliers for the filter dropdown
        const { data: allSuppliersData } = await supabase
            .from('eid_purchases')
            .select('supplier')
            .not('supplier', 'is', null);

        const uniqueSuppliers = [...new Set(allSuppliersData?.map(item => item.supplier).filter(Boolean))];

        return NextResponse.json({
            data,
            allSuppliers: uniqueSuppliers,
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
        const { tag_number, tag_color, weight, animal_type, purchase_price, notes, supplier } = body;

        if (!tag_number || !weight || !animal_type) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('eid_purchases')
            .insert([{
                tag_number,
                tag_color,
                weight: Number(weight),
                animal_type,
                purchase_price: purchase_price ? Number(purchase_price) : null,
                notes,
                supplier
            }])
            .select()
            .single();

        if (error) {
            console.error('Error adding purchase:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Server error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
