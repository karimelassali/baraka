"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from 'next-intl';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import {
  CheckCircle,
  Users,
  TrendingUp,
  ShieldCheck,
  MessageCircle,
  Globe,
  BarChart2,
  Smartphone,
  Gift,
  CreditCard,
  UserPlus,
  ShoppingBag,
  Award,
  Settings,
  PieChart,
  Send,
  HelpCircle,
  ChevronRight
} from 'lucide-react';

export default function HowToUsePage() {
  const t = useTranslations('HowToUse');
  const [activeTab, setActiveTab] = useState("overview"); // 'overview', 'admin', 'customer'

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const TabButton = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`relative px-6 py-4 flex items-center space-x-2 text-lg font-medium transition-all duration-300 rounded-xl ${activeTab === id
          ? "text-red-600 bg-red-50 shadow-sm ring-1 ring-red-100"
          : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
        }`}
    >
      <Icon className={`w-5 h-5 ${activeTab === id ? "text-red-600" : "text-gray-400"}`} />
      <span>{label}</span>
      {activeTab === id && (
        <motion.div
          layoutId="activeTab"
          className="absolute bottom-0 left-0 right-0 h-1 bg-red-600 rounded-b-xl hidden md:block"
        />
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-red-100 selection:text-red-900">
      {/* Floating Translate Widget */}
      <div className="fixed bottom-6 right-6 z-50 shadow-xl rounded-full overflow-hidden">
        <LanguageSwitcher />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.header
          className="text-center mb-16"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <div className="inline-block p-2 px-4 rounded-full bg-red-100 text-red-700 font-semibold text-sm mb-6 tracking-wide uppercase">
            {t('title')}
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight leading-tight">
            {t('title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {t('subtitle')}
          </p>
        </motion.header>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-12">
          <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-gray-200 inline-flex flex-wrap justify-center gap-2">
            <TabButton id="overview" label={t('tabs.overview')} icon={HelpCircle} />
            <TabButton id="customer" label={t('tabs.customer')} icon={Users} />
            <TabButton id="admin" label={t('tabs.admin')} icon={Settings} />
          </div>
        </div>

        {/* Content Sections */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full"
          >
            {/* Overview Section */}
            {activeTab === "overview" && (
              <div className="space-y-16">
                {/* Hero Section */}
                <section className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                  <div className="grid md:grid-cols-2 gap-12 items-center p-8 md:p-12">
                    <div className="space-y-6">
                      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                        {t('Overview.what_title')}
                      </h2>
                      <p className="text-lg text-gray-600 leading-relaxed">
                        {t('Overview.what_desc')}
                      </p>
                      <div className="flex flex-wrap gap-4 pt-4">
                        <div className="flex items-center space-x-2 text-gray-700 bg-gray-50 px-4 py-2 rounded-lg">
                          <Globe className="w-5 h-5 text-blue-500" />
                          <span className="font-medium">{t('Overview.features.multilang')}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-700 bg-gray-50 px-4 py-2 rounded-lg">
                          <MessageCircle className="w-5 h-5 text-green-500" />
                          <span className="font-medium">{t('Overview.features.whatsapp')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="relative h-64 md:h-96 w-full flex items-center justify-center bg-gray-50 rounded-2xl overflow-hidden">
                      <img
                        src="/illus/undraw_sharing-knowledge_2jx3.svg"
                        alt="Overview"
                        className="w-full h-full object-contain p-8 hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  </div>
                </section>

                {/* Benefits Grid */}
                <section>
                  <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('Overview.why_title')}</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">{t('Overview.why_desc')}</p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-8">
                    {[
                      {
                        title: t('Overview.benefits.loyalty_title'),
                        desc: t('Overview.benefits.loyalty_desc'),
                        icon: Gift,
                        color: "text-purple-600",
                        bg: "bg-purple-50"
                      },
                      {
                        title: t('Overview.benefits.engagement_title'),
                        desc: t('Overview.benefits.engagement_desc'),
                        icon: MessageCircle,
                        color: "text-blue-600",
                        bg: "bg-blue-50"
                      },
                      {
                        title: t('Overview.benefits.info_title'),
                        desc: t('Overview.benefits.info_desc'),
                        icon: BarChart2,
                        color: "text-green-600",
                        bg: "bg-green-50"
                      }
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        whileHover={{ y: -5 }}
                        className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all"
                      >
                        <div className={`w-14 h-14 ${item.bg} rounded-2xl flex items-center justify-center mb-6`}>
                          <item.icon className={`w-7 h-7 ${item.color}`} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                        <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                      </motion.div>
                    ))}
                  </div>
                </section>

                {/* Target Audience */}
                <section className="grid md:grid-cols-2 gap-8">
                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-10 rounded-3xl shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700"></div>
                    <div className="relative z-10">
                      <div className="flex items-center space-x-4 mb-6">
                        <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                          <TrendingUp className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold">{t('Overview.business_title')}</h3>
                      </div>
                      <ul className="space-y-4">
                        {[0, 1, 2, 3].map((i) => (
                          <li key={i} className="flex items-center space-x-3">
                            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                            <span className="text-gray-200 font-medium">{t(`Overview.business_list.${i}`)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="bg-white p-10 rounded-3xl shadow-xl border border-gray-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700"></div>
                    <div className="relative z-10">
                      <div className="flex items-center space-x-4 mb-6">
                        <div className="p-3 bg-red-50 rounded-xl">
                          <Users className="w-8 h-8 text-red-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">{t('Overview.customer_title')}</h3>
                      </div>
                      <ul className="space-y-4">
                        {[0, 1, 2, 3].map((i) => (
                          <li key={i} className="flex items-center space-x-3">
                            <CheckCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                            <span className="text-gray-600 font-medium">{t(`Overview.customer_list.${i}`)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* Customer Guide Section */}
            {activeTab === "customer" && (
              <div className="space-y-16">
                <section className="text-center max-w-3xl mx-auto">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('Customer.getting_started_title')}</h2>
                  <p className="text-lg text-gray-600">{t('Customer.getting_started_desc')}</p>
                </section>

                {/* Registration Steps */}
                <section className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="grid md:grid-cols-2">
                    <div className="p-10 md:p-12 bg-gradient-to-br from-red-50 to-white">
                      <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
                        <UserPlus className="w-6 h-6 mr-3 text-red-600" />
                        {t('Customer.register_title')}
                      </h3>
                      <div className="space-y-8">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-4 uppercase tracking-wider text-sm text-red-600">
                            {t('Customer.required_info_title')}
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[0, 1, 2, 3].map((i) => (
                              <div key={i} className="flex items-center space-x-2 text-gray-700 bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
                                <span className="text-sm font-medium">{t(`Customer.required_info_list.${i}`)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-4 uppercase tracking-wider text-sm text-red-600">
                            {t('Customer.reg_steps_title')}
                          </h4>
                          <div className="space-y-3">
                            {[0, 1, 2, 3].map((i) => (
                              <div key={i} className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-sm mr-4 flex-shrink-0">
                                  {i + 1}
                                </div>
                                <span className="text-gray-700 font-medium">{t(`Customer.reg_steps_list.${i}`)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 flex items-center justify-center p-8">
                      <img
                        src="/illus/undraw_learning_qt7d.svg"
                        alt="Registration"
                        className="max-w-full h-auto max-h-80 drop-shadow-md"
                      />
                    </div>
                  </div>
                </section>

                {/* Dashboard Features */}
                <section>
                  <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">{t('Customer.dashboard_title')}</h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    {[
                      { key: 'profile', icon: Users, color: 'blue' },
                      { key: 'wallet', icon: CreditCard, color: 'green' },
                      { key: 'offers', icon: Gift, color: 'purple' }
                    ].map((item) => (
                      <div key={item.key} className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                        <div className={`w-12 h-12 bg-${item.color}-50 text-${item.color}-600 rounded-xl flex items-center justify-center mb-4`}>
                          <item.icon className="w-6 h-6" />
                        </div>
                        <h4 className="text-lg font-bold text-gray-900 mb-2">{t(`Customer.dashboard_sections.${item.key}`)}</h4>
                        <p className="text-gray-600">{t(`Customer.dashboard_sections.${item.key}_desc`)}</p>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Points System */}
                <section className="bg-gray-900 text-white rounded-3xl p-10 md:p-16 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-red-600 opacity-10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                  <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                    <div>
                      <h3 className="text-3xl font-bold mb-6">{t('Customer.points_title')}</h3>
                      <p className="text-gray-300 text-lg mb-8">{t('Customer.how_points_work_desc')}</p>
                      <ul className="space-y-4">
                        {[0, 1, 2].map((i) => (
                          <li key={i} className="flex items-center space-x-4 bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                            <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                            <span className="font-medium text-lg">{t(`Customer.how_points_work_list.${i}`)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex justify-center">
                      <div className="bg-white/10 p-8 rounded-full backdrop-blur-md border border-white/20">
                        <Award className="w-32 h-32 text-yellow-400" />
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* Admin Guide Section */}
            {activeTab === "admin" && (
              <div className="space-y-16">
                <section className="bg-white rounded-3xl shadow-xl border border-gray-100 p-10 md:p-16 text-center">
                  <div className="w-20 h-20 bg-gray-900 text-white rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg transform rotate-3">
                    <Settings className="w-10 h-10" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">{t('Admin.dashboard_title')}</h2>
                  <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                    {t('Admin.dashboard_desc')}
                  </p>
                </section>

                {/* Key Features Grid */}
                <section>
                  <h3 className="text-2xl font-bold text-gray-900 mb-8">{t('Admin.key_features_title')}</h3>
                  <div className="grid md:grid-cols-2 gap-8">
                    {[
                      { key: 'customer_mgmt', icon: Users, color: 'blue' },
                      { key: 'points_system', icon: Award, color: 'yellow' },
                      { key: 'offers_mgmt', icon: ShoppingBag, color: 'purple' },
                      { key: 'reviews_comms', icon: MessageCircle, color: 'green' }
                    ].map((feature) => (
                      <div key={feature.key} className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:border-gray-200 transition-all group">
                        <div className="flex items-start justify-between mb-6">
                          <div className={`p-3 rounded-xl bg-${feature.color}-50 text-${feature.color}-600 group-hover:scale-110 transition-transform`}>
                            <feature.icon className="w-8 h-8" />
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-600 transition-colors" />
                        </div>
                        <h4 className="text-xl font-bold text-gray-900 mb-4">{t(`Admin.features.${feature.key}`)}</h4>
                        <ul className="space-y-2">
                          {[0, 1, 2].map((i) => (
                            <li key={i} className="flex items-center text-gray-600 text-sm">
                              <div className={`w-1.5 h-1.5 rounded-full bg-${feature.color}-400 mr-2`}></div>
                              {t(`Admin.features.${feature.key.split('_')[0]}_list.${i}`)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Workflow Steps */}
                <section className="grid md:grid-cols-2 gap-8">
                  <div className="bg-gray-50 p-8 rounded-3xl border border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                      <CreditCard className="w-6 h-6 mr-3 text-gray-700" />
                      {t('Admin.process_points_title')}
                    </h3>
                    <div className="space-y-8">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wider text-blue-600">
                          {t('Admin.adding_points_title')}
                        </h4>
                        <div className="space-y-3">
                          {[0, 1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center bg-white p-3 rounded-lg shadow-sm">
                              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold mr-3">
                                {i + 1}
                              </span>
                              <span className="text-gray-700 text-sm font-medium">{t(`Admin.adding_points_steps.${i}`)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 p-8 rounded-3xl border border-green-100">
                    <h3 className="text-xl font-bold text-green-900 mb-6 flex items-center">
                      <Send className="w-6 h-6 mr-3 text-green-700" />
                      {t('Admin.whatsapp_title')}
                    </h3>
                    <p className="text-green-800 mb-6 text-sm leading-relaxed">
                      {t('Admin.whatsapp_desc')}
                    </p>
                    <div className="space-y-3">
                      {[0, 1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center bg-white/60 p-3 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                          <span className="text-green-900 text-sm font-medium">{t(`Admin.whatsapp_steps.${i}`)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}