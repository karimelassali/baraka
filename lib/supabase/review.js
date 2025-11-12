// lib/supabase/review.js

import { createSupabaseClient } from './client';

const supabase = createSupabaseClient();

export const getReviews = async () => {
  const { data, error } = await supabase.from('reviews').select('*');
  if (error) throw new Error(error.message);
  return data;
};

export const updateReviewApproval = async (reviewId, approved) => {
  const { data, error } = await supabase
    .from('reviews')
    .update({ approved })
    .eq('id', reviewId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};
