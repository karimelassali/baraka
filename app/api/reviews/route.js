import { createClient } from '../../../lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

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
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const data = await request.json();

  const { reviewer_name, rating, content, approved } = data;

  if (!content || !rating) {
    return NextResponse.json({ error: 'Content and rating are required' }, { status: 400 });
  }

  const { data: newReview, error } = await supabase
    .from('reviews')
    .insert({
      reviewer_name,
      review_text: content,
      rating,
      is_approved: approved || false,
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(newReview);
}
