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
  LogOut,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import LoyaltyWallet from '@/components/loyalty/Wallet';
import Profile from '@/components/dashboard/Profile';
import Offers from '@/components/dashboard/Offers';
import Vouchers from '@/components/dashboard/Vouchers';
import Statistics from '@/components/dashboard/Statistics';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import PopupOffer from '@/components/home/PopupOffer';

export default function DashboardPage() {
  const t = useTranslations('Dashboard');
  const [user, setUser] = useState(null);
  const [supabase, setSupabase] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
          <p className="mt-4 text-sm text-gray-500 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Navigation items for the sidebar
  const navItems = [
    { id: 'overview', label: t('overview'), icon: LayoutDashboard },
    { id: 'profile', label: t('profile'), icon: User },
    { id: 'wallet', label: t('wallet'), icon: Wallet },
    { id: 'offers', label: t('offers'), icon: Gift },
    { id: 'vouchers', label: t('vouchers'), icon: Ticket },
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
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                  <h3 className="font-semibold text-gray-900">{t('wallet')}</h3>
                </div>
                <div className="p-6">
                  <LoyaltyWallet compact={true} user={user} />
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden lg:col-span-2">
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
      default:
        return <Profile user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      <PopupOffer />
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-100 shadow-2xl lg:shadow-none transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto lg:flex lg:flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo Area */}
        <div className="h-20 flex items-center px-8 border-b border-gray-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-200 transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <span className="text-white font-bold text-2xl">B</span>
            </div>
            <span className="text-2xl font-bold text-gray-900 tracking-tight">Baraka</span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="ml-auto lg:hidden p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* User Profile Section - Redesigned */}
        <div className="p-6 pb-2">
          <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-2xl p-4 flex items-center space-x-4 shadow-sm">
            <div className="relative">
              <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-br from-red-500 to-orange-500">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                  alt="User Avatar"
                  className="w-full h-full rounded-full bg-white"
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
        <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
          <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 mt-2">Menu</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden ${isActive
                  ? 'bg-red-50 text-red-700 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-red-600 rounded-r-full"></div>
                )}
                <Icon className={`h-5 w-5 transition-colors ${isActive ? 'text-red-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                <span className="relative z-10">{item.label}</span>
                {isActive && <ChevronRight className="ml-auto h-4 w-4 text-red-400" />}
              </button>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 space-y-3 bg-gray-50/30">
          <div className="flex justify-center">
            <LanguageSwitcher />
          </div>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.push('/auth/login');
            }}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200 border border-transparent hover:border-red-100 hover:shadow-sm"
          >
            <LogOut className="h-4 w-4" />
            <span>{t('sign_out')}</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-50/50">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm z-40 relative">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="text-gray-500 hover:text-gray-700 p-2 -ml-2 rounded-lg hover:bg-gray-100"
            >
              <Menu className="h-6 w-6" />
            </button>
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
              </p>
            </div>

            {renderActiveComponent()}
          </div>
        </div>
      </div>
    </div>
  );
}