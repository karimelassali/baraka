// app/api/admin/offers/route.js

import { createSupabaseServerClient } from '../../../../lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request) {
  const cookieStore = cookies();
  const supabase = await createSupabaseServerClient(cookieStore);

  const { data: offers, error } = await supabase
    .from('offers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(offers);
}

export async function POST(request) {
  const cookieStore = cookies();
  const supabase = await createSupabaseServerClient(cookieStore);
  const data = await request.json();

  // Map the form data to match the database schema
  const offerData = {
    title: { en: data.title },  // The schema shows title as JSONB
    description: { en: data.description },  // The schema shows description as JSONB
    offer_type: data.type?.toUpperCase() || 'WEEKLY',  // Map type to offer_type and uppercase
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // Add additional fields if they exist
  if (data.badge) {
    offerData.image_url = data.badge;  // Map badge to image_url temporarily
  }
  if (data.originalPrice || data.salePrice) {
    // In a real implementation, you might want to add price fields
    // The schema doesn't have price fields, so we'll skip them for now
  }

  const { data: newOffer, error } = await supabase
    .from('offers')
    .insert(offerData)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(newOffer);
}
