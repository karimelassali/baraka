import { registerCustomer } from "../../../lib/auth/register";
import { createNotification } from "../../../lib/notifications";

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

    // Prepare customer data for registration
    const customerData = {
      first_name,
      last_name,
      date_of_birth,
      residence,
      phone_number,
      email,
      country_of_origin,
      gdpr_consent: true,
      gdpr_consent_at: new Date().toISOString(),
      language_preference
    };

    // Register customer using register function
    const registrationResult = await registerCustomer({
      ...customerData,
      password
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
      title: 'New Customer Registered',
      message: `${first_name} ${last_name} has registered as a new customer.`,
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
