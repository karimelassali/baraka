import { createClient } from '../../../lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { searchParams } = new URL(request.url);
  const locale = searchParams.get('locale') || 'en';
  const type = searchParams.get('type');
  const isPopup = searchParams.get('is_popup');

  let query = supabase
    .from('offers')
    .select('*')
    .eq('is_active', true);

  if (type) {
    query = query.eq('offer_type', type);
  }

  if (isPopup === 'true') {
    query = query.eq('is_popup', true);
  }

  const { data: offers, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Transform offers to use the requested locale
  const localizedOffers = offers.map(offer => ({
    id: offer.id,
    title: offer.title[locale] || offer.title.en || 'Untitled Offer',
    description: offer.description?.[locale] || offer.description?.en || '',
    image_url: offer.image_url,
    offer_type: offer.offer_type,
    start_date: offer.start_date,
    end_date: offer.end_date,
    created_at: offer.created_at,
    is_popup: offer.is_popup,
    category_id: offer.category_id,
    badge_text: offer.badge_text
  }));

  return NextResponse.json({ offers: localizedOffers });
}
