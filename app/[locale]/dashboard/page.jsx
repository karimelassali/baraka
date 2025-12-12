"use client";

import { useEffect, useState } from 'react';
import { useRouter } from '@/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  LayoutDashboard,
  User,
  Wallet,
  Gift,
  Ticket,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import LoyaltyWallet from '@/components/loyalty/Wallet';
import Profile from '@/components/dashboard/Profile';
import Offers from '@/components/dashboard/Offers';
import Vouchers from '@/components/dashboard/Vouchers';
import Statistics from '@/components/dashboard/Statistics';
import WishlistRequest from '@/components/dashboard/WishlistRequest';
import { useTranslations } from 'next-intl';
import PopupOffer from '@/components/home/PopupOffer';
import UserSidebar from '@/components/dashboard/UserSidebar';
import PaymentMethodsBox from '@/components/client/PaymentMethodsBox';
import DashboardTour from '@/components/dashboard/DashboardTour';

export default function DashboardPage() {
  const t = useTranslations('Dashboard');
  const [user, setUser] = useState(null);
  const [supabase, setSupabase] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const router = useRouter();

  useEffect(() => {
    setSupabase(createClient());
  }, []);

  useEffect(() => {
    if (!supabase) return;

    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        router.push('/auth/login');
      } else {
        setUser(data.user);
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
    { id: 'wishlist', label: t('wishlist'), icon: Sparkles },
  ];

  // Render the active component based on the selected tab
  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
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
      case 'wishlist':
        return <WishlistRequest user={user} />;
      default:
        return <Profile user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      <PopupOffer />
      <DashboardTour activeTab={activeTab} />

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
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <span className="font-bold text-gray-900 text-lg">Baraka</span>
          </div>
          <div className="w-9 h-9 rounded-full p-0.5 bg-gradient-to-br from-red-500 to-orange-500">
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
              alt="User Avatar"
              className="w-full h-full rounded-full bg-white"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 capitalize tracking-tight">
                {navItems.find(i => i.id === activeTab)?.label || t('customer_dashboard')}
              </h1>
              <p className="text-gray-500 mt-1 text-sm">
                {activeTab === 'overview' && t('overview_desc')}
                {activeTab === 'profile' && t('profile_desc')}
                {activeTab === 'wallet' && t('wallet_desc')}
                {activeTab === 'offers' && t('offers_desc')}
                {activeTab === 'vouchers' && t('vouchers_desc')}
                {activeTab === 'wishlist' && t('wishlist_desc')}
              </p>
            </div>

            {renderActiveComponent()}

            <div className="mt-8">
              <PaymentMethodsBox />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}