import { createClient } from '../../../../lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request) {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    const { data: gallery, error } = await supabase
        .from('gallery')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(gallery);
}

export async function POST(request) {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);
    const data = await request.json();

    const { title, image_url, category } = data;

    if (!title || !image_url) {
        return NextResponse.json({ error: 'Title and Image URL are required' }, { status: 400 });
    }

    const { data: newImage, error } = await supabase
        .from('gallery')
        .insert({
            title,
            image_url,
            category: category || 'general',
            created_at: new Date().toISOString()
        })
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(newImage);
}

export async function DELETE(request) {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const { error } = await supabase
        .from('gallery')
        .delete()
        .eq('id', id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
