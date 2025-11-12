// lib/supabase/gdpr_log.js

import { supabase } from '../auth';

export const createGdprLog = async (logData) => {
  const { data, error } = await supabase
    .from('gdpr_logs')
    .insert(logData)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
