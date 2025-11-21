"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";
export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [supabase, setSupabase] = useState(null);
  const router = useRouter();

  useEffect(() => {
    setSupabase(createClient());
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null); // Clear any previous success message
    setIsSubmitting(true);

    if (!supabase) {
      setError("Supabase client not initialized");
      setIsSubmitting(false);
      return;
    }

    try {
      // Use the client-side Supabase auth directly for better session handling
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setError(error.message);
      } else {
        // Set a temporary success message
        setSuccess("Login successful! Redirecting...");

        // Wait for the session to be properly established, then check user status before redirect
        const checkSessionAndRedirect = async () => {
          if (!supabase) {
            setError("Supabase client not available. Please try again.");
            setIsSubmitting(false);
            return;
          }

          // Check if user is authenticated with multiple attempts
          for (let i = 0; i < 5; i++) { // Try up to 5 times
            try {
              const { data: { user }, error } = await supabase.auth.getUser();

              if (user && !error) {
                // Check for redirect URL in query parameters
                const urlParams = new URLSearchParams(window.location.search);
                const redirectUrl = urlParams.get('redirect');

                // Redirect to dashboard by default, or to the requested page if available
                if (redirectUrl) {
                  window.location.href = decodeURIComponent(redirectUrl);
                } else {
                  window.location.href = "/dashboard";
                }
                return; // Exit after successful redirect
              }

              // Wait 200ms before next check
              await new Promise(resolve => setTimeout(resolve, 200));
            } catch (err) {
              console.error("Session check error:", err);
            }
          }

          // If we can't verify the session after multiple attempts, show an error
          setError("Login verification took too long. Please try again.");
          setIsSubmitting(false);
        };

        // Start the session verification process
        checkSessionAndRedirect();
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMagicLink = async () => {
    setError(null);
    setSuccess(null);
    if (!supabase) {
      setError("Supabase client not initialized");
      return;
    }

    try {
      // Check for redirect URL in query parameters for magic link
      const urlParams = new URLSearchParams(window.location.search);
      const redirectUrl = urlParams.get('redirect');
      const redirectTo = redirectUrl
        ? `${window.location.origin}${decodeURIComponent(redirectUrl)}`
        : `${window.location.origin}/dashboard`;

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo
        }
      });

      if (error) {
        setError(error.message);
      } else {
        // For magic link, we don't want to redirect, just show success message
        setSuccess("Magic link sent! Check your email.");
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="relative min-h-screen w-full">
      <BackgroundBeamsWithCollision duration={10} className="min-h-screen">


        {/* RippleGrid Background */}
        <div className="absolute inset-0 z-0 overflow-hidden">

        </div>

        {/* Login Form */}
        <div className="relative z-10   w-xl min-h-screen flex items-center justify-center">
          <form onSubmit={handleSubmit} className="space-y-6 w-full mx-auto mt-8 p-5  backdrop-blur-sm rounded-xl ">
            <div>
              <h2 className="text-2xl font-bold text-center text-gray-800">Welcome Back</h2>
              <p className="text-center text-gray-600 mt-2">Sign in to your account</p>
            </div>

            <div className='' >
              <label
                htmlFor="email"

                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <div className="mt-1">
                <input
                  placeholder="Email"
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="mt-1">
                <input
                  placeholder="Password"
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}
            {success && <p className="text-green-500 text-sm">{success}</p>}

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
              </button>
            </div>
            <div className="text-center">
              <button
                type="button"
                onClick={handleMagicLink}
                className="text-sm text-red-600 hover:underline"
              >
                Sign in with Magic Link
              </button>
            </div>

            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <a href="/auth/register" className="text-red-600 hover:underline">Register</a>
              </p>
            </div>
          </form>
        </div>
      </BackgroundBeamsWithCollision>
    </div>
  );
}
