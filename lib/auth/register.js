import { createSupabaseServerClient } from '../supabase/server';
import { cookies } from 'next/headers';

export async function registerCustomer(userData) {
  const cookieStore = cookies();
  const supabase = await createSupabaseServerClient(cookieStore);
  const { email, password, ...profileData } = userData;

  try {
    // Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      throw new Error(authError.message);
    }

    // Create customer profile in the database
    const customerData = {
      auth_id: authData.user.id,
      email,
      ...profileData,
    };

    const { data: profile, error: profileError } = await supabase
      .from("customers")
      .insert([customerData])
      .select()
      .single();

    if (profileError) {
      // Clean up the auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw new Error(profileError.message);
    }

    return {
      success: true,
      user: authData.user,
      profile,
    };
  } catch (error) {
    throw new Error(`Registration failed: ${error.message}`);
  }
}
