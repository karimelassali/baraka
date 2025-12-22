import { createClient } from '../../../lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createNotification } from '@/lib/notifications';

export async function GET() {
  const supabase = await createClient();

  // Fetch approved reviews, ordered by most recent
  const { data: reviews, error } = await supabase
    .from('reviews')
    .select(`
      id,
      review_text,
      rating,
      created_at,
      reviewer_name,
      customers (
        first_name,
        last_name
      )
    `)
    .eq('is_approved', true)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Transform data to match UI expectations
  const formattedReviews = reviews.map(review => ({
    id: review.id,
    name: review.reviewer_name || (review.customers ? `${review.customers.first_name} ${review.customers.last_name.charAt(0)}.` : 'Anonymous'),
    rating: review.rating,
    comment: review.review_text,
    date: new Date(review.created_at).toLocaleDateString()
  }));

  return NextResponse.json(formattedReviews);
}

export async function POST(request) {
  const supabase = await createClient();

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await request.json();
  const { rating, content } = data;

  if (!content || !rating) {
    return NextResponse.json({ error: 'Content and rating are required' }, { status: 400 });
  }

  // Check if user is admin
  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('id')
    .eq('auth_id', user.id)
    .eq('is_active', true)
    .single();

  const isAdmin = !!adminUser;

  if (isAdmin) {
    // Admin flow: Allow manual override
    const { reviewer_name, approved } = data;

    const { data: newReview, error } = await supabase
      .from('reviews')
      .insert({
        reviewer_name: reviewer_name || 'Admin',
        review_text: content,
        rating,
        is_approved: approved !== undefined ? approved : true,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(newReview);
  }

  // Regular User flow
  // Get customer ID
  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .select('id, first_name, last_name')
    .eq('auth_id', user.id)
    .single();

  if (customerError || !customer) {
    return NextResponse.json({ error: 'Customer profile not found' }, { status: 404 });
  }

  // Check for previous reviews within 15 days
  const fifteenDaysAgo = new Date();
  fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

  const { data: recentReview, error: reviewError } = await supabase
    .from('reviews')
    .select('created_at')
    .eq('customer_id', customer.id)
    .gte('created_at', fifteenDaysAgo.toISOString())
    .single();

  if (recentReview) {
    const lastReviewDate = new Date(recentReview.created_at);
    const nextReviewDate = new Date(lastReviewDate);
    nextReviewDate.setDate(nextReviewDate.getDate() + 15);
    const daysRemaining = Math.ceil((nextReviewDate - new Date()) / (1000 * 60 * 60 * 24));

    return NextResponse.json({
      error: 'You can only submit a review once every 15 days.',
      daysRemaining
    }, { status: 403 });
  }

  // Insert new review
  const { data: newReview, error } = await supabase
    .from('reviews')
    .insert({
      customer_id: customer.id,
      reviewer_name: `${customer.first_name} ${customer.last_name}`,
      review_text: content,
      rating,
      is_approved: false, // Always require approval for user submissions
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Create notification
  await createNotification({
    type: 'info',
    title: 'Nuova Recensione',
    message: `Nuova recensione da ${rating} stelle di ${customer.first_name} ${customer.last_name}`,
    link: '/admin/reviews',
    metadata: { reviewId: newReview.id, rating }
  });

  return NextResponse.json(newReview);
}
