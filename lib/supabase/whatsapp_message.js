// lib/supabase/whatsapp_message.js

import { supabase } from '../auth';

export const createWhatsAppMessage = async (messageData) => {
  const { data, error } = await supabase
    .from('whatsapp_messages')
    .insert(messageData)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
