"use client";

import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    User,
    Wallet,
    Gift,
    Ticket,
    LogOut,
    ChevronRight
} from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useRouter } from '@/navigation';
import { createClient } from '@/lib/supabase/client';

export default function UserSidebar({
    activeTab,
    setActiveTab,
    user,
    t
}) {
    const router = useRouter();
    const supabase = createClient();

    const navItems = [
        { id: 'overview', label: t('overview'), icon: LayoutDashboard },
        { id: 'profile', label: t('profile'), icon: User },
        { id: 'wallet', label: t('wallet'), icon: Wallet },
        { id: 'offers', label: t('offers'), icon: Gift },
        { id: 'vouchers', label: t('vouchers'), icon: Ticket },
    ];

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/auth/login');
    };

    const DesktopSidebar = () => (
        <div className="hidden lg:flex flex-col h-full bg-white border-r border-gray-100 shadow-sm relative z-50 w-72">
            {/* Logo Area */}
            <div className="h-24 flex items-center px-8">
                <div className="flex items-center space-x-3">
                    <motion.div
                        className="relative group cursor-pointer"
                        whileHover={{ scale: 1.05, y: -5, rotate: 3 }} // Lift, scale, and slight rotate on hover
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                        {/* Subtle background glow effect */}
                        <div className="absolute inset-0 bg-red-500 opacity-0 group-hover:opacity-30 transition-opacity duration-300 rounded-xl" />
                        <div className="relative w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20">
                            <img src="/logo.jpeg" alt="Baraka Logo" className="w-8 h-8 object-contain rounded-full" />
                        </div>
                    </motion.div>
                    <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 tracking-tight">Baraka</span>
                </div>
            </div>

            {/* User Profile Section */}
            <div className="px-6 pb-6">
                <div className="bg-gray-50/80 border border-gray-100 rounded-2xl p-4 flex items-center space-x-4">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-full p-0.5 bg-white shadow-sm">
                            <img
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                                alt="User Avatar"
                                className="w-full h-full rounded-full bg-gray-100"
                            />
                        </div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">
                            {user.user_metadata?.full_name || t('welcome_back')}
                        </p>
                        <p className="text-xs text-gray-500 truncate font-medium" title={user.email}>
                            {user.email}
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
                <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Menu</p>
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 group relative overflow-hidden ${isActive
                                ? 'bg-red-50 text-red-700'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="desktopActiveIndicator"
                                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-red-600 rounded-r-full"
                                />
                            )}
                            <Icon className={`h-5 w-5 transition-transform duration-300 ${isActive ? 'text-red-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                            <span className="relative z-10">{item.label}</span>
                            {isActive && (
                                <ChevronRight className="ml-auto h-4 w-4 text-red-400" />
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* Footer Actions */}
            <div className="p-4 border-t border-gray-100 space-y-3">
                <div className="flex justify-center">
                    <LanguageSwitcher />
                </div>
                <button
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200 border border-transparent hover:border-red-100 group"
                >
                    <LogOut className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    <span>{t('sign_out')}</span>
                </button>
            </div>
        </div>
    );

    const MobileBottomNav = () => (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-200 pb-safe z-50">
            <div className="flex justify-around items-center px-2 py-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className="relative flex flex-col items-center justify-center p-3 w-full"
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="mobileActiveIndicator"
                                    className="absolute -top-2.5 w-12 h-1 bg-red-500 rounded-b-full shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            )}
                            <div className={`relative p-2 rounded-xl transition-all duration-300 ${isActive ? 'bg-red-50' : ''}`}>
                                <Icon className={`h-7 w-7 transition-colors duration-300 ${isActive ? 'text-red-600' : 'text-gray-400'}`} />
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );

    return (
        <>
            <DesktopSidebar />
            <MobileBottomNav />
        </>
    );
}
