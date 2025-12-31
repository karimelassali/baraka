"use client";

import { useDashboard } from '@/components/dashboard/DashboardContext';
import WishlistRequest from '@/components/dashboard/WishlistRequest';

export default function WishlistPage() {
    const { user } = useDashboard();

    if (!user) return null;

    return <WishlistRequest user={user} />;
}
