"use client";

import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function Footer() {
    const t = useTranslations('Home');
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-50 border-t border-gray-100 py-12">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-gray-500 text-sm">
                        © {currentYear} Baraka S.R.L. {t('rights_reserved')}
                    </div>

                    <div className="flex gap-8">
                        <Link
                            href="/privacy"
                            className="text-gray-600 hover:text-red-600 text-sm font-medium transition-colors"
                        >
                            {t('privacy_policy')}
                        </Link>
                        <Link
                            href="/terms"
                            className="text-gray-600 hover:text-red-600 text-sm font-medium transition-colors"
                        >
                            {t('terms_of_service')}
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
