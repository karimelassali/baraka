// lib/auth/client-auth.js
"use client";

import { createSupabaseClient } from '../supabase/client';

/**
 * Client-side authentication service for customer and admin users
 */
export class ClientAuthService {
  static async isAdmin() {
    try {
      const supabase = createSupabaseClient();
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
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }
}