import { createClient } from '../../../../lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

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
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const data = await request.json();

  const offerData = {
    title: { en: data.title },
    description: { en: data.description },
    offer_type: data.type?.toUpperCase() || 'WEEKLY',
    image_url: data.image_url,
    badge_text: data.badge_text,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

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

export async function PUT(request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const data = await request.json();

  if (!data.id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  const updateData = {
    updated_at: new Date().toISOString()
  };

  if (data.title) updateData.title = { en: data.title };
  if (data.description) updateData.description = { en: data.description };
  if (data.type) updateData.offer_type = data.type.toUpperCase();
  if (data.image_url !== undefined) updateData.image_url = data.image_url;
  if (data.badge_text !== undefined) updateData.badge_text = data.badge_text;
  if (data.is_active !== undefined) updateData.is_active = data.is_active;

  const { data: updatedOffer, error } = await supabase
    .from('offers')
    .update(updateData)
    .eq('id', data.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(updatedOffer);
}

export async function DELETE(request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('offers')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
