import { createServer } from '../supabaseServer';

export async function getVouchers(customerId) {
  const supabase = createServer();
  const { data, error } = await supabase
    .from('vouchers')
    .select('*')
    .eq('customer_id', customerId);

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function addVoucher(voucher) {
    const supabase = createServer();
    const { data, error } = await supabase
        .from('vouchers')
        .insert(voucher).select();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}
