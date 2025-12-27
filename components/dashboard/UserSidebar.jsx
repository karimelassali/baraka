"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    User,
    Wallet,
    Gift,
    Ticket,
    LogOut,
    ChevronRight,
    Heart,
    Sparkles,
    AlertCircle,
    MessageSquare
} from 'lucide-react';
import { useRouter } from '@/navigation';
import { createClient } from '@/lib/supabase/client';
import { getAvatarUrl } from '@/lib/avatar';
import Image from 'next/image';
import UserAvatar from '@/components/ui/UserAvatar';

export default function UserSidebar({
    activeTab,
    setActiveTab,
    user,
    t
}) {
    const router = useRouter();
    const supabase = createClient();
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const navItems = [
        { id: 'overview', label: t('overview'), icon: LayoutDashboard },
        { id: 'profile', label: t('profile'), icon: User },
        { id: 'wallet', label: t('wallet'), icon: Wallet },
        { id: 'offers', label: t('offers'), icon: Gift },
        { id: 'vouchers', label: t('vouchers'), icon: Ticket },
        { id: 'reviews', label: t('reviews'), icon: MessageSquare },
        { id: 'wishlist', label: t('wishlist'), icon: Heart },
    ];

    const handleSignOutClick = () => {
        setShowLogoutModal(true);
    };

    const confirmSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/auth/login');
    };

    const DesktopSidebar = () => (
        <div id="dashboard-sidebar" className="hidden lg:flex flex-col h-screen sticky top-0 bg-white border-r border-gray-200 shadow-sm relative z-50 w-[280px] transition-all duration-300">
            {/* Logo Area */}
            <div className="h-24 flex items-center px-8 border-b border-gray-100 shrink-0">
                <div
                    className="flex items-center space-x-4 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => router.push('/')}
                >
                    <div className="relative group w-10 h-10">
                        <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-orange-600 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                        <Image
                            src="/logo.jpeg"
                            alt="Baraka Logo"
                            fill
                            className="relative object-contain rounded-full"
                        />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-bold tracking-tight text-gray-900">Baraka</span>
                        <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Loyalty</span>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">
                <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Menu</p>
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 group relative overflow-hidden ${isActive
                                ? 'bg-red-50 text-red-700 shadow-sm'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <Icon className={`h-5 w-5 transition-transform duration-300 ${isActive ? 'text-red-600' : 'text-gray-400 group-hover:text-gray-600 group-hover:scale-110'}`} />
                            <span className="relative z-10">{item.label}</span>
                            {isActive && (
                                <motion.div
                                    layoutId="activeGlow"
                                    className="absolute inset-0 bg-red-50 rounded-xl"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    style={{ zIndex: 0 }}
                                />
                            )}
                            {isActive && (
                                <ChevronRight className="ml-auto h-4 w-4 text-red-400 relative z-10" />
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* User Profile Section - Pushed to bottom */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/50 shrink-0 mt-auto">
                <div className="bg-white rounded-2xl p-4 mb-3 border border-gray-100 shadow-sm">


                    <div
                        className="flex items-center space-x-3 mb-3 cursor-pointer hover:bg-gray-50 p-2 rounded-xl transition-colors"
                        onClick={() => setActiveTab('profile')}
                    >
                        <div className="relative">
                            <div className="w-10 h-10 relative rounded-full p-0.5 bg-gradient-to-br from-red-500 to-orange-500">
                                <UserAvatar
                                    name={user.email || user.user_metadata?.email || 'default'}
                                    size={36}
                                    className="rounded-full bg-white p-0.5"
                                />
                            </div>
                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">
                                {user.user_metadata?.full_name || t('welcome_back')}
                            </p>
                            <p className="text-xs text-gray-500 truncate" title={user.email}>
                                {user.email}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleSignOutClick}
                        className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                    >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>{t('sign_out')}</span>
                    </button>
                </div>
            </div>
        </div>
    );

    const MobileBottomNav = () => (
        <div id="mobile-bottom-nav" className="lg:hidden fixed bottom-4 left-4 right-4 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 z-50 ring-1 ring-black/5">
            <div className="flex justify-between items-center px-2 py-3 overflow-x-auto no-scrollbar">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className="relative flex flex-col items-center justify-center p-2 min-w-[4rem]"
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="mobileActiveIndicator"
                                    className="absolute inset-0 bg-red-50 rounded-xl"
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            )}
                            <Icon className={`h-6 w-6 transition-all duration-300 relative z-10 ${isActive ? 'text-red-600 scale-110' : 'text-gray-400 hover:text-gray-600'}`} />
                            {isActive && (
                                <span className="text-[10px] font-bold text-red-600 mt-1 relative z-10">
                                    {item.label}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );

    const LogoutModal = () => (
        <AnimatePresence>
            {showLogoutModal && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100]"
                        onClick={() => setShowLogoutModal(false)}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 z-[101] border border-gray-100"
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="w-full flex justify-center mb-4">
                                <img
                                    src="/illus/undraw_a-moment-to-relax_mrkn.svg"
                                    alt="Sign Out"
                                    className="h-32 w-auto object-contain"
                                />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                {t('sign_out')}?
                            </h3>
                            <p className="text-gray-500 mb-6">
                                Are you sure you want to sign out? You'll need to sign in again to access your account.
                            </p>
                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => setShowLogoutModal(false)}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmSignOut}
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors shadow-lg shadow-red-500/20"
                                >
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );

    return (
        <>
            <DesktopSidebar />
            <MobileBottomNav />
            <LogoutModal />
        </>
    );
}
