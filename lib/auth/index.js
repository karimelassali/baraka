import { createSupabaseServerClient } from '../supabase/server';
import { cookies } from 'next/headers';

/**
 * Authentication service for customer and admin users
 */
export class AuthService {
  static async isAdmin() {
    const cookieStore = cookies();
    const supabase = await createSupabaseServerClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from("admin_users")
      .select("id")
      .eq("auth_id", user.id)
      .eq("is_active", true)
      .single();

    if (error || !data) return false;

    return true;
  }

  // ... (rest of the file)
}
