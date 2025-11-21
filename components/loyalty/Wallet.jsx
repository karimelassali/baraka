// components/loyalty/Wallet.jsx
"use client";

import { useEffect, useState } from 'react';

function Skeleton() {
  return (
    <div className="p-8 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
      <div className="h-12 bg-gray-200 rounded w-full mb-6"></div>
      <div className="h-6 bg-gray-200 rounded w-2/3 mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded w-4/5"></div>
      </div>
    </div>
  );
}

export default function LoyaltyWallet() {
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
    return <Skeleton />;
  }

  // Get recent transactions (last 5)
  const recentTransactions = history.slice(0, 5);

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Loyalty Wallet</h2>
      
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white mb-8">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm opacity-80">Total Points</p>
            <p className="text-4xl font-bold">{points}</p>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-80">Available Points</p>
            <p className="text-2xl font-semibold">{availablePoints}</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-indigo-400">
          <div className="flex justify-between">
            <span className="text-sm opacity-80">Pending Points:</span>
            <span className="text-lg font-semibold">{pendingPoints}</span>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
          <span>Recent Activity</span>
          <span className="ml-2 text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">{recentTransactions.length}</span>
        </h3>
        
        {recentTransactions.length > 0 ? (
          <div className="space-y-3">
            {recentTransactions.map((item) => (
              <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div>
                  <p className="font-medium text-gray-800">
                    {item.description || item.transaction_type}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className={`text-lg font-semibold ${item.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {item.points > 0 ? '+' : ''}{item.points}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No recent activity</p>
          </div>
        )}
      </div>
      
      <div className="pt-4">
        <button className="w-full py-3 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition flex items-center justify-center">
          <span>View All Transactions</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}
