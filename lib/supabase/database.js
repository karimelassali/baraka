// lib/supabase/database.js
// Database utility functions for the customer loyalty platform

import { createClient } from '@supabase/supabase-js';

/**
 * Get a Supabase client instance
 * @returns {import('@supabase/supabase-js').SupabaseClient} Supabase client
 */
export function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

/**
 * Get a Supabase client with service role key (for server-side operations)
 * @returns {import('@supabase/supabase-js').SupabaseClient} Supabase client with service role
 */
export function getSupabaseServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export default {
  getSupabaseClient,
  getSupabaseServiceClient
};