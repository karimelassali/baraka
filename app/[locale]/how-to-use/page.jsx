"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import TranslateWidget from "../../components/ui/TranslateWidget";
import { useI18n } from '../../lib/i18n';

export default function HowToUsePage() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState("overview"); // 'overview', 'admin', 'client'

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 text-gray-800 font-sans">
      {/* Floating Translate Widget */}
      <div className="fixed bottom-4 right-4 z-50">
        <TranslateWidget />
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <motion.header
          className="mb-12 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
            {t('how_to_use_title')}
          </h1>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            {t('how_to_use_description')}
          </p>
        </motion.header>

        {/* Navigation Tabs */}
        <motion.div
          className="flex flex-wrap justify-center mb-12 border-b border-gray-200"
          variants={fadeIn}
        >
          <button
            className={`px-6 py-3 font-medium text-lg ${
              activeTab === "overview"
                ? "text-red-600 border-b-2 border-red-600"
                : "text-gray-600 hover:text-red-600"
            }`}
            onClick={() => setActiveTab("overview")}
          >
            {t('how_to_use_overview')}
          </button>
          <button
            className={`px-6 py-3 font-medium text-lg ${
              activeTab === "admin"
                ? "text-red-600 border-b-2 border-red-600"
                : "text-gray-600 hover:text-red-600"
            }`}
            onClick={() => setActiveTab("admin")}
          >
            {t('how_to_use_admin_guide')}
          </button>
          <button
            className={`px-6 py-3 font-medium text-lg ${
              activeTab === "client"
                ? "text-red-600 border-b-2 border-red-600"
                : "text-gray-600 hover:text-red-600"
            }`}
            onClick={() => setActiveTab("client")}
          >
            {t('how_to_use_customer_guide')}
          </button>
        </motion.div>

        {/* Content Sections */}
        <motion.div
          className="bg-white rounded-2xl shadow-lg p-6 md:p-8"
          variants={fadeIn}
          initial="hidden"
          animate="visible"
        >
          {/* Overview Section */}
          {activeTab === "overview" && (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              <h2 className="text-3xl font-bold text-black mb-6">{t('how_to_use_platform_overview')}</h2>
              
              <div className="space-y-8">
                <section>
                  <h3 className="text-2xl font-bold text-black mb-4 flex items-center">
                    <span className="bg-red-100 text-red-800 text-sm font-semibold px-3 py-1 rounded mr-3">
                      WHAT
                    </span>
                    {t('how_to_use_what_is_baraka')}
                  </h3>
                  <p className="text-gray-700 mb-4">
                    {t('how_to_use_what_is_baraka_text')}
                  </p>
                  <p className="text-gray-700">
                    {t('how_to_use_what_is_baraka_text2')}
                  </p>
                </section>

                <section>
                  <h3 className="text-2xl font-bold text-black mb-4 flex items-center">
                    <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded mr-3">
                      WHY
                    </span>
                    {t('how_to_use_why_use_baraka')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h4 className="font-bold text-lg text-black mb-2">{t('how_to_use_build_loyalty')}</h4>
                      <p className="text-gray-700 text-sm">{t('how_to_use_build_loyalty_text')}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <h4 className="font-bold text-lg text-black mb-2">{t('how_to_use_increase_engagement')}</h4>
                      <p className="text-gray-700 text-sm">{t('how_to_use_increase_engagement_text')}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.25-1.982-.153-3.72-.604-5.245-1.284" />
                        </svg>
                      </div>
                      <h4 className="font-bold text-lg text-black mb-2">{t('how_to_use_manage_information')}</h4>
                      <p className="text-gray-700 text-sm">{t('how_to_use_manage_information_text')}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                    {[
                      { icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z', text: t('how_to_use_whatsapp_integration') },
                      { icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', text: t('how_to_use_multi_language') },
                      { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.25-1.982-.153-3.72-.604-5.245-1.284', text: t('how_to_use_gdpr') },
                      { icon: 'M13 10V3L4 14h7v7l9-11h-7z', text: t('how_to_use_real_time_analytics') },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                          </svg>
                        </div>
                        <span className="text-gray-700 text-sm">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="text-2xl font-bold text-black mb-4 flex items-center">
                    <span className="bg-yellow-100 text-yellow-800 text-sm font-semibold px-3 py-1 rounded mr-3">
                      WHEN
                    </span>
                    {t('how_to_use_when_to_use')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-red-50 p-6 rounded-lg border border-red-100">
                      <div className="flex items-center mb-4">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <h4 className="font-bold text-lg text-black">{t('how_to_use_for_business_owners')}</h4>
                      </div>
                      <ul className="list-disc pl-6 space-y-2 text-gray-700">
                        {t('how_to_use_for_business_owners_list').map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                      <div className="flex items-center mb-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <h4 className="font-bold text-lg text-black">{t('how_to_use_for_customers')}</h4>
                      </div>
                      <ul className="list-disc pl-6 space-y-2 text-gray-700">
                        {t('how_to_use_for_customers_list').map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-2xl font-bold text-black mb-4 flex items-center">
                    <span className="bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded mr-3">
                      HOW
                    </span>
                    {t('how_to_use_how_it_works')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200 shadow-sm">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                        <span className="text-red-600 font-bold text-xl">1</span>
                      </div>
                      <h4 className="font-bold text-lg text-center text-black mb-2">{t('how_to_use_customer_registration')}</h4>
                      <p className="text-gray-700 text-center text-sm">
                        {t('how_to_use_customer_registration_text')}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200 shadow-sm">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                        <span className="text-red-600 font-bold text-xl">2</span>
                      </div>
                      <h4 className="font-bold text-lg text-center text-black mb-2">{t('how_to_use_loyalty_points')}</h4>
                      <p className="text-gray-700 text-center text-sm">
                        {t('how_to_use_loyalty_points_text')}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200 shadow-sm">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                        <span className="text-red-600 font-bold text-xl">3</span>
                      </div>
                      <h4 className="font-bold text-lg text-center text-black mb-2">{t('how_to_use_admin_management')}</h4>
                      <p className="text-gray-700 text-center text-sm">
                        {t('how_to_use_admin_management_text')}
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            </motion.div>
          )}

          {/* Admin Section */}
          {activeTab === "admin" && (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              <h2 className="text-3xl font-bold text-black mb-6">{t('how_to_use_admin_guide')}</h2>
              
              <div className="space-y-8">
                <section>
                  <h3 className="text-2xl font-bold text-black mb-4">{t('how_to_use_admin_dashboard_overview')}</h3>
                  <p className="text-gray-700 mb-4">
                    {t('how_to_use_admin_dashboard_overview_text')}
                  </p>
                  <p className="text-gray-700">
                    {t('how_to_use_admin_dashboard_overview_text2')}
                  </p>
                </section>

                <section>
                  <h3 className="text-2xl font-bold text-black mb-4">{t('how_to_use_key_admin_features')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-200 shadow-sm">
                      <div className="flex items-start">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-bold text-lg text-black mb-2">{t('how_to_use_customer_management')}</h4>
                          <ul className="list-disc pl-6 space-y-1 text-gray-700 text-sm">
                            {t('how_to_use_customer_management_list').map((item, index) => (
                              <li key={index}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 shadow-sm">
                      <div className="flex items-start">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-bold text-lg text-black mb-2">{t('how_to_use_loyalty_points_system')}</h4>
                          <ul className="list-disc pl-6 space-y-1 text-gray-700 text-sm">
                            {t('how_to_use_loyalty_points_system_list').map((item, index) => (
                              <li key={index}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 shadow-sm">
                      <div className="flex items-start">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 3.862.638 6.337 2.046a7.001 7.001 0 013.663 3.663A7.001 7.001 0 0120 13h-4.01m-4 0V7m0 0V3m0 4h4m-4 4V9m0 0v4m0-4h4" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-bold text-lg text-black mb-2">{t('how_to_use_offers_management')}</h4>
                          <ul className="list-disc pl-6 space-y-1 text-gray-700 text-sm">
                            {t('how_to_use_offers_management_list').map((item, index) => (
                              <li key={index}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl border border-yellow-200 shadow-sm">
                      <div className="flex items-start">
                        <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-bold text-lg text-black mb-2">{t('how_to_use_reviews_communications')}</h4>
                          <ul className="list-disc pl-6 space-y-1 text-gray-700 text-sm">
                            {t('how_to_use_reviews_communications_list').map((item, index) => (
                              <li key={index}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-2xl font-bold text-black mb-4">{t('how_to_use_how_to_manage_customers')}</h3>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200 shadow-sm">
                    {t('how_to_use_how_to_manage_customers_list').map((item, index) => (
                      <div className="flex items-start mb-4" key={index}>
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                          <span className="text-red-600 font-bold">{index + 1}</span>
                        </div>
                        <p className="text-gray-700">{item}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="text-2xl font-bold text-black mb-4">{t('how_to_use_how_to_process_loyalty_points')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 shadow-sm">
                      <h4 className="font-bold text-lg text-black mb-3 flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.25-1.982-.153-3.72-.604-5.245-1.284" />
                          </svg>
                        </div>
                        {t('how_to_use_adding_points')}
                      </h4>
                      <div className="space-y-3">
                        {t('how_to_use_adding_points_list').map((item, index) => (
                          <div className="flex items-start" key={index}>
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0 text-xs">
                              {index + 1}
                            </div>
                            <p className="text-gray-700 text-sm">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 shadow-sm">
                      <h4 className="font-bold text-lg text-black mb-3 flex items-center">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        {t('how_to_use_converting_to_vouchers')}
                      </h4>
                      <div className="space-y-3">
                        {t('how_to_use_converting_to_vouchers_list').map((item, index) => (
                          <div className="flex items-start" key={index}>
                            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0 text-xs">
                              {index + 1}
                            </div>
                            <p className="text-gray-700 text-sm">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-2xl font-bold text-black mb-4">{t('how_to_use_sending_whatsapp_messages')}</h3>
                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl border border-yellow-200 shadow-sm">
                    <p className="text-gray-700 mb-4">
                      {t('how_to_use_sending_whatsapp_messages_text')}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {t('how_to_use_sending_whatsapp_messages_list').map((item, index) => (
                        <div key={index} className="flex items-start">
                          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                            <span className="text-yellow-600 font-bold">{index + 1}</span>
                          </div>
                          <p className="text-gray-700 text-sm">{item}</p>
                        </div>
                      ))}
                    </div>
                    <p className="text-gray-700 mt-4 text-sm">
                      {t('how_to_use_sending_whatsapp_messages_text2')}
                    </p>
                  </div>
                </section>
              </div>
            </motion.div>
          )}

          {/* Client Section */}
          {activeTab === "client" && (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              <h2 className="text-3xl font-bold text-black mb-6">{t('how_to_use_customer_guide')}</h2>
              
              <div className="space-y-8">
                <section>
                  <h3 className="text-2xl font-bold text-black mb-4">{t('how_to_use_getting_started')}</h3>
                  <p className="text-gray-700 mb-4">
                    {t('how_to_use_getting_started_text')}
                  </p>
                  <p className="text-gray-700">
                    {t('how_to_use_getting_started_text2')}
                  </p>
                </section>

                <section>
                  <h3 className="text-2xl font-bold text-black mb-4">{t('how_to_use_how_to_register')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-200 shadow-sm">
                      <h4 className="font-bold text-lg text-black mb-3 flex items-center">
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        {t('how_to_use_required_information')}
                      </h4>
                      <ul className="space-y-2">
                        {[
                          { icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', text: t('how_to_use_required_information_list')[0] },
                          { icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', text: t('how_to_use_required_information_list')[1] },
                          { icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z', text: t('how_to_use_required_information_list')[2] },
                          { icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z', text: t('how_to_use_required_information_list')[3] },
                          { icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', text: t('how_to_use_required_information_list')[4] },
                          { icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z', text: t('how_to_use_required_information_list')[5] },
                          { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.25-1.982-.153-3.72-.604-5.245-1.284', text: t('how_to_use_required_information_list')[6] },
                        ].map((item, index) => (
                          <li key={index} className="flex items-start">
                            <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                              </svg>
                            </div>
                            <span className="text-gray-700 text-sm">{item.text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 shadow-sm">
                      <h4 className="font-bold text-lg text-black mb-3 flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.25-1.982-.153-3.72-.604-5.245-1.284" />
                          </svg>
                        </div>
                        {t('how_to_use_registration_steps')}
                      </h4>
                      <div className="space-y-3">
                        {t('how_to_use_registration_steps_list').map((step, index) => (
                          <div key={index} className="flex items-start">
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0 text-xs">
                              {index + 1}
                            </div>
                            <span className="text-gray-700 text-sm">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-2xl font-bold text-black mb-4">{t('how_to_use_using_your_dashboard')}</h3>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-gray-700 mb-4">
                      {t('how_to_use_using_your_dashboard_text')}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white p-5 rounded-lg border border-gray-200">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mb-3 mx-auto">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <h4 className="font-bold text-center text-black mb-2">{t('how_to_use_profile_section')}</h4>
                        <ul className="list-disc pl-4 space-y-1 text-gray-700 text-sm">
                          {t('how_to_use_profile_section_list').map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-white p-5 rounded-lg border border-gray-200">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3 mx-auto">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h4 className="font-bold text-center text-black mb-2">{t('how_to_use_loyalty_wallet')}</h4>
                        <ul className="list-disc pl-4 space-y-1 text-gray-700 text-sm">
                          {t('how_to_use_loyalty_wallet_list').map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-white p-5 rounded-lg border border-gray-200">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3 mx-auto">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l5-5m0 10l-5-5m5-5h12" />
                          </svg>
                        </div>
                        <h4 className="font-bold text-center text-black mb-2">{t('how_to_use_offers_vouchers')}</h4>
                        <ul className="list-disc pl-4 space-y-1 text-gray-700 text-sm">
                          {t('how_to_use_offers_vouchers_list').map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-2xl font-bold text-black mb-4">{t('how_to_use_earning_using_points')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 shadow-sm">
                      <h4 className="font-bold text-lg text-black mb-3 flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2 1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        {t('how_to_use_how_points_work')}
                      </h4>
                      <p className="text-gray-700 mb-4 text-sm">
                        {t('how_to_use_how_points_work_text')}
                      </p>
                      <ul className="space-y-2">
                        {t('how_to_use_how_points_work_list').map((item, index) => (
                          <li key={index} className="flex items-start">
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <span className="text-gray-700 text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 shadow-sm">
                      <h4 className="font-bold text-lg text-black mb-3 flex items-center">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13C12 5.343 8.657 2 4 2s-8 3.343-8 7v4c0 1.657 1.343 3 3 3h4c1.657 0 3-1.343 3-3v-4z" />
                          </svg>
                        </div>
                        {t('how_to_use_redeeming_points')}
                      </h4>
                      <p className="text-gray-700 mb-4 text-sm">
                        {t('how_to_use_redeeming_points_text')}
                      </p>
                      <div className="space-y-3">
                        {t('how_to_use_redeeming_points_list').map((step, index) => (
                          <div key={index} className="flex items-start">
                            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0 text-xs">
                              {index + 1}
                            </div>
                            <span className="text-gray-700 text-sm">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-2xl font-bold text-black mb-4">{t('how_to_use_managing_your_account')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-200 shadow-sm">
                      <h4 className="font-bold text-lg text-black mb-3 flex items-center">
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        {t('how_to_use_updating_information')}
                      </h4>
                      <p className="text-gray-700 mb-4 text-sm">
                        {t('how_to_use_updating_information_text')}
                      </p>
                      <div className="space-y-3">
                        {t('how_to_use_updating_information_list').map((step, index) => (
                          <div key={index} className="flex items-start">
                            <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0 text-xs">
                              {index + 1}
                            </div>
                            <span className="text-gray-700 text-sm">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl border border-yellow-200 shadow-sm">
                      <h4 className="font-bold text-lg text-black mb-3 flex items-center">
                        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                          </svg>
                        </div>
                        {t('how_to_use_communicating_with_us')}
                      </h4>
                      <p className="text-gray-700 mb-4 text-sm">
                        {t('how_to_use_communicating_with_us_text')}
                      </p>
                      <ul className="space-y-2">
                        {t('how_to_use_communicating_with_us_list').map((item, index) => (
                          <li key={index} className="flex items-start">
                            <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <span className="text-gray-700 text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-2xl font-bold text-black mb-4">{t('how_to_use_faqs')}</h3>
                  <div className="space-y-4">
                    {[
                      { 
                        question: t('how_to_use_faq1_q'),
                        answer: t('how_to_use_faq1_a')
                      },
                      { 
                        question: t('how_to_use_faq2_q'),
                        answer: t('how_to_use_faq2_a')
                      },
                      { 
                        question: t('how_to_use_faq3_q'),
                        answer: t('how_to_use_faq3_a')
                      },
                      { 
                        question: t('how_to_use_faq4_q'),
                        answer: t('how_to_use_faq4_a')
                      },
                    ].map((faq, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-5 bg-white hover:bg-gray-50 transition">
                        <h4 className="font-bold text-lg text-black flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {faq.question}
                        </h4>
                        <p className="text-gray-700 pl-7 pt-2">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Back to Home Button */}
        <motion.div 
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Link 
            href="/" 
            className="inline-block bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-8 rounded-full transition duration-300"
          >
            {t('how_to_use_back_to_home')}
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
