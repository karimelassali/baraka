// lib/whatsapp/targeted.js

import { supabase } from '../auth';
import { sendWhatsAppTemplate } from './api';

export const sendTargetedOffer = async (nationality, offer) => {
  const { data: customers, error } = await supabase
    .from('customers')
    .select('*')
    .eq('country_of_origin', nationality);

  if (error) {
    throw new Error(error.message);
  }

  for (const customer of customers) {
    await sendWhatsAppTemplate(customer.phone_number, 'targeted_offer', {
      name: customer.first_name,
      offer,
    });
  }
};
