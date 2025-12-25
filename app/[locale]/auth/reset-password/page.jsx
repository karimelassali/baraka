"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/navigation";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";

export default function ResetPasswordPage() {
    const t = useTranslations('Auth.ResetPassword');
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [resetMethod, setResetMethod] = useState("email"); // "email" or "phone"
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Phone Flow State
    const [step, setStep] = useState(1); // 1: Input, 2: OTP, 3: New Password
    const [otpCode, setOtpCode] = useState("");
    const [resetToken, setResetToken] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [supabase, setSupabase] = useState(null);
    const router = useRouter();

    useEffect(() => {
        setSupabase(createClient());

        // Check for email in query params (e.g. from profile page)
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const emailParam = params.get('email');
            if (emailParam) {
                setEmail(emailParam);
            }
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        if (!supabase) {
            setError("Errore di sistema. Riprova più tardi.");
            setIsSubmitting(false);
            return;
        }

        try {
            if (resetMethod === "email") {
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}/auth/update-password`,
                });
                if (error) throw error;
                setSuccess(true);
            } else {
                // Phone Flow - Step 1: Send OTP
                const res = await fetch("/api/auth/otp/send", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ phone_number: phone })
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Errore nell'invio dell'SMS");

                setStep(2); // Move to OTP step
            }
        } catch (err) {
            setError(err.message || "Si è verificato un errore inatteso.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            const res = await fetch("/api/auth/otp/verify-reset", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone_number: phone, code: otpCode })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Codice non valido");

            setResetToken(data.resetToken);
            setStep(3); // Move to New Password step

        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError("Le password non corrispondono");
            return;
        }
        if (newPassword.length < 8) {
            setError("La password deve essere di almeno 8 caratteri");
            return;
        }

        setError(null);
        setIsSubmitting(true);

        try {
            const res = await fetch("/api/auth/password-reset/complete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ resetToken, newPassword })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Errore aggiornamento password");

            setSuccess(true); // Show final success screen

        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full bg-gray-50">
            <BackgroundBeamsWithCollision duration={10} className="min-h-screen">
                <div className="relative z-10 w-full max-w-md mx-auto px-4 flex items-center justify-center min-h-screen">
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 w-full">
                        <Link href="/auth/login" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            {t('back_to_login')}
                        </Link>

                        <div className="text-center mb-8">
                            <div className="w-48 h-48 mx-auto mb-6">
                                <img
                                    src="/illus/undraw_forgot-password_nttj.svg"
                                    alt="Forgot Password"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
                            <p className="text-gray-600 mt-2">{t('subtitle')}</p>
                        </div>

                        {success ? (
                            <div className="text-center space-y-6">
                                <div className="bg-green-50 text-green-800 p-4 rounded-xl border border-green-100 flex items-start">
                                    <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-left">
                                        {resetMethod === 'email'
                                            ? "Abbiamo inviato un link di reset alla tua email."
                                            : "Password aggiornata con successo! Ora puoi accedere."}
                                    </p>
                                </div>
                                <p className="text-sm text-gray-500">
                                    <Link href="/auth/login" className="text-red-600 font-medium hover:underline">Vai al Login</Link>
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* EMAIL or STEP 1 PHONE */}
                                {(resetMethod === 'email' || (resetMethod === 'phone' && step === 1)) && (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {/* Toggle Method */}
                                        <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
                                            <button
                                                type="button"
                                                onClick={() => setResetMethod("email")}
                                                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${resetMethod === "email" ? "bg-white text-red-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                                                    }`}
                                            >
                                                Via Email
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setResetMethod("phone")}
                                                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${resetMethod === "phone" ? "bg-white text-red-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                                                    }`}
                                            >
                                                Via SMS
                                            </button>
                                        </div>

                                        {resetMethod === "email" ? (
                                            <div>
                                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Indirizzo Email
                                                </label>
                                                <input
                                                    id="email"
                                                    type="email"
                                                    required
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition-all bg-white/50"
                                                    placeholder="nome@esempio.com"
                                                />
                                            </div>
                                        ) : (
                                            <div>
                                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Numero di Telefono
                                                </label>
                                                <input
                                                    id="phone"
                                                    type="tel"
                                                    required
                                                    value={phone}
                                                    onChange={(e) => setPhone(e.target.value)}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition-all bg-white/50"
                                                    placeholder="+39 333 123 4567"
                                                />
                                            </div>
                                        )}

                                        {error && (
                                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                                                {error}
                                            </div>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl shadow-lg shadow-red-200 transition-all transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            {isSubmitting ? "Invio in corso..." : (resetMethod === 'email' ? "Invia Link Reset" : "Invia Codice SMS")}
                                        </button>
                                    </form>
                                )}

                                {/* STEP 2: OTP INPUT */}
                                {resetMethod === 'phone' && step === 2 && (
                                    <form onSubmit={handleVerifyOtp} className="space-y-6">
                                        <div className="text-center mb-4">
                                            <p className="text-sm text-gray-600">Inserisci il codice inviato a <strong>{phone}</strong></p>
                                        </div>
                                        <input
                                            type="text"
                                            maxLength={6}
                                            value={otpCode}
                                            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                                            placeholder="000000"
                                            className="w-full text-center text-3xl tracking-[0.5em] font-mono font-bold py-4 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-50 outline-none transition-all"
                                            autoFocus
                                        />
                                        {error && <div className="text-red-500 text-center text-sm">{error}</div>}

                                        <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-red-600 text-white rounded-xl font-bold">
                                            {isSubmitting ? 'Verifica...' : 'Verifica Codice'}
                                        </button>
                                        <button type="button" onClick={() => setStep(1)} className="w-full py-2 text-gray-500 text-sm">Cambia numero</button>
                                    </form>
                                )}

                                {/* STEP 3: NEW PASSWORD */}
                                {resetMethod === 'phone' && step === 3 && (
                                    <form onSubmit={handlePasswordUpdate} className="space-y-6">
                                        <h3 className="text-lg font-bold text-center">Imposta Nuova Password</h3>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Nuova Password</label>
                                            <input
                                                type="password"
                                                required
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Conferma Password</label>
                                            <input
                                                type="password"
                                                required
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none"
                                                placeholder="••••••••"
                                            />
                                        </div>

                                        {error && <div className="text-red-500 text-center text-sm">{error}</div>}

                                        <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-red-600 text-white rounded-xl font-bold">
                                            {isSubmitting ? 'Aggiornamento...' : 'Aggiorna Password'}
                                        </button>
                                    </form>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </BackgroundBeamsWithCollision>
        </div>
    );
}
