'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import LoyaltyWallet from '@/components/loyalty/Wallet';

export default function WalletPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const supabase = createClient();
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Loyalty Wallet</h1>
      <LoyaltyWallet user={user} />
    </div>
  );
}
