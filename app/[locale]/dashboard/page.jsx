"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import LoyaltyWallet from '../../../components/loyalty/Wallet';
import Profile from '../../../components/dashboard/Profile';
import Offers from '../../../components/dashboard/Offers';
import Vouchers from '../../../components/dashboard/Vouchers';
import Statistics from '../../../components/dashboard/Statistics';

import { useTranslations } from 'next-intl';
import LanguageSwitcher from '../../../components/LanguageSwitcher';

export default function DashboardPage() {
  const t = useTranslations('Dashboard');
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/login');
          return;
        }
        setUser(session.user);
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [router, supabase]);

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'overview':
        return <Statistics user={user} />;
      case 'profile':
        return <Profile user={user} />;
      case 'wallet':
        return <LoyaltyWallet user={user} />;
      case 'offers':
        return <Offers user={user} />;
      case 'vouchers':
        return <Vouchers user={user} />;
      default:
        return <Statistics user={user} />;
    }
  };

  // Navigation items for the sidebar
  const navItems = [
    { id: 'overview', label: t('overview'), icon: '📊' },
    { id: 'profile', label: t('profile'), icon: '👤' },
    { id: 'wallet', label: t('wallet'), icon: '💳' },
    { id: 'offers', label: t('offers'), icon: '🎁' },
    { id: 'vouchers', label: t('vouchers'), icon: '🏷️' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg flex flex-col fixed h-full z-10">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">{t('customer_dashboard')}</h1>
          <p className="text-sm text-gray-600 truncate mt-1" title={user.email}>{user.email}</p>
        </div>

        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === item.id
                    ? 'bg-indigo-50 text-indigo-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200 space-y-4 bg-gray-50">
          <div className="flex justify-center">
            <LanguageSwitcher />
          </div>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.push('/login');
            }}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
          >
            <span>🚪</span>
            <span>{t('sign_out')}</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 capitalize">{navItems.find(i => i.id === activeTab)?.label || activeTab}</h1>
            <p className="text-gray-600 mt-2">
              {activeTab === 'overview' && t('overview_desc') || 'Welcome back! Here\'s an overview of your account'}
              {activeTab === 'profile' && t('profile_desc') || 'Manage your personal information and preferences'}
              {activeTab === 'wallet' && t('wallet_desc') || 'Track your loyalty points and rewards'}
              {activeTab === 'offers' && t('offers_desc') || 'Discover exclusive deals and promotions'}
              {activeTab === 'vouchers' && t('vouchers_desc') || 'Manage and redeem your vouchers'}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 min-h-[500px] p-6">
            {renderActiveComponent()}
          </div>
        </div>
      </div>
    </div>
  );
}