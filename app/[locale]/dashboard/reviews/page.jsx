"use client";

import { useDashboard } from '@/components/dashboard/DashboardContext';
import Reviews from '@/components/dashboard/Reviews';

export default function ReviewsPage() {
    const { user } = useDashboard();

    if (!user) return null;

    return <Reviews user={user} />;
}
