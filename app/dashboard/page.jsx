'use client';

import { useEffect, useState } from 'react';
import Profile from '../../components/dashboard/Profile';
import Wallet from '../../components/loyalty/Wallet';
import Offers from '../../components/dashboard/Offers';
import Vouchers from '../../components/dashboard/Vouchers';

export default function DashboardPage() {
  const [customer, setCustomer] = useState(null);

  useEffect(() => {
    async function fetchCustomer() {
      const response = await fetch('/api/customer/profile');
      const data = await response.json();
      setCustomer(data);
    }
    fetchCustomer();
  }, []);

  if (!customer) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Customer Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Profile customer={customer} />
          <Offers />
        </div>
        <div>
          <Wallet />
          <Vouchers />
        </div>
      </div>
    </div>
  );
}
