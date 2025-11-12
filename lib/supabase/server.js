import { createClient } from '@supabase/supabase-js';

export const createSupabaseServerClient = async (cookies) => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const token = cookies.get('supabase-auth-token');
  if (token) {
    await supabase.auth.setSession({
      access_token: token.value,
      refresh_token: cookies.get('supabase-auth-refresh-token')?.value || '',
    });
  }

  return supabase;
};
