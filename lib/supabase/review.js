// lib/supabase/review.js

import { createClient } from './client';

const supabase = createClient();

export const getReviews = async (page = 1, limit = 10, search = '') => {
  const offset = (page - 1) * limit;

  let query = supabase
    .from('reviews')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (search) {
    query = query.or(`review_text.ilike.%${search}%,reviewer_name.ilike.%${search}%`);
  }

  const { data, count, error } = await query;

  if (error) throw new Error(error.message);
  return { data, count };
};

export const updateReviewApproval = async (reviewId, approved) => {
  const { data, error } = await supabase
    .from('reviews')
    .update({ is_approved: approved, approved_at: approved ? new Date().toISOString() : null })
    .eq('id', reviewId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};
