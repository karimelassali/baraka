// components/dashboard/Statistics.jsx
import { useEffect, useState } from 'react';

export default function Statistics() {
  const [stats, setStats] = useState({
    totalPoints: 0,
    availableVouchers: 0,
    activeOffers: 0,
    totalVouchers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch loyalty points
        const pointsResponse = await fetch('/api/customer/points');
        const pointsData = await pointsResponse.json();
        
        // Fetch vouchers
        const vouchersResponse = await fetch('/api/customer/vouchers');
        const vouchersData = await vouchersResponse.json();
        
        // Fetch offers
        const offersResponse = await fetch('/api/offers');
        const offersData = await offersResponse.json();

        if (pointsResponse.ok && vouchersResponse.ok && offersResponse.ok) {
          setStats({
            totalPoints: pointsData.total_points || 0,
            availableVouchers: vouchersData.filter(v => v.is_active && !v.is_used).length || 0,
            activeOffers: offersData.offers?.filter(offer => {
              const now = new Date();
              const startDate = new Date(offer.start_date);
              const endDate = new Date(offer.end_date);
              return now >= startDate && now <= endDate;
            }).length || 0,
            totalVouchers: vouchersData.length || 0
          });
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Total Points",
      value: stats.totalPoints,
      icon: "⭐",
      color: "bg-yellow-100 text-yellow-600",
      change: "+12% from last month"
    },
    {
      title: "Available Vouchers",
      value: stats.availableVouchers,
      icon: "🏷️",
      color: "bg-purple-100 text-purple-600",
      change: "+5 this month"
    },
    {
      title: "Active Offers",
      value: stats.activeOffers,
      icon: "🎁",
      color: "bg-green-100 text-green-600",
      change: "3 new offers"
    },
    {
      title: "Total Vouchers",
      value: stats.totalVouchers,
      icon: "💳",
      color: "bg-blue-100 text-blue-600",
      change: "Lifetime rewards"
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((_, index) => (
          <div key={index} className="bg-white rounded-xl shadow p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-10 bg-gray-200 rounded w-1/2 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat, index) => (
        <div key={index} className="bg-white rounded-xl shadow p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
              <p className="text-gray-400 text-xs mt-2">{stat.change}</p>
            </div>
            <div className={`w-14 h-14 rounded-full ${stat.color} flex items-center justify-center text-2xl`}>
              {stat.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}