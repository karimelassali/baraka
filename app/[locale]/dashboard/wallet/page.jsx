"use client";

import { useDashboard } from '@/components/dashboard/DashboardContext';
import LoyaltyWallet from '@/components/loyalty/Wallet';

export default function WalletPage() {
  const { user } = useDashboard();

  if (!user) return null;

  return <LoyaltyWallet user={user} />;
}
