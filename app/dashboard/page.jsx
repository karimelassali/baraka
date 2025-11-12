// app/dashboard/page.jsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase/client';
import LoyaltyWallet from '../../components/loyalty/Wallet';
import Profile from '../../components/dashboard/Profile';
import Offers from '../../components/dashboard/Offers';
import Vouchers from '../../components/dashboard/Vouchers';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [supabase, setSupabase] = useState(null);
  const router = useRouter();

  useEffect(() => {
    setSupabase(createSupabaseClient());
  }, []);

  useEffect(() => {
    if (!supabase) return;

    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        router.push('/login');
      } else {
        setUser(data.user);
      }
    };

    fetchUser();
  }, [router, supabase]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Customer Dashboard</h1>
      <p>Welcome, {user.email}!</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <div>
          <Profile />
        </div>
        <div>
          <LoyaltyWallet />
        </div>
        <div>
          <Offers />
        </div>
        <div>
          <Vouchers />
        </div>
      </div>
    </div>
  );
}
