// components/dashboard/Statistics.jsx
import { useEffect, useState } from 'react';
import { Star, Ticket, Gift, CreditCard, TrendingUp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

export default function Statistics() {
  const t = useTranslations('Dashboard.Statistics');
  const [stats, setStats] = useState({
    totalPoints: 0,
    availableVouchers: 0,
    activeOffers: 0,
    totalVouchers: 0,
    pointsTrend: ''
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
          // Calculate points trend
          const currentMonth = new Date().getMonth();
          const pointsHistory = pointsData.points_history || [];

          const pointsThisMonth = pointsHistory
            .filter(p => new Date(p.created_at).getMonth() === currentMonth && p.points > 0)
            .reduce((acc, curr) => acc + curr.points, 0);

          const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
          const pointsLastMonth = pointsHistory
            .filter(p => new Date(p.created_at).getMonth() === lastMonth && p.points > 0)
            .reduce((acc, curr) => acc + curr.points, 0);

          let trendLabel = t('from_last_month');

          if (pointsLastMonth > 0) {
            const pointsTrend = Math.round(((pointsThisMonth - pointsLastMonth) / pointsLastMonth) * 100);
            trendLabel = pointsTrend >= 0 ? `+${pointsTrend}% ${t('from_last_month')}` : `${pointsTrend}% ${t('from_last_month')}`;
          } else if (pointsThisMonth > 0) {
            trendLabel = `+${pointsThisMonth} ${t('this_month')}`;
          } else {
            trendLabel = t('no_change');
          }

          setStats({
            totalPoints: pointsData.total_points || 0,
            availableVouchers: vouchersData.filter(v => v.is_active && !v.is_used).length || 0,
            activeOffers: offersData.offers?.filter(offer => {
              const now = new Date();
              const startDate = new Date(offer.start_date);
              const endDate = new Date(offer.end_date);
              return now >= startDate && now <= endDate;
            }).length || 0,
            totalVouchers: vouchersData.length || 0,
            pointsTrend: trendLabel
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
      change: stats.pointsTrend || t('no_change')
    },
    {
      title: t('available_vouchers'),
      value: stats.availableVouchers,
      icon: Ticket,
      color: "text-red-600",
      bgColor: "bg-red-50",
      change: `+5 ${t('this_month')}`
    },
    {
      title: t('active_offers'),
      value: stats.activeOffers,
      icon: Gift,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      change: t('active')
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, staggerChildren: 0.1 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
    >
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all duration-300 relative overflow-hidden group"
          >
            <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-300`}>
              <Icon className={`h-24 w-24 ${stat.color}`} />
            </div>

            <div className="relative z-10 flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2 tracking-tight">{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-xl ${stat.bgColor} shadow-inner`}>
                <Icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
            <div className="relative z-10 mt-4 flex items-center text-sm">
              <div className="flex items-center text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span className="font-medium text-xs">{stat.change}</span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}