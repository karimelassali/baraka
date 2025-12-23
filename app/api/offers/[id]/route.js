import { createAdminClient } from '../../../../lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
    const supabase = createAdminClient();
    const { id } = await params;

    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'en';

    if (!id) {
        return NextResponse.json({ error: 'Offer ID is required' }, { status: 400 });
    }

    const { data: offer, error } = await supabase
        .from('offers')
        .select(`
      *,
      category:offer_categories(*)
    `)
        .eq('id', id)
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 404 });
    }

    // Transform offer to use the requested locale
    const localizedOffer = {
        id: offer.id,
        title: offer.title?.[locale] || offer.title?.en || 'Untitled Offer',
        description: offer.description?.[locale] || offer.description?.en || '',
        image_url: offer.image_url,
        offer_type: offer.offer_type,
        start_date: offer.start_date,
        end_date: offer.end_date,
        created_at: offer.created_at,
        is_popup: offer.is_popup,
        category_id: offer.category_id,
        category_name: offer.category?.name?.[locale] || offer.category?.name?.en,
        badge_text: offer.badge_text,
        is_active: offer.is_active
    };

    return NextResponse.json({ offer: localizedOffer });
}
