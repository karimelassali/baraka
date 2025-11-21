// lib/supabase/offer.js

import { supabase } from '../auth';

export const getOffers = async () => {
  const { data, error } = await supabase
    .from('offers')
    .select('*');

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
