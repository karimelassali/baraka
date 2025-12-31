"use client";

import { useDashboard } from '@/components/dashboard/DashboardContext';
import Profile from '@/components/dashboard/Profile';

export default function ProfilePage() {
    const { user } = useDashboard();

    if (!user) return null;

    return <Profile user={user} />;
}
