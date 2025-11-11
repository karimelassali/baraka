import { createServer } from '../supabaseServer';

export async function getLoyaltyPoints(customerId) {
  const supabase = createServer();
  const { data, error } = await supabase
    .from('loyalty_points')
    .select('*')
    .eq('customer_id', customerId);

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function addLoyaltyPoints(loyaltyPoints) {
    const supabase = createServer();
    const { data, error } = await supabase
        .from('loyalty_points')
        .insert(loyaltyPoints).select();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}
