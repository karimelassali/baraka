import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Create a Supabase client for server components
 * @returns {Object} Supabase client
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch (error) {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

/**
 * Get the current user from the session in server components
 * @returns {Promise<Object|null>} User object or null if not authenticated
 */
export async function getCurrentUser() {
  const supabase = await createClient();

  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      console.error('Error getting user in server component:', error);
      return null;
    }

    return user;
  } catch (error) {
    console.error('Error getting user in server component:', error);
    return null;
  }
}

/**
 * Check if the current user is an admin in server components
 * @returns {Promise<boolean>} Whether the user is an admin
 */
export async function isAdminUser() {
  const supabase = await createClient();
  const user = await getCurrentUser();

  if (!user) return false;

  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('id')
      .eq('auth_id', user.id)
      .eq('is_active', true)
      .single();

    if (error || !data) return false;

    return true;
  } catch (error) {
    console.error('Error checking admin status in server component:', error);
    return false;
  }
}