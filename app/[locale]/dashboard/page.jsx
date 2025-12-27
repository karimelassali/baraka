"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from '@/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  LayoutDashboard,
  User,
  Wallet,
  Gift,
  Ticket,
  ChevronRight,
  Sparkles,
  MessageSquare,
  AlertTriangle
} from 'lucide-react';
import { Link } from '@/navigation';
import LoyaltyWallet from '@/components/loyalty/Wallet';
import Profile from '@/components/dashboard/Profile';
import Offers from '@/components/dashboard/Offers';
import Vouchers from '@/components/dashboard/Vouchers';
import Reviews from '@/components/dashboard/Reviews';
import Statistics from '@/components/dashboard/Statistics';
import WishlistRequest from '@/components/dashboard/WishlistRequest';
import { useTranslations } from 'next-intl';
import PopupOffer from '@/components/home/PopupOffer';
import UserSidebar from '@/components/dashboard/UserSidebar';
import PaymentMethodsBox from '@/components/client/PaymentMethodsBox';
import DashboardTour from '@/components/dashboard/DashboardTour';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import { getAvatarUrl } from '@/lib/avatar';
import Image from 'next/image';
import UserAvatar from '@/components/ui/UserAvatar';

import LanguageSelectionModal from '@/components/dashboard/LanguageSelectionModal';
import { useLocale } from 'next-intl';
import dynamic from 'next/dynamic';

const FloatingProfileCard = dynamic(() => import('@/components/dashboard/FloatingProfileCard'), {
  ssr: false,
});

