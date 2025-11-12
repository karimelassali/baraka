// components/loyalty/Wallet.jsx
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

export default function LoyaltyWallet() {
  const [points, setPoints] = useState(0);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLoyaltyData = async () => {
      try {
        const response = await fetch('/api/customer/points');
        const data = await response.json();

        if (response.ok) {
          const totalPoints = data.reduce((acc, item) => acc + item.points, 0);
          setPoints(totalPoints);
          setHistory(data);
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

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold">Loyalty Wallet</h2>
      <div className="mt-4">
        <p className="text-lg">Total Points: {points}</p>
      </div>
      <div className="mt-4">
        <h3 className="text-lg font-semibold">Transaction History</h3>
        <ul>
          {history.map((item) => (
            <li key={item.id} className="flex justify-between">
              <span>{item.reason}</span>
              <span>{item.points}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
