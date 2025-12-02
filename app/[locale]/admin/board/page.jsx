"use client";

import { useTranslations } from 'next-intl';
import AdminBoard from '@/components/admin/board/AdminBoard';

export default function AdminBoardPage() {
    const t = useTranslations('Admin.Board'); // Force rebuild

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
                <p className="text-muted-foreground">
                    {t('subtitle')}
                </p>
            </div>
            <AdminBoard />
        </div>
    );
}
