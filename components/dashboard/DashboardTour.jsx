"use client";

import { useEffect, useRef } from 'react';
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useTranslations } from 'next-intl';
import { HelpCircle } from 'lucide-react';

export default function DashboardTour({ activeTab }) {
    const t = useTranslations('Tour');
    const driverObj = useRef(null);

    useEffect(() => {
        const isMobile = window.innerWidth < 1024;

        const stepsConfig = {
            overview: [
                {
                    element: isMobile ? '#mobile-bottom-nav' : '#dashboard-sidebar',
                    popover: {
                        title: t('sidebar_title'),
                        description: t('sidebar_desc'),
                        side: isMobile ? "top" : "right",
                        align: 'start'
                    }
                },
                {
                    element: '#dashboard-stats',
                    popover: {
                        title: t('stats_title'),
                        description: t('stats_desc'),
                        side: "bottom",
                        align: 'start'
                    }
                },
                {
                    element: '#dashboard-wallet-card',
                    popover: {
                        title: t('wallet_title'),
                        description: t('wallet_desc'),
                        side: "top",
                        align: 'start'
                    }
                },
                {
                    element: '#dashboard-offers-card',
                    popover: {
                        title: t('offers_title'),
                        description: t('offers_desc'),
                        side: "top",
                        align: 'start'
                    }
                }
            ],
            wallet: [
                {
                    element: '#dashboard-wallet',
                    popover: {
                        title: t('wallet_title'),
                        description: t('wallet_desc'),
                        side: "bottom",
                        align: 'start'
                    }
                }
            ],
            offers: [
                {
                    element: '#dashboard-offers',
                    popover: {
                        title: t('offers_title'),
                        description: t('offers_desc'),
                        side: "bottom",
                        align: 'start'
                    }
                }
            ],
            vouchers: [
                {
                    element: '#dashboard-vouchers',
                    popover: {
                        title: t('vouchers_title'),
                        description: t('vouchers_desc'),
                        side: "bottom",
                        align: 'start'
                    }
                },
                {
                    element: '#vouchers-list',
                    popover: {
                        title: t('vouchers_usage_title'),
                        description: t('vouchers_usage_desc'),
                        side: "top",
                        align: 'start'
                    }
                }
            ],
            wishlist: [
                {
                    element: '#dashboard-wishlist',
                    popover: {
                        title: t('wishlist_title'),
                        description: t('wishlist_desc'),
                        side: "bottom",
                        align: 'start'
                    }
                }
            ],
            reviews: [
                {
                    element: '#reviews-header',
                    popover: {
                        title: t('reviews_header_title'),
                        description: t('reviews_header_desc'),
                        side: "bottom",
                        align: 'start'
                    }
                },
                {
                    element: '#reviews-content',
                    popover: {
                        title: t('reviews_content_title'),
                        description: t('reviews_content_desc'),
                        side: "left",
                        align: 'start'
                    }
                },
                {
                    element: '#reviews-sidebar',
                    popover: {
                        title: t('reviews_sidebar_title'),
                        description: t('reviews_sidebar_desc'),
                        side: "left",
                        align: 'start'
                    }
                }
            ]
        };

        const currentSteps = stepsConfig[activeTab] || [];

        if (currentSteps.length === 0) return;

        driverObj.current = driver({
            showProgress: true,
            animate: true,
            allowClose: true,
            doneBtnText: t('done'),
            closeBtnText: t('close'),
            nextBtnText: t('next'),
            prevBtnText: t('prev'),
            steps: currentSteps
        });

        const tourKey = `hasSeenTour_${activeTab}`;
        const hasSeenTour = localStorage.getItem(tourKey);

        if (!hasSeenTour) {
            // Small delay to ensure elements are rendered
            setTimeout(() => {
                driverObj.current.drive();
                localStorage.setItem(tourKey, 'true');
            }, 1000);
        }
    }, [t, activeTab]);

    const startTour = () => {
        if (driverObj.current) {
            driverObj.current.drive();
        }
    };

    // Only show button if there are steps for the current tab
    const hasSteps = ['overview', 'wallet', 'offers', 'vouchers', 'wishlist', 'reviews'].includes(activeTab);

    if (!hasSteps) return null;

    return (
        <button
            onClick={startTour}
            className="fixed bottom-24 lg:bottom-6 left-6 z-[100] bg-red-600 text-white p-3 rounded-full shadow-lg hover:bg-red-700 transition-colors duration-300 hover:scale-110"
            title={t('start_tour')}
        >
            <HelpCircle className="w-6 h-6" />
        </button>
    );
}
