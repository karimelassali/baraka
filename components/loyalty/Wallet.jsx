// components/loyalty/Wallet.jsx
"use client";

import { useEffect, useState } from 'react';
import { CreditCard, History, ArrowUpRight, ArrowDownLeft, Wallet } from 'lucide-react';

function Skeleton({ compact }) {
  if (compact) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-20 bg-gray-100 rounded-xl"></div>
        <div className="space-y-2">
          <div className="h-10 bg-gray-100 rounded-lg"></div>
          <div className="h-10 bg-gray-100 rounded-lg"></div>
        </div>
      </div>
    );
  }
  return (
    <div className="p-8 rounded-xl bg-white border border-gray-200 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
      <div className="h-40 bg-gray-100 rounded-xl mb-8"></div>
      <div className="space-y-4">
        <div className="h-16 bg-gray-100 rounded-lg"></div>
        <div className="h-16 bg-gray-100 rounded-lg"></div>
        <div className="h-16 bg-gray-100 rounded-lg"></div>
      </div>
    </div>
  );
}

export default function LoyaltyWallet({ compact = false }) {
  const [points, setPoints] = useState(0);
  const [availablePoints, setAvailablePoints] = useState(0);
  const [pendingPoints, setPendingPoints] = useState(0);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLoyaltyData = async () => {
      try {
        const response = await fetch('/api/customer/points');
        const data = await response.json();

        if (response.ok) {
          setPoints(data.total_points || 0);
          setAvailablePoints(data.available_points || 0);
          setPendingPoints(data.pending_points || 0);
          setHistory(data.points_history || []);
        } else {
          console.error('Failed to fetch loyalty data:', data.error);
        }
      } catch (error) {
        console.error('An error occurred while fetching loyalty data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLoyaltyData();
  }, []);

  if (loading) {
    return <Skeleton compact={compact} />;
  }

  // Get recent transactions (last 5)
  const recentTransactions = history.slice(0, compact ? 3 : 10);

  if (compact) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl p-5 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Wallet className="w-24 h-24" />
          </div>
          <p className="text-indigo-100 text-sm font-medium">Available Balance</p>
          <h3 className="text-3xl font-bold mt-1">{availablePoints.toLocaleString()} <span className="text-lg font-normal opacity-80">pts</span></h3>
          <div className="mt-4 flex items-center text-xs text-indigo-200">
            <span className="bg-indigo-500/30 px-2 py-1 rounded-full border border-indigo-400/30">
              {pendingPoints > 0 ? `${pendingPoints} pending` : 'No pending points'}
            </span>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Recent Activity</h4>
          <div className="space-y-3">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-1">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${item.points > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                      {item.points > 0 ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                        {item.description || item.transaction_type}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm font-semibold ${item.points > 0 ? 'text-green-600' : 'text-gray-900'}`}>
                    {item.points > 0 ? '+' : ''}{item.points}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-2">No recent activity</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Loyalty Wallet</h2>
        <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
          Download Statement
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Card */}
        <div className="md:col-span-2 bg-gradient-to-br from-indigo-900 to-indigo-800 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <CreditCard className="w-64 h-64" />
          </div>

          <div className="relative z-10 flex flex-col justify-between h-full min-h-[200px]">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-indigo-200 font-medium">Total Balance</p>
                <h3 className="text-5xl font-bold mt-2 tracking-tight">{points.toLocaleString()}</h3>
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/10">
                <span className="text-sm font-medium text-indigo-100">Gold Member</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mt-8">
              <div>
                <p className="text-indigo-300 text-sm">Available to Redeem</p>
                <p className="text-2xl font-semibold mt-1">{availablePoints.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-indigo-300 text-sm">Pending Points</p>
                <p className="text-2xl font-semibold mt-1">{pendingPoints.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                <ArrowDownLeft className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Earned this month</p>
                <p className="text-xl font-bold text-gray-900">+1,250</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                <ArrowUpRight className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Spent this month</p>
                <p className="text-xl font-bold text-gray-900">-450</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900 flex items-center">
            <History className="w-5 h-5 mr-2 text-gray-400" />
            Transaction History
          </h3>
          <div className="flex space-x-2">
            <select className="text-sm border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
              <option>All Transactions</option>
              <option>Earned</option>
              <option>Redeemed</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-full mr-3 ${item.points > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                          {item.points > 0 ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{item.description || item.transaction_type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${item.points > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                        {item.points > 0 ? 'Earned' : 'Redeemed'}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold text-right ${item.points > 0 ? 'text-green-600' : 'text-gray-900'
                      }`}>
                      {item.points > 0 ? '+' : ''}{item.points}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {history.length > 10 && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <button className="w-full py-2 text-sm text-indigo-600 font-medium hover:text-indigo-800 transition-colors">
              View All Transactions
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
