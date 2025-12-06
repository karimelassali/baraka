'use client'
import AdminWishlistManager from '@/components/admin/AdminWishlistManager';
import { useTranslations } from 'next-intl';

export default function AdminWishlistPage({ params }) {
    const { locale } = params;
    const t = useTranslations();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {t('Wishlist.Title', 'Wishlist Requests')}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        {t('Wishlist.Subtitle', 'Manage customer product requests')}
                    </p>
                </div>
            </div>

            <AdminWishlistManager locale={locale} />
        </div>
    );
}
