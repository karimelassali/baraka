// components/CustomerRegistration.jsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";

/**
 * CustomerRegistration
 *
 * - Next.js 15 client component
 * - Tailwind CSS styling (red / black / white)
 * - Supabase authentication and customer profile creation
 *
 * Notes:
 * - Uses dedicated API endpoint for registration to handle both auth and profile
 * - Sends confirmation email via API endpoint
 */

export default function CustomerRegistration() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    residence: "",
    phone_number: "",
    email: "",
    country_of_origin: "",
    password: "",
    password_confirmation: "",
    gdpr_consent: false,
    terms_and_conditions: false,
    language_preference: "en",
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  // small validators
  const isEmailValid = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());

  const isPhoneValid = (phone) =>
    // accept digits, space, +, -, parentheses (simple)
    /^[\d +()-]{7,20}$/.test(phone);

  const isPasswordValid = (password) =>
    password.length >= 8;

  const requiredFieldsFilled = () =>
    form.first_name.trim() &&
    form.last_name.trim() &&
    form.date_of_birth &&
    form.residence.trim() &&
    form.phone_number.trim() &&
    form.email.trim() &&
    form.country_of_origin.trim() &&
    form.password;

  // Generic input change handler (handles checkboxes too)
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // clear status messages on change
    if (status.type) setStatus({ type: "", message: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic client-side validation
    if (!requiredFieldsFilled()) {
      setStatus({ type: "error", message: "Please fill all required fields." });
      return;
    }
    if (!isEmailValid(form.email)) {
      setStatus({
        type: "error",
        message: "Please enter a valid email address.",
      });
      return;
    }
    if (!isPhoneValid(form.phone_number)) {
      setStatus({
        type: "error",
        message:
          "Please enter a valid phone number (digits, + - parentheses allowed).",
      });
      return;
    }
    if (!isPasswordValid(form.password)) {
      setStatus({
        type: "error",
        message: "Password must be at least 8 characters long.",
      });
      return;
    }
    if (form.password !== form.password_confirmation) {
      setStatus({
        type: "error",
        message: "Passwords do not match.",
      });
      return;
    }
    if (!form.gdpr_consent || !form.terms_and_conditions) {
      setStatus({
        type: "error",
        message: "You must agree to the Privacy Policy and Terms & Conditions.",
      });
      return;
    }

    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      // Assemble payload for registration API
      const payload = {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        date_of_birth: form.date_of_birth, // ISO date string from <input type="date">
        residence: form.residence.trim(),
        phone_number: form.phone_number.trim(),
        email: form.email.trim().toLowerCase(),
        country_of_origin: form.country_of_origin.trim(),
        gdpr_consent: true,
        password: form.password,
        language_preference: form.language_preference || "en",
      };

      // Call registration API endpoint
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.message || "Registration failed");
      }

      setStatus({
        type: "success",
        message: `Registered successfully — Welcome ${result.user_id ? 'customer' : form.first_name}!`,
      });

      // Reset form (keep language preference)
      setForm({
        first_name: "",
        last_name: "",
        date_of_birth: "",
        residence: "",
        phone_number: "",
        email: "",
        country_of_origin: "",
        password: "",
        password_confirmation: "",
        gdpr_consent: false,
        terms_and_conditions: false,
        language_preference: form.language_preference || "en",
      });
    } catch (err) {
      console.error("Registration error:", err);
      setStatus({
        type: "error",
        message: err?.message || "Registration failed. Try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-2xl"
      >
        <div className="bg-white rounded-2xl shadow-2xl border border-black overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Left visual panel */}
            <div className="hidden md:flex flex-col justify-center items-center gap-4 p-8 bg-gradient-to-br from-red-600 to-black text-white">
              <div className="w-28 h-28 rounded-full bg-white/10 flex items-center justify-center">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M12 12a4 4 0 100-8 4 4 0 000 8z"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  />
                  <path
                    d="M4 20a8 8 0 0116 0"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold">Join our community</h2>
              <p className="text-sm text-white/90 text-center px-2">
                Fast registration, secure storage, and access to your personal
                area. We respect your privacy.
              </p>
            </div>

            {/* Form */}
            <div className="p-6 md:p-10">
              <header className="mb-4">
                <h1 className="text-2xl md:text-3xl font-bold text-red-600">
                  Customer Registration
                </h1>
                <p className="text-sm text-gray-600">
                  All fields marked with * are required.
                </p>
              </header>

              {status.message && (
                <div
                  role="status"
                  className={`mb-4 px-4 py-3 rounded-md text-sm ${
                    status.type === "success"
                      ? "bg-green-50 text-green-800"
                      : "bg-red-50 text-red-800"
                  }`}
                >
                  {status.message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-xs font-medium text-gray-700">
                      First name *
                    </span>
                    <input
                      name="first_name"
                      value={form.first_name}
                      onChange={handleChange}
                      required
                      aria-required
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                      placeholder="Maria"
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs font-medium text-gray-700">
                      Last name *
                    </span>
                    <input
                      name="last_name"
                      value={form.last_name}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                      placeholder="Rossi"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-xs font-medium text-gray-700">
                      Date of birth *
                    </span>
                    <input
                      name="date_of_birth"
                      type="date"
                      value={form.date_of_birth}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs font-medium text-gray-700">
                      Residence *
                    </span>
                    <input
                      name="residence"
                      value={form.residence}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                      placeholder="City, Address..."
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-xs font-medium text-gray-700">
                      Phone number *
                    </span>
                    <input
                      name="phone_number"
                      value={form.phone_number}
                      onChange={handleChange}
                      required
                      inputMode="tel"
                      placeholder="+39 123 456 789"
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs font-medium text-gray-700">
                      Email *
                    </span>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      placeholder="email@example.com"
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-xs font-medium text-gray-700">
                      Password *
                    </span>
                    <input
                      name="password"
                      type="password"
                      value={form.password}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                      placeholder="At least 8 characters"
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs font-medium text-gray-700">
                      Confirm Password *
                    </span>
                    <input
                      name="password_confirmation"
                      type="password"
                      value={form.password_confirmation}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                      placeholder="Confirm your password"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="text-xs font-medium text-gray-700">
                    Country of Origin *
                  </span>
                  <input
                    name="country_of_origin"
                    value={form.country_of_origin}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                    placeholder="Italy"
                    list="countries-list"
                  />
                  {/* small datalist with common countries (extendable) */}
                  <datalist id="countries-list">
                    <option>Italy</option>
                    <option>France</option>
                    <option>Spain</option>
                    <option>United States</option>
                    <option>United Kingdom</option>
                    <option>Germany</option>
                  </datalist>
                </label>

                <div className="flex items-center gap-3">
                  <input
                    id="gdpr"
                    name="gdpr_consent"
                    type="checkbox"
                    checked={form.gdpr_consent}
                    onChange={handleChange}
                    className="h-4 w-4 text-red-600 rounded border-gray-300"
                  />
                  <label htmlFor="gdpr" className="text-sm text-gray-700">
                    I agree to the{" "}
                    <a className="text-red-600 underline">Privacy Policy</a> *
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    id="terms"
                    name="terms_and_conditions"
                    type="checkbox"
                    checked={form.terms_and_conditions}
                    onChange={handleChange}
                    className="h-4 w-4 text-red-600 rounded border-gray-300"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-700">
                    I accept the{" "}
                    <a className="text-red-600 underline">Terms & Conditions</a>{" "}
                    *
                  </label>
                </div>

                <label className="block">
                  <span className="text-xs font-medium text-gray-700">
                    Language preference
                  </span>
                  <select
                    name="language_preference"
                    value={form.language_preference}
                    onChange={handleChange}
                    className="mt-1 block w-48 rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                  >
                    <option value="en">English</option>
                    <option value="it">Italiano</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                  </select>
                </label>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full inline-flex items-center justify-center gap-2 rounded-xl py-3 text-lg font-medium transition ${
                      loading
                        ? "bg-gray-300 text-gray-700 cursor-not-allowed"
                        : "bg-red-600 hover:bg-black text-white"
                    }`}
                  >
                    {loading ? "Processing..." : "Register"}
                  </button>
                </div>

                <div className="text-xs text-gray-400 mt-2">
                  By registering you confirm that the information provided is
                  correct and that you consent to our processing of personal
                  data in accordance with the Privacy Policy.
                </div>
              </form>

              {/* micro footer */}
              <footer className="mt-4 text-xs text-gray-500">
                Already registered?{" "}
                <a className="text-red-600 underline">Login here</a>
                <span className="block mt-1">
                  Need help?{" "}
                  <a className="text-red-600 underline">Contact support</a>
                </span>
              </footer>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
