"use client";

import { useDashboard } from '@/components/dashboard/DashboardContext';
import Offers from '@/components/dashboard/Offers';

export default function OffersPage() {
    const { user } = useDashboard();

    if (!user) return null;

    return <Offers user={user} />;
}
