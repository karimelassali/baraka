"use client";

import { useTranslations } from "next-intl";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";
import { Link } from "@/navigation";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    Wallet,
    Gift,
    Sparkles,
    LayoutDashboard,
    CheckCircle2,
    Star,
    ArrowRight,
    Phone,
    Shield,
    Zap,
    Heart
} from "lucide-react";

export default function UserGuidePage() {
    const t = useTranslations('HowToUse');

    const sections = [
        {
            id: "dashboard",
            title: t('Customer.dashboard_title'),
            description: t('Customer.dashboard_desc'),
            icon: LayoutDashboard,
            image: "/illus/undraw_learning_qt7d.svg",
            color: "from-blue-500 to-indigo-600",
            bgColor: "bg-blue-50",
            iconBg: "bg-gradient-to-br from-blue-500 to-indigo-600",
            features: [
                t('Customer.features.view_points'),
                t('Customer.features.track_history'),
                t('Customer.features.access_benefits')
            ]
        },
        {
            id: "wallet",
            title: t('Customer.dashboard_sections.wallet'),
            description: t('Customer.dashboard_sections.wallet_desc'),
            icon: Wallet,
            image: "/illus/undraw_wallet_diag.svg",
            color: "from-emerald-500 to-teal-600",
            bgColor: "bg-emerald-50",
            iconBg: "bg-gradient-to-br from-emerald-500 to-teal-600",
            features: [
                t('Customer.features.check_points'),
                t('Customer.features.view_transactions'),
                t('Customer.features.redeem_rewards')
            ]
        },
        {
            id: "offers",
            title: t('Customer.dashboard_sections.offers'),
            description: t('Customer.dashboard_sections.offers_desc'),
            icon: Gift,
            image: "/illus/undraw_gift-card_sfy8.svg",
            color: "from-purple-500 to-pink-600",
            bgColor: "bg-purple-50",
            iconBg: "bg-gradient-to-br from-purple-500 to-pink-600",
            features: [
                t('Customer.features.browse_deals'),
                t('Customer.features.unlock_discounts'),
                t('Customer.features.personalized_offers')
            ]
        },
        {
            id: "wishlist",
            title: t('Customer.dashboard_sections.profile'),
            description: t('Customer.dashboard_sections.profile_desc'),
            icon: Sparkles,
            image: "/illus/undraw_wishlist_0k5w.svg",
            color: "from-amber-500 to-orange-600",
            bgColor: "bg-amber-50",
            iconBg: "bg-gradient-to-br from-amber-500 to-orange-600",
            features: [
                t('Customer.features.manage_preferences'),
                t('Customer.features.update_contact'),
                t('Customer.features.customize_notifications')
            ]
        }
    ];

    const benefits = [
        { icon: Zap, title: t('Customer.benefits.fast_title'), desc: t('Customer.benefits.fast_desc') },
        { icon: Shield, title: t('Customer.benefits.secure_title'), desc: t('Customer.benefits.secure_desc') },
        { icon: Heart, title: t('Customer.benefits.personalized_title'), desc: t('Customer.benefits.personalized_desc') },
        { icon: Star, title: t('Customer.benefits.rewards_title'), desc: t('Customer.benefits.rewards_desc') }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: "easeOut"
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* Hero Section */}
            <BackgroundBeamsWithCollision className="h-[50vh] min-h-[450px] bg-neutral-950 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neutral-950/50 to-neutral-950" />
                <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center justify-center h-full">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Link
                            href="/how-to-use"
                            className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-all duration-300 bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/20 hover:bg-white/20 hover:scale-105 group"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                            {t('Overview.title')}
                        </Link>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="mb-6"
                    >
                        <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 text-red-300 text-sm font-medium">
                            <Sparkles className="w-4 h-4 mr-2" />
                            {t('Customer.badge')}
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight"
                    >
                        <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                            {t('Customer.title')}
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed"
                    >
                        {t('Customer.getting_started_desc')}
                    </motion.p>

                    {/* Scroll indicator */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1, duration: 0.5 }}
                        className="absolute bottom-8 left-1/2 -translate-x-1/2"
                    >
                        <motion.div
                            animate={{ y: [0, 8, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2"
                        >
                            <motion.div className="w-1.5 h-1.5 bg-white/60 rounded-full" />
                        </motion.div>
                    </motion.div>
                </div>
            </BackgroundBeamsWithCollision>

            {/* Benefits Bar */}
            <div className="relative z-20 -mt-12">
                <div className="max-w-5xl mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6 grid grid-cols-2 md:grid-cols-4 gap-4"
                    >
                        {benefits.map((benefit, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-2">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center flex-shrink-0">
                                    <benefit.icon className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900 text-sm">{benefit.title}</p>
                                    <p className="text-xs text-gray-500">{benefit.desc}</p>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* Main Sections */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="space-y-16"
                >
                    {sections.map((section, index) => (
                        <motion.div
                            key={section.id}
                            variants={itemVariants}
                            className={`relative bg-white rounded-3xl shadow-xl shadow-gray-200/40 border border-gray-100 overflow-hidden group hover:shadow-2xl hover:shadow-gray-300/40 transition-all duration-500`}
                        >
                            {/* Gradient accent line */}
                            <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${section.color}`} />

                            <div className={`flex flex-col lg:flex-row ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                                {/* Content Side */}
                                <div className="lg:w-1/2 p-8 sm:p-10 lg:p-14 flex flex-col justify-center">
                                    {/* Step Number */}
                                    <div className="flex items-center gap-3 mb-6">
                                        <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                                            {t('Customer.step')} {index + 1}
                                        </span>
                                        <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
                                    </div>

                                    {/* Icon */}
                                    <div className={`w-16 h-16 rounded-2xl ${section.iconBg} flex items-center justify-center mb-6 shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                                        <section.icon className="w-8 h-8 text-white" />
                                    </div>

                                    {/* Title */}
                                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 group-hover:text-gray-800 transition-colors">
                                        {section.title}
                                    </h2>

                                    {/* Description */}
                                    <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-6">
                                        {section.description}
                                    </p>

                                    {/* Features List */}
                                    <ul className="space-y-3">
                                        {section.features.map((feature, fIdx) => (
                                            <li key={fIdx} className="flex items-center gap-3 text-gray-700">
                                                <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${section.color} flex items-center justify-center flex-shrink-0`}>
                                                    <CheckCircle2 className="w-3 h-3 text-white" />
                                                </div>
                                                <span className="text-sm sm:text-base">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Image Side */}
                                <div className={`lg:w-1/2 ${section.bgColor} p-8 sm:p-10 lg:p-14 flex items-center justify-center relative overflow-hidden`}>
                                    {/* Background Pattern */}
                                    <div className="absolute inset-0 opacity-30">
                                        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-white/50 to-transparent rounded-full blur-3xl" />
                                        <div className="absolute bottom-0 left-0 w-60 h-60 bg-gradient-to-tr from-white/50 to-transparent rounded-full blur-3xl" />
                                    </div>

                                    <img
                                        src={section.image}
                                        alt={section.title}
                                        className="relative z-10 w-full max-w-sm lg:max-w-md h-auto object-contain transform group-hover:scale-105 transition-transform duration-700 drop-shadow-lg"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            {/* CTA Section */}
            <div className="relative py-20 overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
                <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500/30 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl" />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="relative z-10 max-w-4xl mx-auto px-4 text-center"
                >
                    <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/90 text-sm font-medium mb-6">
                        <Phone className="w-4 h-4 mr-2" />
                        {t('Customer.need_help')}
                    </div>

                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
                        {t('Customer.cta_title')} <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">{t('Customer.cta_highlight')}</span>
                    </h2>

                    <p className="text-lg text-white/70 mb-10 max-w-2xl mx-auto">
                        {t('Customer.cta_description')}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/"
                            className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-2xl shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 hover:scale-105 transition-all duration-300"
                        >
                            {t('Customer.join_waitlist')}
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </motion.div>
            </div>

            {/* Footer Spacer */}
            <div className="h-8 bg-gradient-to-b from-gray-900 to-gray-950" />
        </div>
    );
}
