// app/admin/page.jsx
"use client";

import { useEffect, useState } from 'react';
import { getReviews } from '../../lib/supabase/review';

export default function AdminDashboardPage() {
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

  return (
    <div>
      <header className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-lg text-gray-600 mt-1">Welcome back, Admin!</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard title="Total Customers" value={stats.customers} icon={<UsersIcon />} color="blue" loading={loading} />
        <StatCard title="Active Offers" value={stats.offers} icon={<GiftIcon />} color="green" loading={loading} />
        <StatCard title="Pending Reviews" value={stats.reviews} icon={<ChatBubbleIcon />} color="yellow" loading={loading} />
        <StatCard title="Issued Vouchers" value={stats.vouchers} icon={<TicketIcon />} color="purple" loading={loading} />
      </div>

      <div className="mt-12 bg-white p-8 rounded-xl shadow-md">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Recent Activity</h2>
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : recentActivity.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {recentActivity.map((activity) => (
              <li key={activity.id} className="py-4 flex items-center justify-between">
                <div>
                  <p className="text-md font-medium text-gray-800">{activity.message_content}</p>
                  <p className="text-sm text-gray-500">To: {activity.phone_number || 'N/A'}</p>
                </div>
                <div className="text-sm text-gray-600">
                  {new Date(activity.sent_at).toLocaleDateString()}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">No recent activity to display.</p>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, loading }) {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md flex items-center justify-between transition-transform transform hover:-translate-y-1">
      <div>
        <p className="text-md font-medium text-gray-600">{title}</p>
        {loading ? (
          <div className="h-10 bg-gray-200 rounded animate-pulse w-24 mt-2"></div>
        ) : (
          <p className="text-4xl font-bold text-gray-900">{value}</p>
        )}
      </div>
      <div className={`p-4 rounded-full ${colors[color]}`}>
        {icon}
      </div>
    </div>
  );
}

// SVG Icons for Stat Cards

function UsersIcon() {
  return (
    <svg className="h-7 w-7" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}

function GiftIcon() {
  return (
    <svg className="h-7 w-7" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
    </svg>
  );
}

function ChatBubbleIcon() {
  return (
    <svg className="h-7 w-7" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
    </svg>
  );
}

function TicketIcon() {
  return (
    <svg className="h-7 w-7" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
    </svg>
  );
}
