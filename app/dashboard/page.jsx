// app/dashboard/page.jsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import LoyaltyWallet from '../../components/loyalty/Wallet';
import Profile from '../../components/dashboard/Profile';
import Offers from '../../components/dashboard/Offers';
import Vouchers from '../../components/dashboard/Vouchers';
import Statistics from '../../components/dashboard/Statistics';

export default function DashboardPage() {
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Navigation items for the sidebar
  const navItems = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'wallet', label: 'Loyalty Wallet', icon: '💳' },
    { id: 'offers', label: 'Special Offers', icon: '🎁' },
    { id: 'vouchers', label: 'My Vouchers', icon: '🏷️' },
  ];

  // Render the active component based on the selected tab
  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <>
            <Statistics />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <Profile />
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <LoyaltyWallet />
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-2">
                <Offers />
              </div>
            </div>
          </>
        );
      case 'profile':
        return (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <Profile />
          </div>
        );
      case 'wallet':
        return (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <LoyaltyWallet />
          </div>
        );
      case 'offers':
        return (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <Offers />
          </div>
        );
      case 'vouchers':
        return (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <Vouchers />
          </div>
        );
      default:
        return (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <Profile />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">Customer Dashboard</h1>
          <p className="text-sm text-gray-600 truncate">{user.email}</p>
        </div>

        <nav className="flex-1 px-4 py-6">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === item.id
                      ? 'bg-indigo-100 text-indigo-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => {
              supabase.auth.signOut();
              router.push('/auth/login');
            }}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span>🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 capitalize">{activeTab}</h1>
              <p className="text-gray-600 mt-2">
                {activeTab === 'overview' && 'Welcome back! Here\'s an overview of your account'}
                {activeTab === 'profile' && 'Manage your personal information and preferences'}
                {activeTab === 'wallet' && 'Track your loyalty points and rewards'}
                {activeTab === 'offers' && 'Discover exclusive deals and promotions'}
                {activeTab === 'vouchers' && 'Manage and redeem your vouchers'}
              </p>
            </div>

            {renderActiveComponent()}
          </div>
        </div>
      </div>
    </div>
  );
}