"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useTranslations } from "next-intl";
import { Link, useRouter, usePathname } from "@/navigation";
import { useLocale } from "next-intl";
import { Mail, Lock, Loader2, ArrowRight, ArrowLeft, Phone, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

import Input from "@/components/ui/input";
import PhoneInputWithCountry from "@/components/ui/PhoneInputWithCountry";

export default function LoginForm() {
  const t = useTranslations('Auth.Login');
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState("email"); // "email" or "phone"
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [supabase, setSupabase] = useState(null);
  const router = useRouter();

  // OTP State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [unverifiedPhone, setUnverifiedPhone] = useState("");
  const [resendCountdown, setResendCountdown] = useState(60);

  useEffect(() => {
    setSupabase(createClient());
  }, []);

  // Countdown timer for resend button
  useEffect(() => {
    let timer;
    if (showOtpModal && resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showOtpModal, resendCountdown]);

  const handleResendOtp = async () => {
    if (resendCountdown > 0 || !unverifiedPhone) return;

    setOtpError("");
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: unverifiedPhone })
      });

      if (!res.ok) {
        throw new Error("Invio fallito. Riprova.");
      }

      setResendCountdown(60); // Reset countdown
      setOtpCode(""); // Clear old code
    } catch (err) {
      setOtpError(err.message);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!supabase) {
      setError("Supabase client not initialized");
      setLoading(false);
      return;
    }

    try {
      let loginEmail = email;
      let cleanPhone = null; // Declare in outer scope for OTP handling

      if (loginMethod === 'phone') {
        // Client-side Normalization
        // Client-side Normalization using libphonenumber-js
        // This handles cases like:
        // - User selects Ireland (+353) and types 353... -> +353353... -> Becomes +353... (if valid)
        // - User types 0039... -> +39...
        // - User types +39 353... -> +39353...
        cleanPhone = phone; // Default to raw input
        try {
          // Import dynamically or assume it's available if added to package.json
          // Since this is a client component, better to import at top. 
          // I'll add the import in a separate step if not present, but for now I'll use a robust fallback logic if import fails or use simple cleanup
          // Actually, I should stick to the robust logic I added to the BACKEND (phone-utils.js). 
          // The frontend just needs to send the raw input (+353353...) to the backend.
          // The logic I removed below was: phone.replace(/[^\d+]/g, ''); which IS good.
          // I will restore a simple cleanup: remove spaces/dashes.
          cleanPhone = phone.replace(/[^\d+]/g, '');

          // If user typed 00 instead of +, fix it
          if (cleanPhone.startsWith('00')) {
            cleanPhone = '+' + cleanPhone.substring(2);
          } else if (!cleanPhone.startsWith('+')) {
            // If no +, assume + is missing? 
            // PhoneInputWithCountry ALWAYS adds +CC.
            // If user deleted it, we might be in trouble, but let's assume they kept it.
            cleanPhone = '+' + cleanPhone;
          }
        } catch (e) {
          console.error("Phone normalization error", e);
        }

        const res = await fetch("/api/auth/lookup-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: cleanPhone })
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || t('phone_not_found'));
        }
        loginEmail = data.email;
      }

      const { error, data } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password
      });

      if (error) {
        // Check if error is "Email not confirmed" and user is logging in with phone
        const isEmailNotConfirmed = error.message?.toLowerCase().includes('email not confirmed');

        if (isEmailNotConfirmed && loginMethod === 'phone' && cleanPhone) {
          // User is logging in with phone but email is not confirmed
          // Trigger phone OTP verification instead
          console.log('[Login] Email not confirmed, triggering phone OTP for:', cleanPhone);
          setUnverifiedPhone(cleanPhone);
          try {
            await fetch("/api/auth/otp/send", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ phone_number: cleanPhone })
            });
            setShowOtpModal(true);
            setLoading(false);
            return;
          } catch (otpErr) {
            console.error("Failed to send OTP:", otpErr);
            setError("Non siamo riusciti a inviare il codice di verifica. Riprova.");
          }
        } else {
          setError(error.message === "Invalid login credentials"
            ? t('invalid_credentials')
            : error.message);
        }
      } else {
        setSuccess(t('success'));

        try {
          const user = data.user;

          if (user) {
            // Check Admin
            const { data: adminData } = await supabase
              .from('admin_users')
              .select('role')
              .eq('auth_id', user.id)
              .single();

            if (adminData) {
              window.location.href = "/admin";
              return;
            }

            // Check Customer
            const { data: customerData } = await supabase
              .from('customers')
              .select('is_verified, phone_number')
              .eq('auth_id', user.id)
              .single();

            if (customerData && customerData.is_verified === false) {
              setUnverifiedPhone(customerData.phone_number);
              // Automatically send OTP
              await fetch("/api/auth/otp/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone_number: customerData.phone_number })
              }).catch(err => console.error("OTP Send Error:", err));

              setShowOtpModal(true);
              setLoading(false);
              return; // Stop redirect
            }

            // Redirect User
            const urlParams = new URLSearchParams(window.location.search);
            const redirectUrl = urlParams.get('redirect');
            window.location.href = redirectUrl ? decodeURIComponent(redirectUrl) : "/dashboard";
          }
        } catch (err) {
          console.error("Post-login check error:", err);
          // Fallback redirect if checks fail but login succeeded
          window.location.href = "/dashboard";
        }
      }
    } catch (err) {
      setError(err.message || t('error_generic'));
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    setError(null);
    setSuccess(null);
    if (!supabase) return;
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const redirectUrl = urlParams.get('redirect');
      const redirectTo = redirectUrl ? `${window.location.origin}${decodeURIComponent(redirectUrl)}` : `${window.location.origin}/dashboard`;
      const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } });
      if (error) setError(error.message);
      else setSuccess(t('magic_link_sent'));
    } catch (err) { setError(err.message || t('error_generic')); }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length < 6) { setOtpError("Please enter valid code"); return; }
    setOtpLoading(true); setOtpError("");
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: unverifiedPhone, code: otpCode })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setShowOtpModal(false);
      window.location.href = "/dashboard";
    } catch (err) { setOtpError(err.message); } finally { setOtpLoading(false); }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-red-600 items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" /></pattern></defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>
        <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="relative z-10 w-full max-w-lg">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
            <img src="/illus/undraw_access-account_aydp.svg" alt="Login" className="w-full h-auto drop-shadow-xl mb-8" />
            <div className="text-white text-center">
              <h2 className="text-3xl font-bold mb-4">{t('title')}</h2>
              <p className="text-red-100 text-lg">{t('subtitle')}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-12 lg:w-1/2 bg-white relative">
        <div className="absolute top-8 right-8">
          <LanguageSwitcherTrigger />
        </div>

        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">{t('title')}</h2>
            <p className="mt-2 text-sm text-gray-600">{t('subtitle')}</p>
          </div>

          {/* Login Method Toggle */}
          <div className="flex p-1 bg-gray-100 rounded-xl">
            <button
              onClick={() => setLoginMethod('email')}
              className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-lg transition-all ${loginMethod === 'email' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Mail className="w-4 h-4 mr-2" />
              Email
            </button>
            <button
              onClick={() => setLoginMethod('phone')}
              className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-lg transition-all ${loginMethod === 'phone' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Phone className="w-4 h-4 mr-2" />
              {t('phone_label')}
            </button>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {loginMethod === 'email' ? (
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">{t('email_label')}</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder={t('email_placeholder')}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">{t('phone_label')}</label>
                  <PhoneInputWithCountry
                    id="phone"
                    value={phone}
                    onChange={setPhone}
                    placeholder={t('phone_placeholder')}
                    className="border-gray-200"
                  />
                </div>
              )}

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">{t('password_label')}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder={t('password_placeholder')}
                    className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <Link href="/auth/reset-password" className="text-sm font-medium text-red-600 hover:text-red-500">{t('forgot_password')}</Link>
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
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  {loading ? (
                    <svg className="animate-spin h-5 w-5 text-red-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <Lock className="h-5 w-5 text-red-500 group-hover:text-red-400 transition-colors" aria-hidden="true" />
                  )}
                </span>
                {loading ? t('submitting') : t('submit')}
                {!loading && <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </button>
            </div>
          </form>

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
        </div>

        {/* OTP Verification Modal */}
        {showOtpModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden"
            >
              <div className="bg-white p-8 text-center">
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-2">Verify Phone</h3>
                <p className="text-gray-500 mb-6 text-sm">
                  Verification required. We sent a code to <span className="font-semibold text-gray-900">{unverifiedPhone}</span>.
                </p>

                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full text-center text-3xl tracking-[0.5em] font-mono font-bold py-4 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-50 outline-none transition-all mb-4"
                  autoFocus
                />

                {otpError && (
                  <p className="text-red-500 text-sm mb-4 font-medium bg-red-50 py-2 px-3 rounded-lg border border-red-100">
                    {otpError}
                  </p>
                )}

                <button
                  onClick={handleVerifyOtp}
                  disabled={otpLoading}
                  className="w-full py-4 bg-red-600 text-white rounded-xl font-bold text-lg hover:bg-red-700 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-red-200"
                >
                  {otpLoading ? 'Verifying...' : 'Verify & Login'}
                </button>

                {/* Resend Button with Countdown */}
                <button
                  onClick={handleResendOtp}
                  disabled={resendCountdown > 0}
                  className={`mt-3 w-full py-3 rounded-xl font-medium text-sm transition-all ${resendCountdown > 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                  {resendCountdown > 0
                    ? `Reinvia codice (${resendCountdown}s)`
                    : 'Reinvia codice'}
                </button>

                <button
                  onClick={() => {
                    supabase.auth.signOut().then(() => {
                      setShowOtpModal(false);
                      setLoading(false); // Reset submitting state
                      setResendCountdown(60); // Reset countdown
                    });
                  }}
                  className="mt-4 text-sm text-gray-400 hover:text-gray-600"
                >
                  Cancel & Logout
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

// Minimal Language Switcher Component
function LanguageSwitcherTrigger() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const switchLocale = (newLocale) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div className="flex gap-2 text-sm font-medium text-gray-400">
      <button onClick={() => switchLocale('en')} className={locale === 'en' ? 'text-red-600' : 'hover:text-gray-600'}>EN</button>
      <span className="text-gray-300">|</span>
      <button onClick={() => switchLocale('it')} className={locale === 'it' ? 'text-red-600' : 'hover:text-gray-600'}>IT</button>
      <span className="text-gray-300">|</span>
      <button onClick={() => switchLocale('ar')} className={locale === 'ar' ? 'text-red-600' : 'hover:text-gray-600'}>AR</button>
    </div>
  );
}
