// app/dashboard/page.jsx
import './dashboard.css';
import Sidebar from '../../components/dashboard/Sidebar';
import Header from '../../components/dashboard/Header';
import StatCard from '../../components/dashboard/StatCard';
import EarnPoints from '../../components/dashboard/EarnPoints';
import RedeemPoints from '../../components/dashboard/RedeemPoints';
import UniqueActivities from '../../components/dashboard/UniqueActivities';
import VipProgram from '../../components/dashboard/VipProgram';

export default function DashboardPage() {
  const stats = [
    { title: 'Loyalty members', value: '1,201', icon: '👥' },
    { title: 'Points earned', value: '51,160', icon: '⭐' },
    { title: 'Points redeemed', value: '11,480', icon: '🎁' },
    { title: 'Total orders', value: '280', icon: '🛒' },
  ];

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="p-8">
          <div className="grid grid-cols-4 gap-8 mb-8">
            {stats.map((stat, index) => (
              <StatCard key={index} title={stat.title} value={stat.value} icon={stat.icon} />
            ))}
          inăuntru
          <div className="grid grid-cols-3 gap-8">
            <div className="col-span-2 space-y-8">
              <UniqueActivities />
              <div className="grid grid-cols-2 gap-8">
                <EarnPoints />
                <RedeemPoints />
              </div>
            </div>
            <div className="col-span-1">
              <VipProgram />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}