"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/navigation";
import { ArrowRight, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginForm() {
  const t = useTranslations('Auth.Login');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
        setSuccess(t('success'));

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
                // Check if user is an admin
                const { data: adminData } = await supabase
                  .from('admin_users')
                  .select('role')
                  .eq('auth_id', user.id)
                  .single();

                if (adminData) {
                  window.location.href = "/admin";
                  return;
                }

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
      setError(err.message || t('error_generic'));
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
        setSuccess(t('magic_link_sent'));
      }
    } catch (err) {
      setError(err.message || t('error_generic'));
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-red-600 items-center justify-center p-12 overflow-hidden">
        {/* Abstract background pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>

        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 w-full max-w-lg"
        >
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
            <img
              src="/illus/undraw_access-account_aydp.svg"
              alt="Login Illustration"
              className="w-full h-auto drop-shadow-xl mb-8"
            />
            <div className="text-white text-center">
              <h2 className="text-3xl font-bold mb-4">Welcome Back!</h2>
              <p className="text-red-100 text-lg">Manage your business with ease and security. Access your customized dashboard now.</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-12 lg:w-1/2 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <Link href="/" className="inline-block mb-8">
              {/* Replace with your actual Logo component if available, or just the text */}
              <span className="text-2xl font-black text-red-600 tracking-tighter uppercase">Baraka</span>
            </Link>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {t('title')}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {t('subtitle')}
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('email_label')}
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 placeholder-gray-400 bg-gray-50 transition-all"
                    placeholder={t('email_placeholder')}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('password_label')}
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 placeholder-gray-400 bg-gray-50 transition-all"
                    placeholder={t('password_placeholder')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center z-10 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <Eye className="h-5 w-5" aria-hidden="true" />
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-end mt-2">
                  <Link href="/auth/reset-password" className="text-sm font-medium text-red-600 hover:text-red-500">
                    {t('forgot_password')}
                  </Link>
                </div>
              </div>
            </div>

            {/* Feedback Messages */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg bg-red-50 p-4 border border-red-100"
              >
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Login failed</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg bg-green-50 p-4 border border-green-100"
              >
                <p className="text-sm font-medium text-green-800 flex items-center">
                  <svg className="h-5 w-5 text-green-400 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {success}
                </p>
              </motion.div>
            )}

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  {isSubmitting ? (
                    <svg className="animate-spin h-5 w-5 text-red-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <Lock className="h-5 w-5 text-red-500 group-hover:text-red-400 transition-colors" aria-hidden="true" />
                  )}
                </span>
                {isSubmitting ? t('submitting') : t('submit')}
                {!isSubmitting && <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-1">
              <button
                type="button"
                onClick={handleMagicLink}
                className="w-full inline-flex justify-center items-center px-4 py-3 border border-gray-200 shadow-sm text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                <span className="sr-only">Sign in with Magic Link</span>
                <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {t('magic_link')}
              </button>
            </div>

            <p className="mt-6 text-center text-sm text-gray-600">
              {t('no_account')}{' '}
              <Link href="/auth/register" className="font-medium text-red-600 hover:text-red-500 transition-colors">
                {t('register_link')}
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
