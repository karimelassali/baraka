"use client";

import { useTranslations } from "next-intl";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";
import { Link } from "@/navigation";
import { ArrowLeft, Wallet, Gift, Sparkles, LayoutDashboard } from "lucide-react";

export default function UserGuidePage() {
    const t = useTranslations('Dashboard.HowToUse.User');

    const sections = [
        {
            id: "dashboard",
            title: t('dashboard_title'),
            description: t('dashboard_desc'),
            icon: LayoutDashboard,
            image: "/illus/undraw_learning_qt7d.svg",
            color: "bg-blue-50 text-blue-600"
        },
        {
            id: "wallet",
            title: t('wallet_title'),
            description: t('wallet_desc'),
            icon: Wallet,
            image: "/illus/undraw_wallet_diag.svg",
            color: "bg-green-50 text-green-600"
        },
        {
            id: "offers",
            title: t('offers_title'),
            description: t('offers_desc'),
            icon: Gift,
            image: "/illus/undraw_gift-card_sfy8.svg",
            color: "bg-purple-50 text-purple-600"
        },
        {
            id: "wishlist",
            title: t('wishlist_title'),
            description: t('wishlist_desc'),
            icon: Sparkles,
            image: "/illus/undraw_wishlist_0k5w.svg",
            color: "bg-yellow-50 text-yellow-600"
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <BackgroundBeamsWithCollision className="h-[40vh] min-h-[400px] bg-neutral-950">
                <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center text-white/80 hover:text-white mb-8 transition-colors bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        {t('back_to_dashboard')}
                    </Link>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                        {t('hero_title')}
                    </h1>
                    <p className="text-xl text-white/90 max-w-2xl mx-auto">
                        {t('hero_subtitle')}
                    </p>
                </div>
            </BackgroundBeamsWithCollision>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20 pb-20">
                <div className="grid gap-12">
                    {sections.map((section, index) => (
                        <div
                            key={section.id}
                            className={`bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
                        >
                            <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                                <div className={`w-16 h-16 rounded-2xl ${section.color} flex items-center justify-center mb-6`}>
                                    <section.icon className="w-8 h-8" />
                                </div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                    {section.title}
                                </h2>
                                <p className="text-lg text-gray-600 leading-relaxed">
                                    {section.description}
                                </p>
                            </div>
                            <div className="md:w-1/2 bg-gray-50 p-8 md:p-12 flex items-center justify-center">
                                <img
                                    src={section.image}
                                    alt={section.title}
                                    className="w-full max-w-md h-auto object-contain transform hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
