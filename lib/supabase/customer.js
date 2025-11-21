import { getSupabaseServiceClient } from "./database";

const supabase = getSupabaseServiceClient();

export async function getCustomerById(id) {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error getting customer by ID:", error);
    return null;
  }

  return data;
}

export async function updateCustomer(id, updates) {
  const { data, error } = await supabase
    .from("customers")
    .update(updates)
    .eq("id", id);

  if (error) {
    console.error("Error updating customer:", error);
    return null;
  }

  return data;
}
