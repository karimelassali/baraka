"use client";

import { useTranslations } from 'next-intl';
import AdminRouteGuard from '@/components/admin/AdminRouteGuard';
import AdminBoard from '@/components/admin/board/AdminBoard';

export default function AdminBoardPage() {
    const t = useTranslations('Admin.Board'); // Force rebuild

    return (
        <AdminRouteGuard permission="view_board">
            <div className="space-y-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
                    <p className="text-muted-foreground">
                        {t('subtitle')}
                    </p>
                </div>
                <AdminBoard />
            </div>
        </AdminRouteGuard>
    );
}
