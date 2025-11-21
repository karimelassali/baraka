// lib/supabase/review.js

import { createClient } from './client';

const supabase = createClient();

export const getReviews = async () => {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
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
