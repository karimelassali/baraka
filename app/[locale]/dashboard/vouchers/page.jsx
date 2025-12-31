"use client";

import { useDashboard } from '@/components/dashboard/DashboardContext';
import Vouchers from '@/components/dashboard/Vouchers';

export default function VouchersPage() {
    const { user } = useDashboard();

    if (!user) return null;

    return <Vouchers user={user} />;
}
