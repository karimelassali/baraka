import { createClient } from '../supabase/server';
import { cookies } from 'next/headers';

export async function registerCustomer(userData) {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);
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

    // Only continue if authData.user exists (email verification might be required)
    if (!authData?.user) {
      throw new Error('User creation failed or requires email verification');
    }

    // Create customer profile in the database
    // Map the fields to match the actual database schema
    const customerData = {
      auth_id: authData.user.id,
      email: email,
      first_name: profileData.first_name,
      last_name: profileData.last_name,
      date_of_birth: profileData.date_of_birth,
      residence: profileData.residence,
      phone_number: profileData.phone_number,
      country_of_origin: profileData.country_of_origin,
      gdpr_consent: profileData.gdpr_consent || false,
      gdpr_consent_at: profileData.gdpr_consent_at || new Date().toISOString(),
      language_preference: profileData.language_preference || 'en',
      is_active: true // Default to true for new users
    };

    const { data: profile, error: profileError } = await supabase
      .from("customers")
      .insert([customerData])
      .select()
      .single();

    if (profileError) {
      // Clean up the auth user if profile creation fails
      try {
        await supabase.auth.admin.deleteUser(authData.user.id);
      } catch (cleanupError) {
        console.error('Error cleaning up auth user:', cleanupError);
      }
      throw new Error(`Profile creation failed: ${profileError.message}`);
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
