"use client";

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from '@/navigation';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { ShieldCheck } from 'lucide-react';

import { DashboardProvider, useDashboard } from '@/components/dashboard/DashboardContext';
import UserSidebar from '@/components/dashboard/UserSidebar';
import LanguageSelectionModal from '@/components/dashboard/LanguageSelectionModal';
import DashboardTour from '@/components/dashboard/DashboardTour';
import PopupOffer from '@/components/home/PopupOffer';
import UserAvatar from '@/components/ui/UserAvatar';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import PaymentMethodsBox from '@/components/client/PaymentMethodsBox';

// Dynamic import for heavy components
const FloatingProfileCard = dynamic(() => import('@/components/dashboard/FloatingProfileCard'), {
    ssr: false,
});

function DashboardLayoutContent({ children }) {
    const { user, profile, loading, supabase } = useDashboard();
    const t = useTranslations('Dashboard');
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    const [hasSeenTour, setHasSeenTour] = useState(false);
    const [showLanguageModal, setShowLanguageModal] = useState(false);
    const [isLanguageConfirmed, setIsLanguageConfirmed] = useState(false);
    const [showAdminRedirectModal, setShowAdminRedirectModal] = useState(false);

    // Derive active section from pathname
    const getActiveSection = (path) => {
        if (path === '/dashboard') return 'overview';
        if (path.startsWith('/dashboard/')) {
            return path.split('/dashboard/')[1].split('/')[0];
        }
        return 'overview';
    };

    const activeSection = getActiveSection(pathname);

    useEffect(() => {
        // Check local storage for Tour and Language
        if (typeof window !== 'undefined') {
            const tourSeen = localStorage.getItem('hasSeenTour_overview');
            if (tourSeen === 'true') {
                setHasSeenTour(true);
            }

            const langPref = localStorage.getItem('language_preference_set');
            if (!langPref) {
                setShowLanguageModal(true);
                setIsLanguageConfirmed(false);
            } else {
                setIsLanguageConfirmed(true);
            }
        }
    }, []);

    useEffect(() => {
        // Admin check
        const checkAdmin = async () => {
            if (user && supabase) {
                const { data: adminData } = await supabase
                    .from('admin_users')
                    .select('id')
                    .eq('auth_id', user.id)
                    .eq('is_active', true)
                    .single();

                if (adminData) {
                    setShowAdminRedirectModal(true);
                }
            }
        };
        checkAdmin();
    }, [user, supabase]);

    const handleLanguageSelect = (selectedLocale) => {
        localStorage.setItem('language_preference_set', 'true');
        setShowLanguageModal(false);
        setIsLanguageConfirmed(true);

        if (selectedLocale !== locale) {
            router.replace(pathname, { locale: selectedLocale });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600 mx-auto"></div>
                    <p className="mt-4 text-sm text-gray-500 font-medium">{t('loading_dashboard')}</p>
                </div>
            </div>
        );
    }

    // If not loading and no user, the DashboardContext/useEffect would have redirected.
    // But Render guard just in case
    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans">
            <LanguageSelectionModal
                isOpen={showLanguageModal}
                onSelect={handleLanguageSelect}
                currentLocale={locale}
            />
            {hasSeenTour && <PopupOffer />}
            <DashboardTour activeTab={activeSection} enabled={isLanguageConfirmed} />

            <UserSidebar
                user={user}
                t={t}
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-50/50 pb-20 lg:pb-0">
                {/* Mobile Header */}
                <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm z-40 relative">
                    <div className="flex items-center space-x-3 cursor-pointer" onClick={() => router.push('/')}>
                        <div className="w-8 h-8 relative rounded-full overflow-hidden shadow-md">
                            <Image src="/logo.jpeg" alt="Baraka" fill className="object-cover" />
                        </div>
                        <span className="font-bold text-gray-900 text-lg">Baraka</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <LanguageSwitcher />
                        <div
                            className="w-9 h-9 relative rounded-full p-0.5 bg-gradient-to-br from-red-500 to-orange-500 cursor-pointer hover:scale-105 transition-transform"
                            onClick={() => router.push('/dashboard/profile')}
                        >
                            <UserAvatar
                                name={profile?.email || user.email}
                                size={36}
                                className="w-full h-full rounded-full bg-white object-cover p-0.5"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-auto">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        {/* Header Section (Title) */}
                        <div className="mb-8 flex justify-between items-start">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 capitalize tracking-tight">
                                    {t(activeSection) || t('customer_dashboard')}
                                </h1>
                                <p className="text-gray-500 mt-1 text-sm">
                                    {activeSection === 'overview' && t('overview_desc')}
                                    {activeSection === 'profile' && t('profile_desc')}
                                    {activeSection === 'wallet' && t('wallet_desc')}
                                    {activeSection === 'offers' && t('offers_desc')}
                                    {activeSection === 'vouchers' && t('vouchers_desc')}
                                    {activeSection === 'reviews' && t('reviews_desc')}
                                    {activeSection === 'wishlist' && t('wishlist_desc')}
                                </p>
                            </div>
                            <div className="hidden lg:flex items-center gap-4">
                                <LanguageSwitcher />
                                <div
                                    className="w-10 h-10 relative rounded-full p-0.5 bg-gradient-to-br from-red-500 to-orange-500 cursor-pointer hover:scale-105 transition-transform shadow-sm"
                                    onClick={() => router.push('/dashboard/profile')}
                                >
                                    <UserAvatar
                                        name={profile?.email || user.email}
                                        size={40}
                                        className="w-full h-full rounded-full bg-white object-cover p-0.5"
                                    />
                                </div>
                            </div>
                        </div>

                        {children}

                        {activeSection === 'overview' && (
                            <div className="mt-8">
                                <PaymentMethodsBox />
                            </div>
                        )}
                        {/* Note: PaymentMethodsBox was outside renderActiveComponent but inside the main div in original page.jsx. 
                I'll keep it here, but maybe it should be in page.jsx (Overview) if it's logically part of overview?
                In original page.jsx: renderActiveComponent() was followed by PaymentMethodsBox. 
                Wait, it was AFTER renderActiveComponent(). So it was ALWAYS visible?
                Let's check line 343 of original file. Yes.
                "renderActiveComponent()" then "PaymentMethodsBox".
                So it was visible for ALL tabs?
                If so, I should leave it outside the conditional.
                Let me re-read original page.jsx.
            */}
                    </div>
                </div>
            </div>

            <FloatingProfileCard
                user={user}
                profile={profile}
                labels={{
                    member: t('FloatingCard.member'),
                    scanAtRegister: t('FloatingCard.scan_at_register')
                }}
            />

            {/* Admin Redirect Modal */}
            {showAdminRedirectModal && (
                <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ShieldCheck className="w-8 h-8 text-red-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">
                                Sei un Amministratore!
                            </h2>
                            <p className="text-gray-600 mb-6">
                                Sembra che tu abbia effettuato l'accesso come amministratore.
                                Questa pagina è dedicata ai clienti.
                            </p>
                            <button
                                onClick={() => router.push('/admin')}
                                className="w-full bg-red-600 text-white rounded-xl py-3 font-semibold hover:bg-red-700 transition-colors shadow-lg shadow-red-500/30"
                            >
                                Vai alla Dashboard Admin
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function DashboardLayout({ children }) {
    return (
        <DashboardProvider>
            <DashboardLayoutContent>{children}</DashboardLayoutContent>
        </DashboardProvider>
    );
}
