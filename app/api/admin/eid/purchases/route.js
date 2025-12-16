import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const offset = (page - 1) * limit;
        const search = searchParams.get('search');
        const type = searchParams.get('type');
        const supplier = searchParams.get('supplier');
        const batch_id = searchParams.get('batch_id');

        let query = supabase
            .from('eid_purchases')
            .select('*', { count: 'exact' });

        if (search) {
            query = query.ilike('tag_number', `%${search}%`);
        }
        if (type && type !== 'ALL') {
            query = query.in('animal_type', type.split(','));
        }
        if (supplier && supplier !== 'ALL') {
            query = query.eq('supplier', supplier);
        }
        if (batch_id) {
            query = query.eq('batch_id', batch_id);
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
        const supabase = await createClient();
        const body = await request.json();
        const { tag_number, tag_color, weight, animal_type, purchase_price, notes, supplier, batch_id, destination } = body;

        if (!tag_number || !weight || !animal_type) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Check for duplicate tag
        const { data: existingTag } = await supabase
            .from('eid_purchases')
            .select('id')
            .eq('tag_number', tag_number)
            .single();

        if (existingTag) {
            return NextResponse.json({ error: `Tag number ${tag_number} already exists.` }, { status: 409 });
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
                supplier,
                batch_id: batch_id || null,
                destination
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
