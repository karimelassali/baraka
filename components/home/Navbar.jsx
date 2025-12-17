"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LanguageSwitcher from "../ui/LanguageSwitcher";
import { useTranslations } from 'next-intl';
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { User, LogOut } from "lucide-react";
import { getAvatarUrl } from "@/lib/avatar";

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const t = useTranslations('Navbar');
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        const checkUser = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    setUser(session.user);

                    // Fetch customer profile
                    const { data: customerData } = await supabase
                        .from('customers')
                        .select('first_name, last_name, email')
                        .eq('auth_id', session.user.id)
                        .single();

                    if (customerData) {
                        setProfile(customerData);
                    }

                    // Check if admin
                    const { data: adminData } = await supabase
                        .from('admin_users')
                        .select('id')
                        .eq('auth_id', session.user.id)
                        .eq('is_active', true)
                        .single();

                    if (adminData) setIsAdmin(true);
                }
            } catch (error) {
                console.error("Error checking user:", error);
            }
        };

        checkUser();

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                setUser(session.user);

                // Fetch customer profile on auth change
                const { data: customerData } = await supabase
                    .from('customers')
                    .select('first_name, last_name, email')
                    .eq('auth_id', session.user.id)
                    .single();

                if (customerData) {
                    setProfile(customerData);
                }

                // Re-check admin status on auth change
                const { data: adminData } = await supabase
                    .from('admin_users')
                    .select('id')
                    .eq('auth_id', session.user.id)
                    .eq('is_active', true)
                    .single();

                if (adminData) setIsAdmin(true);
                else setIsAdmin(false);
            } else {
                setUser(null);
                setProfile(null);
                setIsAdmin(false);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const handleProfileClick = () => {
        if (isAdmin) {
            router.push('/admin');
        } else {
            router.push('/dashboard');
        }
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
        setIsAdmin(false);
        router.refresh();
    };

    // Helper to get display name
    const getDisplayName = () => {
        if (profile?.first_name) return profile.first_name;
        if (user?.user_metadata?.full_name) return user.user_metadata.full_name.split(' ')[0];
        return t('profile');
    };

    // Helper to get avatar URL
    const getUserAvatar = () => {
        // 1. Try social auth avatar
        if (user?.user_metadata?.avatar_url) return user.user_metadata.avatar_url;

        // 2. Try generating from email (from profile or user object)
        const email = profile?.email || user?.email;
        if (email) return getAvatarUrl(email);

        // 3. Fallback
        return getAvatarUrl('default');
    };

    return (
        <motion.header
            className="bg-white shadow-sm sticky top-0 z-50"
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 100 }}
        >
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <div className="flex items-center">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <img
                            src="/logo.jpeg"
                            alt="Baraka Logo"
                            className="w-12 h-12 object-contain rounded-full"
                        />
                    </motion.div>
                    <motion.h1
                        className="ml-3 text-2xl font-bold text-black"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        Baraka
                    </motion.h1>
                </div>

                <nav className="hidden md:flex space-x-8">
                    {["about", "gallery", "offers", "reviews", "contact"].map(
                        (item) => (
                            <motion.a
                                key={item}
                                href={`#${item}`}
                                className="text-gray-600 hover:text-red-600 transition font-medium"
                                whileHover={{ y: -2 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {t(item)}
                            </motion.a>
                        )
                    )}
                </nav>

                <div className="flex items-center space-x-2 md:space-x-4">
                    <div className="mr-2">
                        <LanguageSwitcher />
                    </div>

                    {user && (
                        <motion.button
                            onClick={handleProfileClick}
                            className="md:hidden flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full overflow-hidden"
                            whileTap={{ scale: 0.95 }}
                        >
                            <img
                                src={getUserAvatar()}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        </motion.button>
                    )}

                    <button
                        className="md:hidden p-2 text-gray-600"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            {isMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>

                    {user ? (
                        <div className="hidden md:flex items-center gap-3">
                            <motion.button
                                onClick={handleProfileClick}
                                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full transition-colors"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <img
                                    src={getUserAvatar()}
                                    alt="Profile"
                                    className="w-6 h-6 rounded-full object-cover"
                                />
                                <span className="text-sm font-medium text-gray-700">
                                    {getDisplayName()}
                                </span>
                            </motion.button>
                        </div>
                    ) : (
                        <>
                            <motion.a
                                href="/auth/login"
                                className="text-gray-600 hover:text-red-600 transition hidden md:block font-medium"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {t('login')}
                            </motion.a>

                            <motion.a
                                href="/auth/register"
                                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-5 rounded-full transition duration-300 text-sm shadow-md hover:shadow-lg hidden md:block"
                                whileHover={{
                                    scale: 1.05,
                                }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {t('register')}
                            </motion.a>
                        </>
                    )}
                </div>
            </div>

            {/* Mobile menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-lg"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="flex flex-col p-4 space-y-4">
                            {["about", "gallery", "offers", "reviews", "contact"].map(
                                (item) => (
                                    <motion.a
                                        key={item}
                                        href={`#${item}`}
                                        className="text-gray-600 hover:text-red-600 transition font-medium block"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        {t(item)}
                                    </motion.a>
                                )
                            )}
                            <div className="pt-4 border-t border-gray-100 flex flex-col space-y-3">
                                {user ? (
                                    <>
                                        <button
                                            onClick={handleProfileClick}
                                            className="flex items-center gap-3 w-full p-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
                                        >
                                            <img
                                                src={getUserAvatar()}
                                                alt="Profile"
                                                className="w-8 h-8 rounded-full object-cover"
                                            />
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-900">
                                                    {getDisplayName()}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {isAdmin ? 'Administrator' : 'User'}
                                                </span>
                                            </div>
                                        </button>
                                        <button
                                            onClick={handleSignOut}
                                            className="flex items-center gap-2 text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors w-full text-left"
                                        >
                                            <LogOut className="w-5 h-5" />
                                            <span className="font-medium">{t('logout')}</span>
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <a
                                            href="/auth/login"
                                            className="text-gray-600 hover:text-red-600 transition font-medium block"
                                        >
                                            {t('login')}
                                        </a>
                                        <a
                                            href="/auth/register"
                                            className="bg-red-600 text-white font-medium py-2 px-4 rounded-lg text-center shadow-sm"
                                        >
                                            {t('register')}
                                        </a>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    );
}
