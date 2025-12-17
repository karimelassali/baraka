"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";
import { useTranslations } from "next-intl";
import { useRouter } from "@/navigation";
import { Lock, CheckCircle, AlertCircle } from "lucide-react";

export default function UpdatePasswordPage() {
    const t = useTranslations('Auth.UpdatePassword');
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isVerifying, setIsVerifying] = useState(true);
    const [supabase, setSupabase] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const client = createClient();
        setSupabase(client);

        const checkSession = async () => {
            const { data: { user } } = await client.auth.getUser();
            if (user) {
                setIsVerifying(false);
            }
        };

        checkSession();

        // Listen for auth state changes to detect when session is recovered from URL
        const { data: { subscription } } = client.auth.onAuthStateChange(async (event, session) => {
            if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
                setIsVerifying(false);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError(t('passwords_mismatch'));
            return;
        }

        if (password.length < 6) {
            setError(t('password_too_short'));
            return;
        }

        setIsSubmitting(true);

        if (!supabase) {
            setError("System error: Client not initialized");
            setIsSubmitting(false);
            return;
        }

        // Double check session before updating using getUser() for validation
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            console.error("Session check failed:", userError);
            setError("Session expired or invalid. Please request a new password reset link.");
            setIsSubmitting(false);
            return;
        }

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) {
                console.error("Update user failed:", error);
                setError(error.message);
            } else {
                setSuccess(true);
                setTimeout(() => {
                    router.push('/auth/login');
                }, 3000);
            }
        } catch (err) {
            console.error("Unexpected error:", err);
            setError(err.message || "An unexpected error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isVerifying) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600 mx-auto"></div>
                    <p className="mt-4 text-sm text-gray-500 font-medium">Verifying reset link...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen w-full bg-gray-50">
            <BackgroundBeamsWithCollision duration={10} className="min-h-screen">
                <div className="relative z-10 w-full max-w-md mx-auto px-4 flex items-center justify-center min-h-screen">
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 w-full">

                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Lock className="w-8 h-8 text-red-600" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
                            <p className="text-gray-600 mt-2">{t('subtitle')}</p>
                        </div>

                        {success ? (
                            <div className="text-center space-y-6">
                                <div className="bg-green-50 text-green-800 p-6 rounded-xl border border-green-100">
                                    <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-600" />
                                    <h3 className="text-lg font-bold mb-2">{t('success_title')}</h3>
                                    <p className="text-sm">{t('success_message')}</p>
                                </div>
                                <p className="text-sm text-gray-500">
                                    {t('redirecting')}
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('new_password_label')}
                                    </label>
                                    <input
                                        id="password"
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition-all bg-white/50"
                                        placeholder="••••••••"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('confirm_password_label')}
                                    </label>
                                    <input
                                        id="confirmPassword"
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition-all bg-white/50"
                                        placeholder="••••••••"
                                    />
                                </div>

                                {error && (
                                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-start">
                                        <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl shadow-lg shadow-red-200 transition-all transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? t('updating') : t('update_password')}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </BackgroundBeamsWithCollision>
        </div>
    );
}
