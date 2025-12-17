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
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
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
            setError("System error: Client not initialized");
            setIsSubmitting(false);
            return;
        }

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/update-password`,
            });

            if (error) {
                setError(error.message);
            } else {
                setSuccess(true);
            }
        } catch (err) {
            setError(err.message || "An unexpected error occurred");
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
                                    <p className="text-sm text-left">{t('success_message')}</p>
                                </div>
                                <p className="text-sm text-gray-500">
                                    {t('didnt_receive')} <button onClick={() => setSuccess(false)} className="text-red-600 font-medium hover:underline">{t('try_again')}</button>
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('email_label')}
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition-all bg-white/50"
                                        placeholder="name@example.com"
                                    />
                                </div>

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
                                    {isSubmitting ? t('sending') : t('send_link')}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </BackgroundBeamsWithCollision>
        </div>
    );
}
