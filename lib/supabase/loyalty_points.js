// lib/supabase/loyalty_points.js

import { supabase } from '../auth';

export const getLoyaltyPoints = async (customerId) => {
  const { data, error } = await supabase
    .from('loyalty_points')
    .select('*')
    .eq('customer_id', customerId);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
