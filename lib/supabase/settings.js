// lib/supabase/settings.js

import { supabase } from '../auth';

export const getSetting = async (key) => {
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', key)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data ? data.value : null;
};
