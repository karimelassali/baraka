"use client";

import { useEffect, useState } from 'react';
import { useDashboard } from '@/components/dashboard/DashboardContext';
import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import {
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';

import LoyaltyWallet from '@/components/loyalty/Wallet';
import Profile from '@/components/dashboard/Profile';
import Offers from '@/components/dashboard/Offers';
import Statistics from '@/components/dashboard/Statistics';

const GREETINGS = [
  "Good for you!",
  "Great deal!",
  "Welcome back!",
  "Ottimo affare!",
  "Buon per te!",
  "Bentornato!",
  "Bonne affaire!",
  "C'est super!",
  "Bienvenue!"
];

export default function DashboardOverview() {
  const { user, profile } = useDashboard();
  const t = useTranslations('Dashboard');
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    // Pick a random greeting on mount
    const randomGreeting = GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
    setGreeting(randomGreeting);
  }, []);

  if (!user) return null; // Should be handled by layout/context

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-lg">
          <h2 className="text-2xl font-bold mb-2">
            {t('welcome_back')}, {profile?.first_name || user.user_metadata?.first_name || user.email?.split('@')[0] || 'User'}!
          </h2>
          <p className="text-red-100 mb-4 text-lg font-medium">
            {greeting || t('welcome_message') || "Check your latest stats and offers."}
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
            <Link
              href="/dashboard/offers"
              className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center transition-colors"
            >
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
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
            <Link
              href="/dashboard/reviews"
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors shadow-md"
            >
              {t('Reviews.title') || 'Go to Reviews'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}