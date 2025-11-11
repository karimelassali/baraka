import { createServer } from '../supabaseServer';

export async function getOffers() {
  const supabase = createServer();
  const { data, error } = await supabase.from('offers').select('*');

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function addOffer(offer) {
    const supabase = createServer();
    const { data, error } = await supabase
        .from('offers')
        .insert(offer).select();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}
