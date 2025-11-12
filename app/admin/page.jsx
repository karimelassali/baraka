// app/admin/page.jsx
import { redirect } from 'next/navigation';
import { AuthService } from '../../lib/auth';
import CustomerManagement from '../../components/admin/CustomerManagement';
import OfferManagement from '../../components/admin/OfferManagement';
import ReviewManagement from '../../components/admin/ReviewManagement';
import PointsManagement from '../../components/admin/PointsManagement';
import VoucherManagement from '../../components/admin/VoucherManagement';
import WhatsAppCampaign from '../../components/admin/WhatsAppCampaign';
import MessagingLogs from '../../components/admin/MessagingLogs';

export default async function AdminDashboardPage() {
  const isAdmin = await AuthService.isAdmin();

  if (!isAdmin) {
    redirect('/login');
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <CustomerManagement />
        <OfferManagement />
        <ReviewManagement />
        <PointsManagement />
        <VoucherManagement />
        <WhatsAppCampaign />
        <MessagingLogs />
      </div>
    </div>
  );
}
