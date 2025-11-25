// components/dashboard/Statistics.jsx
import { useEffect, useState } from 'react';
import { Star, Ticket, Gift, CreditCard, TrendingUp, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function Statistics() {
  const t = useTranslations('Dashboard.Statistics');
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
      title: t('total_points'),
      value: stats.totalPoints.toLocaleString(),
      icon: Star,
      color: "text-amber-500",
      bgColor: "bg-amber-50",
      change: `+12% ${t('from_last_month')}`
    },
    {
      title: t('available_vouchers'),
      value: stats.availableVouchers,
      icon: Ticket,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      change: `+5 ${t('this_month')}`
    },
    {
      title: t('active_offers'),
      value: stats.activeOffers,
      icon: Gift,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      change: `3 ${t('new_offers')}`
    },
    {
      title: t('total_vouchers'),
      value: stats.totalVouchers,
      icon: CreditCard,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      change: t('lifetime_rewards')
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((_, index) => (
          <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-3"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600 font-medium">{stat.change}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}