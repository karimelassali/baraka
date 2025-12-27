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
                    <div className="text-gray-500 text-sm flex flex-col gap-2">
                        <p>© {currentYear} Baraka {t('rights_reserved')}</p>
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

                <div className="mt-12 flex justify-center border-t border-gray-100 pt-8">
                    <a
                        href="https://elassali.netlify.app/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex flex-col items-center gap-1 opacity-50 hover:opacity-100 transition-all duration-500"
                    >
                        <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 group-hover:text-red-500 transition-colors">Powered by</span>
                        <span className="font-serif text-lg text-gray-600 italic tracking-wide group-hover:text-black transition-colors">
                            Karim El Assali
                        </span>
                    </a>
                </div>
            </div>
        </footer>
    );
}
