import { createClient } from '../../../lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request) {
    const supabase = await createClient();

    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'en';

    const { data: categories, error } = await supabase
        .from('offer_categories')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform categories to use the requested locale
    const localizedCategories = categories.map(cat => ({
        id: cat.id,
        name: cat.name[locale] || cat.name.en || 'Untitled Category',
        slug: cat.slug
    }));

    return NextResponse.json(localizedCategories);
}
