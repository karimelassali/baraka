// app/admin/page.jsx
"use client";

import { useEffect, useState } from 'react';
import { getReviews } from '../../../lib/supabase/review';
import { motion } from 'framer-motion';
import {
  Users,
  Gift,
  MessageCircle,
  Ticket,
  Activity,
  TrendingUp,
  Calendar,
  Filter,
  Search,
  Bell,
  ShoppingCart
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import EnhancedStatsCard from '../../../components/admin/EnhancedStatsCard';
import GlassCard from '../../../components/ui/GlassCard';
import ExpirationAlerts from '../../../components/admin/ExpirationAlerts';
import NotificationCenter from '../../../components/admin/NotificationCenter';
import DBPerformanceTest from '../../../components/admin/DBPerformanceTest';
import { useTranslations } from 'next-intl';

export default function EnhancedAdminDashboardPage() {
  const t = useTranslations('Admin.Dashboard');
  const [stats, setStats] = useState({
    customers: 0,
    offers: 0,
    reviews: 0,
    vouchers: 0,
  });
  const [trends, setTrends] = useState({
    customers: 0,
    offers: 0,
    reviews: 0,
    vouchers: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [expiringData, setExpiringData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingExpiring, setLoadingExpiring] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/analytics/overview?range=30d');
        const data = await response.json();

        if (response.ok) {
          setStats({
            customers: data.totalCustomers || 0,
            offers: data.activeOffers || 0,
            reviews: data.pendingReviews || 0,
            vouchers: data.totalVouchers || 0,
          });
          setTrends({
            customers: data.trends?.customers || 0,
            offers: data.trends?.offers || 0,
            reviews: data.trends?.reviews || 0,
            vouchers: data.trends?.vouchers || 0,
          });
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    const fetchRecentActivity = async () => {
      try {
        const response = await fetch('/api/admin/messages');
        const data = await response.json();
        if (response.ok) {
          setRecentActivity(data.slice(0, 5)); // Get latest 5 activities
        } else {
          console.error('Failed to fetch recent activity:', data.error);
        }
      } catch (error) {
        console.error('An error occurred while fetching recent activity:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchExpiringProducts = async () => {
      try {
        setLoadingExpiring(true);
        const response = await fetch('/api/admin/inventory/expiring');
        const data = await response.json();

        if (response.ok) {
          setExpiringData(data);
        } else {
          console.error('Failed to fetch expiring products:', data.error);
        }
      } catch (error) {
        console.error('Error fetching expiring products:', error);
      } finally {
        setLoadingExpiring(false);
      }
    };

    fetchStats();
    fetchRecentActivity();
    fetchExpiringProducts();
  }, []);

  const handleRefreshExpiring = async () => {
    try {
      const response = await fetch('/api/admin/inventory/expiring');
      const data = await response.json();

      if (response.ok) {
        setExpiringData(data);
      }
    } catch (error) {
      console.error('Error refreshing expiring products:', error);
    }
  };

  const formatTrend = (value) => {
    const num = Number(value);
    const sign = num >= 0 ? '+' : '';
    return `${sign}${num.toFixed(1)}%`;
  };

  const statCards = [
    {
      title: t('total_customers'),
      value: stats.customers,
      change: formatTrend(trends.customers),
      icon: Users,
      color: "bg-blue-500",
      changeColor: trends.customers >= 0 ? "text-green-500" : "text-red-500"
    },
    {
      title: t('active_offers'),
      value: stats.offers,
      change: formatTrend(trends.offers),
      icon: Gift,
      color: "bg-purple-500",
      changeColor: trends.offers >= 0 ? "text-green-500" : "text-red-500"
    },
    {
      title: t('pending_reviews'),
      value: stats.reviews,
      change: formatTrend(trends.reviews),
      icon: MessageCircle,
      color: "bg-yellow-500",
      changeColor: trends.reviews >= 0 ? "text-green-500" : "text-red-500"
    },
    {
      title: t('issued_vouchers'),
      value: stats.vouchers,
      change: formatTrend(trends.vouchers),
      icon: Ticket,
      color: "bg-green-500",
      changeColor: trends.vouchers >= 0 ? "text-green-500" : "text-red-500"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Section */}
      <motion.header
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
            {t('title')}
          </h1>
          <p className="text-muted-foreground">{t('welcome')}</p>
        </div>

        <div className="flex items-center gap-3">
          <NotificationCenter />
        </div>
      </motion.header>

      {/* Expiration Alerts */}
      {!loadingExpiring && expiringData && expiringData.total_alerts > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
        >
          <ExpirationAlerts
            data={expiringData}
            onRefresh={handleRefreshExpiring}
          />
        </motion.div>
      )}

      {/* Stats Grid */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {statCards.map((stat, index) => (
          <EnhancedStatsCard
            key={stat.title}
            {...stat}
            loading={loading}
            index={index}
          />
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        {/* Activity Feed */}
        <div className="lg:col-span-2">
          <GlassCard className="h-full">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">{t('recent_activity')}</h2>
                <p className="text-sm text-muted-foreground">{t('recent_activity_desc')}</p>
              </div>
              <button className="text-sm text-primary hover:underline">{t('view_all')}</button>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-muted/50 rounded-xl animate-pulse"></div>
                ))}
              </div>
            ) : recentActivity.length > 0 ? (
              <ul className="space-y-4">
                {recentActivity.map((activity, i) => (
                  <motion.li
                    key={activity.id}
                    className="flex items-start space-x-4 p-3 hover:bg-white/5 rounded-xl transition-colors group"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className="bg-primary/10 p-2.5 rounded-xl group-hover:bg-primary/20 transition-colors">
                      {activity.type === 'message' ? (
                        <MessageCircle className="h-5 w-5 text-primary" />
                      ) : activity.type === 'customer' ? (
                        <Users className="h-5 w-5 text-blue-500" />
                      ) : activity.type === 'order' ? (
                        <ShoppingCart className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <Activity className="h-5 w-5 text-yellow-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{activity.content}</p>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <span className="font-medium text-foreground/80">{activity.user}</span>
                        <span className="mx-2">•</span>
                        <span>{new Date(activity.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Activity className="h-12 w-12 mb-4 opacity-20" />
                <p>{t('no_activity')}</p>
              </div>
            )}
          </GlassCard>
        </div>

        {/* Performance / Quick Actions */}
        <div className="space-y-8">
          <DBPerformanceTest />

        </div>
      </motion.div>
    </div>
  );
}