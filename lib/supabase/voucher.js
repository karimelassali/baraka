// lib/supabase/voucher.js

import { createSupabaseClient } from './client';

const supabase = createSupabaseClient();

export const getVouchers = async (customerId) => {
  const { data, error } = await supabase
    .from('vouchers')
    .select('*')
    .eq('customer_id', customerId);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
