// lib/auth/client-auth.js
"use client";

import { createClient } from '../supabase/client';

/**
 * Client-side authentication service for customer and admin users
 */
export class ClientAuthService {
  static async isAdmin() {
    try {
      const profile = await this.getAdminProfile();
      return !!profile;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }

  static async getAdminProfile() {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("admin_users")
        .select("*")
        .eq("auth_id", user.id)
        .eq("is_active", true)
        .single();

      if (error || !data) return null;

      return data;
    } catch (error) {
      console.error('Error fetching admin profile:', error);
      return null;
    }
  }
  static async getUser() {
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  }

  static async logout() {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }
}