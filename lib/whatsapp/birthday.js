// lib/whatsapp/birthday.js

import { supabase } from '../auth';
import { sendWhatsAppTemplate } from './api';

export const sendBirthdayMessages = async () => {
  const today = new Date().toISOString().slice(5, 10); // MM-DD format
  const { data: customers, error } = await supabase
    .from('customers')
    .select('*')
    .like('date_of_birth', `%-${today}`);

  if (error) {
    throw new Error(error.message);
  }

  for (const customer of customers) {
    await sendWhatsAppTemplate(customer.phone_number, 'birthday_greeting', {
      name: customer.first_name,
    });
  }
};
