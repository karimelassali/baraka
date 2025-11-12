// components/dashboard/Vouchers.jsx
"use client";

import { useEffect, useState } from 'react';

function Skeleton() {
  return (
    <div className="p-4 border rounded-lg animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
    </div>
  );
}

export default function Vouchers() {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const response = await fetch('/api/customer/vouchers');
        const data = await response.json();

        if (response.ok) {
          setVouchers(data);
        } else {
          console.error('Failed to fetch vouchers:', data.error);
        }
      } catch (error) {
        console.error('An error occurred while fetching vouchers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVouchers();
  }, []);

  if (loading) {
    return <Skeleton />;
  }

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold">Your Vouchers</h2>
      <div className="mt-4">
        {vouchers.length > 0 ? (
          <ul>
            {vouchers.map((voucher) => (
              <li key={voucher.id}>
                <strong>{voucher.code}</strong>: {voucher.value} {voucher.currency}
              </li>
            ))}
          </ul>
        ) : (
          <p>No vouchers available at the moment.</p>
        )}
      </div>
    </div>
  );
}
