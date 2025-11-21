// components/dashboard/Vouchers.jsx
"use client";

import { useEffect, useState } from 'react';

function Skeleton() {
  return (
    <div className="p-8 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
      <div className="space-y-4">
        <div className="h-20 bg-gray-200 rounded w-full"></div>
        <div className="h-20 bg-gray-200 rounded w-full"></div>
        <div className="h-20 bg-gray-200 rounded w-full"></div>
      </div>
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
          // Format the date fields if they're strings
          const formattedVouchers = data.map(voucher => ({
            ...voucher,
            // Convert string dates to Date objects if needed
            expires_at: voucher.expires_at,
            created_at: voucher.created_at
          }));
          setVouchers(formattedVouchers);
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
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">My Vouchers</h2>
        <span className="bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full font-medium">
          {vouchers.filter(v => v.is_active && !v.is_used).length} available
        </span>
      </div>
      
      {vouchers.length > 0 ? (
        <div className="space-y-4">
          {vouchers.map((voucher) => (
            <div 
              key={voucher.id} 
              className={`p-5 rounded-xl border ${
                voucher.is_used 
                  ? 'bg-gray-50 border-gray-200' 
                  : voucher.is_active 
                    ? 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200' 
                    : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center">
                    <h3 className="font-bold text-lg text-gray-800 mr-3">{voucher.code}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      voucher.is_used 
                        ? 'bg-gray-200 text-gray-800' 
                        : voucher.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                    }`}>
                      {voucher.is_used ? 'Used' : voucher.is_active ? 'Active' : 'Expired'}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-indigo-700 mt-1">{voucher.value} {voucher.currency}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Expires: {new Date(voucher.expires_at).toLocaleDateString()}
                  </p>
                </div>
                <button 
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    voucher.is_used || !voucher.is_active
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                  disabled={voucher.is_used || !voucher.is_active}
                >
                  {voucher.is_used ? 'Used' : 'Redeem'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <div className="mx-auto w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No vouchers yet</h3>
          <p className="text-gray-500">Start earning points to unlock exclusive vouchers!</p>
        </div>
      )}
    </div>
  );
}