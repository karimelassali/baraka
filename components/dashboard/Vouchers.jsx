// components/dashboard/Vouchers.jsx
"use client";

import { useEffect, useState } from 'react';
import { Ticket, Clock, CheckCircle, XCircle, Copy } from 'lucide-react';

function Skeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[1, 2].map((i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse h-48">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-12 bg-gray-200 rounded w-full mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      ))}
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
          const formattedVouchers = data.map(voucher => ({
            ...voucher,
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
        <h2 className="text-2xl font-bold text-gray-900">My Vouchers</h2>
        <span className="bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full font-medium">
          {vouchers.filter(v => v.is_active && !v.is_used).length} available
        </span>
      </div>

      {vouchers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {vouchers.map((voucher) => (
            <div
              key={voucher.id}
              className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 ${voucher.is_used
                  ? 'bg-gray-50 border-gray-200 opacity-75'
                  : voucher.is_active
                    ? 'bg-white border-indigo-100 hover:border-indigo-300 hover:shadow-md'
                    : 'bg-gray-50 border-gray-200 opacity-60'
                }`}
            >
              {/* Ticket Perforation Effect */}
              <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-gray-50 rounded-full border-r border-gray-200"></div>
              <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-gray-50 rounded-full border-l border-gray-200"></div>

              <div className="p-6 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-2">
                    <div className={`p-2 rounded-lg ${voucher.is_used ? 'bg-gray-200' : 'bg-indigo-100 text-indigo-600'
                      }`}>
                      <Ticket className="w-5 h-5" />
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${voucher.is_used
                        ? 'bg-gray-200 text-gray-600'
                        : voucher.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                      {voucher.is_used ? 'Used' : voucher.is_active ? 'Active' : 'Expired'}
                    </span>
                  </div>

                  {voucher.is_used && <CheckCircle className="w-6 h-6 text-gray-400" />}
                  {!voucher.is_active && !voucher.is_used && <XCircle className="w-6 h-6 text-red-300" />}
                </div>

                <div className="mb-6 text-center">
                  <p className="text-sm text-gray-500 uppercase tracking-wider font-medium">Value</p>
                  <p className="text-4xl font-bold text-gray-900 mt-1">
                    {voucher.value} <span className="text-xl text-gray-500 font-normal">{voucher.currency}</span>
                  </p>
                </div>

                <div className="mt-auto space-y-4">
                  <div className="bg-gray-50 p-3 rounded-lg flex justify-between items-center border border-gray-100 border-dashed">
                    <code className="text-lg font-mono font-bold text-gray-700">{voucher.code}</code>
                    <button
                      className="text-gray-400 hover:text-indigo-600 transition-colors"
                      title="Copy Code"
                      onClick={() => navigator.clipboard.writeText(voucher.code)}
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-500 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      Expires: {new Date(voucher.expires_at).toLocaleDateString()}
                    </div>

                    <button
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${voucher.is_used || !voucher.is_active
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm hover:shadow'
                        }`}
                      disabled={voucher.is_used || !voucher.is_active}
                    >
                      {voucher.is_used ? 'Redeemed' : 'Redeem Now'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200 border-dashed">
          <div className="mx-auto w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
            <Ticket className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No vouchers yet</h3>
          <p className="text-gray-500 text-sm">Start earning points to unlock exclusive vouchers!</p>
        </div>
      )}
    </div>
  );
}