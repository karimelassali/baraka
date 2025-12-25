import { createClient } from "@supabase/supabase-js";
import { registerCustomer } from "../../../lib/auth/register";
import { createNotification } from "../../../lib/notifications";
import { normalizePhone, findUserByPhone } from "../../../lib/phone-utils";

export async function POST(request) {
  try {
    const data = await request.json();

    // Extract required fields
    const {
      first_name,
      last_name,
      date_of_birth,
      residence,
      phone_number,
      email,
      country_of_origin,
      gdpr_consent,
      password,
      language_preference = "en"
    } = data;

    // Validate required fields
    if (!first_name || !last_name || !email || !password) {
      return new Response(
        JSON.stringify({
          error: "Validation error",
          details: ["first_name, last_name, email, and password are required"]
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({
          error: "Validation error",
          details: ["Invalid email format"]
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Validate GDPR consent
    if (gdpr_consent !== true) {
      return new Response(
        JSON.stringify({
          error: "GDPR consent is required",
          details: ["You must agree to the Privacy Policy to register"]
        }),
        {
          status: 422,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Normalize phone number (remove spaces/dashes/parens, keeping only +, digits)
    const cleanedPhone = normalizePhone(phone_number);
    console.log('[Register] Original phone:', phone_number, '-> Cleaned:', cleanedPhone);

    // Check for existing phone if provided
    if (cleanedPhone) {
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      );

      // Use helper to check for existing user with ANY format of this phone
      console.log('[Register] Checking if phone exists...');
      const { data: existingCustomer, error: lookupError } = await findUserByPhone(supabaseAdmin, phone_number, 'customers', 'id');

      console.log('[Register] Phone check result:', { found: !!existingCustomer, error: lookupError });

      if (existingCustomer) {
        return new Response(
          JSON.stringify({
            error: "Phone number already exists",
            details: ["This phone number is already registered. Please login."]
          }),
          {
            status: 409, // Conflict
            headers: { "Content-Type": "application/json" }
          }
        );
      }
    }

    // Prepare customer data for registration
    const customerData = {
      first_name,
      last_name,
      date_of_birth,
      residence,
      phone_number: cleanedPhone, // Use cleaned phone number
      email,
      country_of_origin,
      gdpr_consent: true,
      gdpr_consent_at: new Date().toISOString(),
      language_preference
    };

    // Register customer using register function
    // Pass raw phone_number too if needed by internal logic, but we already cleaned it in customerData
    const registrationResult = await registerCustomer({
      ...customerData,
      password,
      // Pass raw phone too if `auth/register` needs to do its own checks or dual-save
      raw_phone: phone_number
    });

    if (!registrationResult.success) {
      // Check if it's a rate limit error
      const errorMessage = registrationResult.message || "Unknown error occurred";
      const isRateLimitError = errorMessage.toLowerCase().includes("rate limit") ||
        errorMessage.toLowerCase().includes("too many requests") ||
        errorMessage.includes("email rate limit exceeded");

      return new Response(
        JSON.stringify({
          error: "Registration failed",
          details: [isRateLimitError
            ? "Too many registration attempts. Please try again later."
            : errorMessage]
        }),
        {
          status: isRateLimitError ? 429 : 400, // 429 for rate limit errors
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Create notification for admin
    await createNotification({
      type: 'info',
      title: 'Nuovo Cliente Registrato',
      message: `${first_name} ${last_name} si è registrato come nuovo cliente.`,
      link: `/admin/customers/${registrationResult.profile.id}`,
      metadata: {
        customer_id: registrationResult.profile.id,
        email: email
      }
    });

    // Return success response with user data
    return new Response(
      JSON.stringify({
        success: true,
        message: "Registration successful",
        user_id: registrationResult.profile.id,
        user: registrationResult.user
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Registration error:", error);

    // Check if it's a rate limit error
    const errorMessage = error.message || "An unexpected error occurred";
    const isRateLimitError = errorMessage.toLowerCase().includes("rate limit") ||
      errorMessage.toLowerCase().includes("too many requests") ||
      errorMessage.includes("email rate limit exceeded");

    // Return error response
    return new Response(
      JSON.stringify({
        error: "Registration failed",
        details: [isRateLimitError
          ? "Too many registration attempts. Please try again later."
          : errorMessage]
      }),
      {
        status: isRateLimitError ? 429 : 500, // 429 for rate limit errors
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
