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
  const [recentActivity, setRecentActivity] = useState([]);
  const [expiringData, setExpiringData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingExpiring, setLoadingExpiring] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [customersRes, offersRes, vouchersRes, reviewsData] = await Promise.all([
          fetch('/api/admin/customers'),
          fetch('/api/admin/offers'),
          fetch('/api/admin/vouchers'),
          getReviews(),
        ]);

        const customersData = await customersRes.json();
        const offersData = await offersRes.json();
        const vouchersData = await vouchersRes.json();

        setStats({
          customers: customersData.total || 0,
          offers: offersData.length || 0,
          reviews: reviewsData.filter(r => !r.approved).length || 0,
          vouchers: vouchersData.length || 0,
        });
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

  const statCards = [
    {
      title: t('total_customers'),
      value: stats.customers,
      change: "+12.5%",
      icon: Users,
      color: "bg-blue-500",
      changeColor: "text-green-500"
    },
    {
      title: t('active_offers'),
      value: stats.offers,
      change: "+8.2%",
      icon: Gift,
      color: "bg-purple-500",
      changeColor: "text-green-500"
    },
    {
      title: t('pending_reviews'),
      value: stats.reviews,
      change: "-3.2%",
      icon: MessageCircle,
      color: "bg-yellow-500",
      changeColor: "text-red-500"
    },
    {
      title: t('issued_vouchers'),
      value: stats.vouchers,
      change: "+24.7%",
      icon: Ticket,
      color: "bg-green-500",
      changeColor: "text-green-500"
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
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Section */}
      <motion.header
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        variants={itemVariants}
      >
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
            {t('title')}
          </h1>
          <p className="text-muted-foreground mt-1">{t('welcome')}</p>
        </div>

        <div className="flex items-center gap-3">
          <NotificationCenter />
        </div>
      </motion.header>

      {/* Expiration Alerts */}
      {!loadingExpiring && expiringData && expiringData.total_alerts > 0 && (
        <motion.div variants={itemVariants}>
          <ExpirationAlerts
            data={expiringData}
            onRefresh={handleRefreshExpiring}
          />
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <EnhancedStatsCard
            key={stat.title}
            {...stat}
            loading={loading}
            index={index}
          />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Feed */}
        <motion.div className="lg:col-span-2" variants={itemVariants}>
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
        </motion.div>

        {/* Performance / Quick Actions */}
        <motion.div className="space-y-8" variants={itemVariants}>
          <DBPerformanceTest />

        </motion.div>
      </div>
    </motion.div>
  );
}