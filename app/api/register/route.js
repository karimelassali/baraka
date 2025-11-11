import { AuthService } from "../../../lib/auth";

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

    // Register customer using auth service
    const registrationResult = await AuthService.registerCustomer({
      ...customerData,
      password
    });

    if (!registrationResult.success) {
      return new Response(
        JSON.stringify({ 
          error: "Registration failed",
          details: [registrationResult.message || "Unknown error occurred"] 
        }),
        { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Send confirmation email in the background
    // Don't wait for it to complete - registration should succeed regardless
    AuthService.sendConfirmationEmail(email, registrationResult.profile).catch(error => {
      console.error('Error sending confirmation email:', error);
      // Log the error, but don't fail the registration
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
    
    // Return error response
    return new Response(
      JSON.stringify({ 
        error: "Registration failed",
        details: [error.message || "An unexpected error occurred"] 
      }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}