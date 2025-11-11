import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase URL or Anon Key");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Authentication service for customer and admin users
 */
export class AuthService {
  /**
   * Register a new customer
   * @param {Object} userData - Customer data including email, password, and profile info
   * @returns {Promise<Object>} Registration result
   */
  static async registerCustomer(userData) {
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

      // Send confirmation email after registration
      await this.sendConfirmationEmail(email, profile);

      return {
        success: true,
        user: authData.user,
        profile,
      };
    } catch (error) {
      throw new Error(`Registration failed: ${error.message}`);
    }
  }

  /**
   * Login customer
   * @param {string} email - Customer email
   * @param {string} password - Customer password
   * @returns {Promise<Object>} Login result
   */
  static async loginCustomer(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        user: data.user,
        session: data.session,
      };
    } catch (error) {
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  /**
   * Login admin user
   * @param {string} email - Admin email
   * @param {string} password - Admin password
   * @returns {Promise<Object>} Login result
   */
  static async loginAdmin(email, password) {
    try {
      // First, authenticate with Supabase Auth
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (authError) {
        throw new Error(authError.message);
      }

      // Verify that the user is an admin
      const { data: adminData, error: adminError } = await supabase
        .from("admin_users")
        .select("*")
        .eq("auth_id", authData.user.id)
        .eq("is_active", true)
        .single();

      if (adminError || !adminData) {
        await supabase.auth.signOut();
        throw new Error("Access denied: Admin user not found or inactive");
      }

      return {
        success: true,
        user: authData.user,
        session: authData.session,
        adminProfile: adminData,
      };
    } catch (error) {
      throw new Error(`Admin login failed: ${error.message}`);
    }
  }

  /**
   * Logout user
   * @returns {Promise<Object>} Logout result
   */
  static async logout() {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        message: "Logged out successfully",
      };
    } catch (error) {
      throw new Error(`Logout failed: ${error.message}`);
    }
  }

  /**
   * Get current user session
   * @returns {Promise<Object>} Session data
   */
  static async getSession() {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        throw new Error(error.message);
      }

      return session;
    } catch (error) {
      throw new Error(`Getting session failed: ${error.message}`);
    }
  }

  /**
   * Get current user information
   * @returns {Promise<Object>} User information
   */
  static async getUser() {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        throw new Error(error.message);
      }

      return user;
    } catch (error) {
      throw new Error(`Getting user failed: ${error.message}`);
    }
  }

  /**
   * Check if the current user is an admin
   * @returns {Promise<boolean>} Whether the user is an admin
   */
  static async isAdmin() {
    try {
      const user = await this.getUser();
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
      console.error("Error checking admin status:", error);
      return false;
    }
  }

  /**
   * Update customer profile
   * @param {Object} profileData - Profile data to update
   * @returns {Promise<Object>} Update result
   */
  static async updateCustomerProfile(profileData) {
    try {
      const user = await this.getUser();

      const { data, error } = await supabase
        .from("customers")
        .update(profileData)
        .eq("auth_id", user.id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        profile: data,
      };
    } catch (error) {
      throw new Error(`Updating profile failed: ${error.message}`);
    }
  }

  /**
   * Get customer profile
   * @returns {Promise<Object>} Customer profile
   */
  static async getCustomerProfile() {
    try {
      const user = await this.getUser();

      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("auth_id", user.id)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      throw new Error(`Getting profile failed: ${error.message}`);
    }
  }

  /**
   * Get admin profile
   * @returns {Promise<Object>} Admin profile
   */
  static async getAdminProfile() {
    try {
      const user = await this.getUser();

      const { data, error } = await supabase
        .from("admin_users")
        .select("*")
        .eq("auth_id", user.id)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      throw new Error(`Getting admin profile failed: ${error.message}`);
    }
  }

  /**
   * Send confirmation email to the user
   * @param {string} email - User's email
   * @param {Object} customer - Customer profile data
   * @returns {Promise<Object>} Result of sending email
   */
  static async sendConfirmationEmail(email, customer) {
    try {
      // In a real application, you would use an email service like:
      // SendGrid, Resend, Nodemailer, or Supabase Edge Functions with email provider

      // For now, let's call a simple API endpoint that handles the email sending
      // Using absolute URL to avoid issues in server environments
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3004"}/api/send-confirmation-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          customer,
        }),
      });

      if (!response.ok) {
        console.error(
          "Failed to trigger confirmation email:",
          await response.text(),
        );
      }

      return { success: true };
    } catch (error) {
      console.error("Error sending confirmation email:", error);
      return { success: false, error: error.message };
    }
  }
}

/**
 * Check if user is authenticated
 * @returns {Promise<boolean>} Whether the user is authenticated
 */
export const isAuthenticated = async () => {
  try {
    const session = await AuthService.getSession();
    return !!session;
  } catch (error) {
    console.error("Error checking authentication:", error);
    return false;
  }
};
