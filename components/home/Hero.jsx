"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { FlipWords } from "@/components/ui/flip-words";
import { useState, useEffect } from "react";
import { quotes } from "@/lib/data/quotes";
import Image from "next/image";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import UserAvatar from "../ui/UserAvatar";

export default function Hero() {
    const t = useTranslations("Hero");
    const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
    const [isMounted, setIsMounted] = useState(false);
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const supabase = createClientComponentClient();
    const router = useRouter();
    const locale = useLocale();

    useEffect(() => {
        setIsMounted(true);

        const getUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                setUser(session.user);
                // Fetch customer profile
                const { data: customerData } = await supabase
                    .from('customers')
                    .select('first_name, last_name, email')
                    .eq('auth_id', session.user.id)
                    .maybeSingle();
                if (customerData) setProfile(customerData);
            }
        };
        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                const { data: customerData } = await supabase
                    .from('customers')
                    .select('first_name, last_name, email')
                    .eq('auth_id', session.user.id)
                    .maybeSingle();
                if (customerData) setProfile(customerData);
            } else {
                setProfile(null);
            }
        });

        const interval = setInterval(() => {
            setCurrentQuoteIndex((prev) => {
                let next;
                do {
                    next = Math.floor(Math.random() * quotes.length);
                } while (next === prev && quotes.length > 1);
                return next;
            });
        }, 5000);

        return () => {
            clearInterval(interval);
            subscription.unsubscribe();
        };
    }, [supabase]);

    return (
        <section className="relative overflow-hidden bg-gradient-to-r from-red-50 to-white">
            <div className="container mx-auto px-4 py-16 md:py-24">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
                    {/* LEFT CONTENT */}
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="z-10"
                    >
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                            <span className="text-black">
                                {t("welcome_to")}
                            </span>

                            <span className="block text-red-600 mt-2">
                                <FlipWords
                                    className="text-red-600"
                                    words={[
                                        t("flip_words.0"),
                                        t("flip_words.1"),
                                        t("flip_words.2"),
                                        t("flip_words.3"),
                                    ]}
                                />
                            </span>
                        </h1>


                        <p className="mt-6 max-w-xl text-lg md:text-xl text-gray-700">
                            {t("description")}
                        </p>

                        <div className="mt-8 flex flex-col sm:flex-row gap-4">
                            <a
                                href="#gallery"
                                className="rounded-full bg-red-600 px-8 py-3 text-center font-medium text-white shadow-lg transition hover:bg-red-700"
                            >
                                {t("view_products")}
                            </a>

                            <RainbowButton
                                variant="outline"
                                onClick={() => {
                                    if (user) {
                                        router.push(`/${locale}/admin`);
                                    } else {
                                        router.push(`/${locale}/login`);
                                    }
                                }}
                                className="min-w-[140px] rounded-full px-8 py-3 h-auto text-base font-medium shadow-lg"
                            >
                                {user ? (
                                    <div className="flex items-center gap-2">
                                        <div className="relative h-6 w-6 overflow-hidden rounded-full">
                                            <UserAvatar
                                                name={profile?.email || user?.email || 'default'}
                                                size={24}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <span>{profile?.first_name || user.user_metadata?.full_name?.split(' ')[0] || "User"}</span>
                                    </div>
                                ) : (
                                    t("login")
                                )}
                            </RainbowButton>
                        </div>
                    </motion.div>

                    {/* RIGHT LOGO */}
                    {/* RIGHT LOGO */}
                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="relative flex justify-center"
                    >
                        <div className="relative w-full flex justify-center">
                            {/* LOGO CONTAINER */}
                            <div
                                className="
        relative
        w-[95%]
        sm:w-[85%]
        lg:w-[70%]
        xl:w-[60%]
        max-w-[520px]
        mt-10 sm:mt-14 lg:mt-0
        flex items-center justify-center
      "
                            >
                                <Image
                                    src="/logo.jpeg"
                                    alt="Macelleria Baraka Logo"
                                    width={900}
                                    height={500}
                                    priority
                                    className="
          w-full
          h-auto
          object-contain
          rounded-2xl
        "
                                />
                            </div>

                            {/* QUOTE CARD */}
                            <motion.div
                                className="
        absolute
        -bottom-10
        right-4 md:-right-6
        bg-white
        rounded-xl
        p-5
        shadow-xl
        w-[260px]
        border border-gray-100
      "
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                            >
                                <AnimatePresence mode="wait">
                                    {isMounted && (
                                        <motion.p
                                            key={currentQuoteIndex}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.4 }}
                                            className="text-sm italic text-gray-700"
                                        >
                                            “{t(`quotes.${quotes[currentQuoteIndex]}`)}”
                                        </motion.p>
                                    )}
                                </AnimatePresence>

                                <div className="mt-4 flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
                                        B
                                    </div>
                                    <span className="text-sm font-semibold text-gray-600">
                                        {t("team")}
                                    </span>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
