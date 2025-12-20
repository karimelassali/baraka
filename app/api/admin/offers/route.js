import { createClient } from '../../../../lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { logAdminAction } from '../../../../lib/admin-logger';

// Helper to verify admin and get adminId
async function verifyAdmin(supabase) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: adminData, error } = await supabase
    .from('admin_users')
    .select('id')
    .eq('auth_id', user.id)
    .eq('is_active', true)
    .single();

  if (error || !adminData) return null;
  return adminData.id;
}

export async function GET(request) {
  const supabase = await createClient();

  const { data: offers, error } = await supabase
    .from('offers')
    .select(`
      *,
      category:offer_categories(*)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(offers);
}

export async function POST(request) {
  const supabase = await createClient();

  const adminId = await verifyAdmin(supabase);
  if (!adminId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await request.json();

  // If this offer is set to be a popup, disable all other popups first
  if (data.is_popup) {
    await supabase
      .from('offers')
      .update({ is_popup: false })
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all
  }

  const offerData = {
    title: { en: data.title },
    description: { en: data.description },
    offer_type: data.type?.toUpperCase() || 'WEEKLY',
    image_url: data.image_url,
    badge_text: data.badge_text,
    is_active: true,
    category_id: data.category_id || null,
    is_popup: data.is_popup || false,
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

  // Log the action
  await logAdminAction({
    action: 'CREATE',
    resource: 'offers',
    resourceId: newOffer.id,
    details: { title: data.title, type: data.type },
    adminId
  });

  return NextResponse.json(newOffer);
}

export async function PUT(request) {
  const supabase = await createClient();

  const adminId = await verifyAdmin(supabase);
  if (!adminId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await request.json();

  if (!data.id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  // If this offer is set to be a popup, disable all other popups first
  if (data.is_popup) {
    await supabase
      .from('offers')
      .update({ is_popup: false })
      .neq('id', data.id);
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
  if (data.category_id !== undefined) updateData.category_id = data.category_id;
  if (data.is_popup !== undefined) updateData.is_popup = data.is_popup;

  const { data: updatedOffer, error } = await supabase
    .from('offers')
    .update(updateData)
    .eq('id', data.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Log the action
  await logAdminAction({
    action: 'UPDATE',
    resource: 'offers',
    resourceId: data.id,
    details: { title: data.title, type: data.type },
    adminId
  });

  return NextResponse.json(updatedOffer);
}

export async function DELETE(request) {
  const supabase = await createClient();

  const adminId = await verifyAdmin(supabase);
  if (!adminId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  // Fetch the offer before deleting to get its title for logging
  const { data: offerToDelete } = await supabase
    .from('offers')
    .select('title')
    .eq('id', id)
    .single();

  const offerTitle = offerToDelete?.title?.en || offerToDelete?.title || 'Unknown';

  const { error } = await supabase
    .from('offers')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Log the action
  await logAdminAction({
    action: 'DELETE',
    resource: 'offers',
    resourceId: id,
    details: { title: offerTitle },
    adminId
  });

  return NextResponse.json({ success: true });
}
