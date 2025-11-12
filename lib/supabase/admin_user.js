// lib/supabase/admin_user.js

import { supabase } from '../auth';

export const getAdminUser = async (authId) => {
  const { data, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('auth_id', authId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
