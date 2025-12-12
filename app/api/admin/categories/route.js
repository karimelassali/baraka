import { createClient } from '../../../../lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request) {
    const supabase = await createClient();

    const { data: categories, error } = await supabase
        .from('offer_categories')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(categories);
}

export async function POST(request) {
    const supabase = await createClient();
    const data = await request.json();

    if (!data.name || !data.slug) {
        return NextResponse.json({ error: 'Name and Slug are required' }, { status: 400 });
    }

    const { data: newCategory, error } = await supabase
        .from('offer_categories')
        .insert({
            name: data.name,
            slug: data.slug
        })
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(newCategory);
}

export async function DELETE(request) {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const { error } = await supabase
        .from('offer_categories')
        .delete()
        .eq('id', id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