export default function DashboardPage() {
  const t = useTranslations('Dashboard');
  const locale = useLocale();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [supabase, setSupabase] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [hasSeenTour, setHasSeenTour] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [isLanguageConfirmed, setIsLanguageConfirmed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setSupabase(createClient());

    // Check if user has seen the tour
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

  const handleLanguageSelect = (selectedLocale) => {
    localStorage.setItem('language_preference_set', 'true');
    setShowLanguageModal(false);
    setIsLanguageConfirmed(true);

    if (selectedLocale !== locale) {
      // If language changed, redirect
      router.replace('/dashboard', { locale: selectedLocale });
    }
  };

  useEffect(() => {
    if (!supabase) return;

    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        router.push('/auth/login');
      } else {
        setUser(data.user);
        // Fetch profile data
        const { data: profileData } = await supabase
          .from('customers')
          .select('first_name, last_name, barcode_value')
          .eq('auth_id', data.user.id)
          .single();

        if (profileData) {
          setProfile(profileData);
        }
      }
    };

    fetchUser();
  }, [router, supabase]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-sm text-gray-500 font-medium">{t('loading_dashboard')}</p>
        </div>
      </div>
    );
  }

  // Navigation items for the sidebar (kept for title resolution)
  const navItems = [
    { id: 'overview', label: t('overview'), icon: LayoutDashboard },
    { id: 'profile', label: t('profile'), icon: User },
    { id: 'wallet', label: t('wallet'), icon: Wallet },
    { id: 'offers', label: t('offers'), icon: Gift },
    { id: 'vouchers', label: t('vouchers'), icon: Ticket },
    { id: 'reviews', label: t('reviews'), icon: MessageSquare },
    { id: 'wishlist', label: t('wishlist'), icon: Sparkles },
  ];

  // Render the active component based on the selected tab
  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
              <div className="relative z-10 max-w-lg">
                <h2 className="text-2xl font-bold mb-2">
                  {t('welcome_back')}, {profile?.first_name || user.user_metadata?.first_name || user.email?.split('@')[0] || 'User'}!
                </h2>
                <p className="text-red-100 mb-4">
                  {t('welcome_message') || "Check your latest stats and offers."}
                </p>
              </div>
              <div className="absolute right-0 bottom-0 w-64 h-64 transform translate-x-10 translate-y-10 opacity-20 pointer-events-none">
                <img
                  src="/illus/undraw_a-moment-to-relax_mrkn.svg"
                  alt="Welcome"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Security Alert */}
            {user.user_metadata?.force_password_change && (
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl shadow-sm mb-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="ml-3 flex-1 md:flex md:justify-between">
                    <p className="text-sm text-amber-800">
                      <span className="font-bold block mb-1">Avviso di Sicurezza</span>
                      Stai utilizzando una password temporanea. Ti consigliamo di cambiarla per maggiore sicurezza.
                    </p>
                    <p className="mt-3 text-sm md:mt-0 md:ml-6">
                      <Link
                        href="/auth/update-password"
                        className="whitespace-nowrap font-medium text-amber-700 hover:text-amber-600 bg-amber-100 px-4 py-2 rounded-lg hover:bg-amber-200 transition-colors"
                      >
                        Cambia Password &rarr;
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Statistics user={user} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                  <h3 className="font-semibold text-gray-900">{t('profile')}</h3>
                </div>
                <div className="p-6">
                  <Profile compact={true} user={user} />
                </div>
              </div>
              <div id="dashboard-wallet-card" className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                  <h3 className="font-semibold text-gray-900">{t('wallet')}</h3>
                </div>
                <div className="p-6">
                  <LoyaltyWallet compact={true} user={user} />
                </div>
              </div>
              <div id="dashboard-offers-card" className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden lg:col-span-2">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-900">{t('offers')}</h3>
                  <button
                    onClick={() => setActiveTab('offers')}
                    className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center transition-colors"
                  >
                    View All <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
                <div className="p-6">
                  <Offers limit={3} user={user} />
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden lg:col-span-2">
                <div className="p-6 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{t('reviews')}</h3>
                    <p className="text-gray-500 text-sm mt-1">{t('reviews_desc')}</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors shadow-md"
                  >
                    {t('Reviews.title') || 'Go to Reviews'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'profile':
        return <Profile user={user} />;
      case 'wallet':
        return <LoyaltyWallet user={user} />;
      case 'offers':
        return <Offers user={user} />;
      case 'vouchers':
        return <Vouchers user={user} />;
      case 'reviews':
        return <Reviews user={user} />;
      case 'wishlist':
        return <WishlistRequest user={user} />;
      default:
        return <Profile user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      <LanguageSelectionModal
        isOpen={showLanguageModal}
        onSelect={handleLanguageSelect}
        currentLocale={locale}
      />
      {hasSeenTour && <PopupOffer />}
      <DashboardTour activeTab={activeTab} enabled={isLanguageConfirmed} />

      <UserSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
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
              onClick={() => setActiveTab('profile')}
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
            <div className="mb-8 flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 capitalize tracking-tight">
                  {navItems.find(i => i.id === activeTab)?.label || t('customer_dashboard')}
                </h1>
                <p className="text-gray-500 mt-1 text-sm">
                  {activeTab === 'overview' && t('overview_desc')}
                  {activeTab === 'profile' && t('profile_desc')}
                  {activeTab === 'wallet' && t('wallet_desc')}
                  {activeTab === 'offers' && t('offers_desc')}
                  {activeTab === 'vouchers' && t('vouchers_desc')}
                  {activeTab === 'reviews' && t('reviews_desc')}
                  {activeTab === 'wishlist' && t('wishlist_desc')}
                </p>
              </div>
              <div className="hidden lg:flex items-center gap-4">
                <LanguageSwitcher />
                <div
                  className="w-10 h-10 relative rounded-full p-0.5 bg-gradient-to-br from-red-500 to-orange-500 cursor-pointer hover:scale-105 transition-transform shadow-sm"
                  onClick={() => setActiveTab('profile')}
                >
                  <UserAvatar
                    name={profile?.email || user.email}
                    size={40}
                    className="w-full h-full rounded-full bg-white object-cover p-0.5"
                  />
                </div>
              </div>
            </div>

            {renderActiveComponent()}

            <div className="mt-8">
              <PaymentMethodsBox />
            </div>
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
    </div>
  );
}