// app/admin/page.jsx
"use client";

import { useEffect, useState } from 'react';
import { getReviews } from '../../lib/supabase/review';
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
  Search
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import EnhancedStatsCard from '../../components/admin/EnhancedStatsCard';

export default function EnhancedAdminDashboardPage() {
  const [stats, setStats] = useState({
    customers: 0,
    offers: 0,
    reviews: 0,
    vouchers: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

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

        console.log('Customers Data:', customersData);
        console.log('Offers Data:', offersData);
        console.log('Vouchers Data:', vouchersData);
        console.log('Reviews Data:', reviewsData);

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

    fetchStats();
    fetchRecentActivity();
  }, []);

  const statCards = [
    {
      title: "Total Customers",
      value: stats.customers,
      change: "+12.5%",
      icon: Users,
      color: "bg-red-500",
      changeColor: "text-green-500"
    },
    {
      title: "Active Offers",
      value: stats.offers,
      change: "+8.2%",
      icon: Gift,
      color: "bg-red-500",
      changeColor: "text-green-500"
    },
    {
      title: "Pending Reviews",
      value: stats.reviews,
      change: "-3.2%",
      icon: MessageCircle,
      color: "bg-red-500",
      changeColor: "text-red-500"
    },
    {
      title: "Issued Vouchers",
      value: stats.vouchers,
      change: "+24.7%",
      icon: Ticket,
      color: "bg-red-500",
      changeColor: "text-green-500"
    }
  ];

  return (
    <div className="space-y-6">
      <motion.header 
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, Admin!</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 bg-card border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <button className="p-2 bg-card border border-input rounded-lg hover:bg-accent transition-colors">
            <Filter className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </motion.header>

      {/* Stats Grid */}
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {statCards.map((stat, index) => (
          <EnhancedStatsCard 
            key={stat.title}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            icon={stat.icon}
            color={stat.color}
            changeColor={stat.changeColor}
            loading={loading}
            index={index}
          />
        ))}
      </motion.div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Activity</CardTitle>
              <Activity className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-muted rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : recentActivity.length > 0 ? (
                <ul className="space-y-4">
                  {recentActivity.map((activity) => (
                    <li key={activity.id} className="flex items-start space-x-4 p-2 hover:bg-accent rounded-lg transition-colors">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <MessageCircle className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{activity.message_content}</p>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <span>To: {activity.phone_number || 'N/A'}</span>
                          <span className="mx-2">•</span>
                          <span>{new Date(activity.sent_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center py-8 text-muted-foreground">No recent activity to display.</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Performance Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Performance</CardTitle>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="bg-primary/10 w-40 h-40 rounded-full flex items-center justify-center mx-auto">
                    <TrendingUp className="h-16 w-16 text-primary" />
                  </div>
                  <p className="mt-4 font-medium">Performance Metrics</p>
                  <p className="text-sm text-muted-foreground">Data visualization coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({ title, value, change, icon, color, changeColor, loading, index }) {
  const Icon = icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -5 }}
    >
      <Card className="overflow-hidden h-full">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              {loading ? (
                <div className="h-10 w-24 bg-muted rounded mt-2 animate-pulse"></div>
              ) : (
                <p className="text-3xl font-bold mt-1">{value}</p>
              )}
            </div>
            <div className={`p-3 rounded-lg ${color} text-white`}>
              <Icon className="h-6 w-6" />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <TrendingUp className={`h-4 w-4 ${changeColor}`} />
            <span className={`text-sm font-medium ml-1 ${changeColor}`}>
              {change}
            </span>
            <span className="text-xs text-muted-foreground ml-1">from last month</span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}