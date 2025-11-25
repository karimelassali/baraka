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
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div>
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
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center"
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
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-auto lg:flex lg:flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">B</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Baraka</span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="ml-auto lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-4 border-b border-gray-200 bg-gray-50/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
              {user.email?.[0].toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-gray-900 truncate">Welcome back</p>
              <p className="text-xs text-gray-500 truncate" title={user.email}>{user.email}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
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
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                <span>{item.label}</span>
                {isActive && <ChevronRight className="ml-auto h-4 w-4 text-indigo-400" />}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 space-y-4">
          <div className="flex justify-center">
            <LanguageSwitcher />
          </div>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.push('/auth/login');
            }}
            className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>{t('sign_out')}</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="text-gray-500 hover:text-gray-700 p-1 -ml-1"
            >
              <Menu className="h-6 w-6" />
            </button>
            <span className="font-semibold text-gray-900">{t('customer_dashboard')}</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
            {user.email?.[0].toUpperCase()}
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-gray-50">
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