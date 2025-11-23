"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import LanguageSwitcher from '../../../components/LanguageSwitcher';

export default function HowToUsePage() {
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
        <LanguageSwitcher />
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
            How to Use Baraka Platform
          </h1>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            A comprehensive guide to understanding and using the Baraka Customer Loyalty Platform for both administrators and customers
          </p>
        </motion.header>

        {/* Navigation Tabs */}
        <motion.div
          className="flex flex-wrap justify-center mb-12 border-b border-gray-200"
          variants={fadeIn}
        >
          <button
            className={`px-6 py-3 font-medium text-lg ${activeTab === "overview"
              ? "text-red-600 border-b-2 border-red-600"
              : "text-gray-600 hover:text-red-600"
              }`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
          <button
            className={`px-6 py-3 font-medium text-lg ${activeTab === "admin"
              ? "text-red-600 border-b-2 border-red-600"
              : "text-gray-600 hover:text-red-600"
              }`}
            onClick={() => setActiveTab("admin")}
          >
            Admin Guide
          </button>
          <button
            className={`px-6 py-3 font-medium text-lg ${activeTab === "client"
              ? "text-red-600 border-b-2 border-red-600"
              : "text-gray-600 hover:text-red-600"
              }`}
            onClick={() => setActiveTab("client")}
          >
            Customer Guide
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
              <h2 className="text-3xl font-bold text-black mb-6">Platform Overview</h2>

              <div className="space-y-8">
                <section>
                  <h3 className="text-2xl font-bold text-black mb-4 flex items-center">
                    <span className="bg-red-100 text-red-800 text-sm font-semibold px-3 py-1 rounded mr-3">
                      WHAT
                    </span>
                    What is Baraka Platform?
                  </h3>
                  <p className="text-gray-700 mb-4">
                    Baraka is a comprehensive customer loyalty platform designed for physical retail shops.
                    It combines a public website, customer registration system, customer dashboard, admin dashboard,
                    and a loyalty points system with WhatsApp Business API integration for messaging.
                  </p>
                  <p className="text-gray-700">
                    Our platform helps businesses build stronger relationships with their customers through
                    personalized loyalty programs, targeted communications, and seamless shopping experiences.
                  </p>
                </section>

                <section>
                  <h3 className="text-2xl font-bold text-black mb-4 flex items-center">
                    <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded mr-3">
                      WHY
                    </span>
                    Why Use Baraka Platform?
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h4 className="font-bold text-lg text-black mb-2">Build Customer Loyalty</h4>
                      <p className="text-gray-700 text-sm">Create a points-based rewards system that keeps customers coming back to your store.</p>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <h4 className="font-bold text-lg text-black mb-2">Increase Engagement</h4>
                      <p className="text-gray-700 text-sm">Send personalized offers and targeted communications to engage customers effectively.</p>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.25-1.982-.153-3.72-.604-5.245-1.284" />
                        </svg>
                      </div>
                      <h4 className="font-bold text-lg text-black mb-2">Manage Information</h4>
                      <p className="text-gray-700 text-sm">Easily manage customer information and track their interactions for better service.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                    {[
                      { icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z', text: 'WhatsApp Integration' },
                      { icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', text: 'Multi-language Support' },
                      { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.25-1.982-.153-3.72-.604-5.245-1.284', text: 'GDPR Compliance' },
                      { icon: 'M13 10V3L4 14h7v7l9-11h-7z', text: 'Real-time Analytics' },
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
                    When to Use Baraka Platform?
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-red-50 p-6 rounded-lg border border-red-100">
                      <div className="flex items-center mb-4">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <h4 className="font-bold text-lg text-black">For Business Owners</h4>
                      </div>
                      <ul className="list-disc pl-6 space-y-2 text-gray-700">
                        <li>Launching a new retail business</li>
                        <li>Looking to increase customer retention</li>
                        <li>Wanting to gather customer data for marketing</li>
                        <li>Needing to manage customer communications</li>
                        <li>Expanding to serve diverse linguistic communities</li>
                      </ul>
                    </div>
                    <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                      <div className="flex items-center mb-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <h4 className="font-bold text-lg text-black">For Customers</h4>
                      </div>
                      <ul className="list-disc pl-6 space-y-2 text-gray-700">
                        <li>Joining loyalty programs for rewards</li>
                        <li>Tracking points and rewards</li>
                        <li>Receiving personalized offers</li>
                        <li>Managing personal information securely</li>
                        <li>Communicating with the business</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-2xl font-bold text-black mb-4 flex items-center">
                    <span className="bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded mr-3">
                      HOW
                    </span>
                    How Does It Work?
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200 shadow-sm">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                        <span className="text-red-600 font-bold text-xl">1</span>
                      </div>
                      <h4 className="font-bold text-lg text-center text-black mb-2">Customer Registration</h4>
                      <p className="text-gray-700 text-center text-sm">
                        Customers register with personal information and consent to data processing
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200 shadow-sm">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                        <span className="text-red-600 font-bold text-xl">2</span>
                      </div>
                      <h4 className="font-bold text-lg text-center text-black mb-2">Loyalty Points</h4>
                      <p className="text-gray-700 text-center text-sm">
                        Customers earn points based on purchases which can be redeemed for rewards
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200 shadow-sm">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                        <span className="text-red-600 font-bold text-xl">3</span>
                      </div>
                      <h4 className="font-bold text-lg text-center text-black mb-2">Admin Management</h4>
                      <p className="text-gray-700 text-center text-sm">
                        Admins manage customers, offers, points, and send targeted communications
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
              <h2 className="text-3xl font-bold text-black mb-6">Admin Guide</h2>

              <div className="space-y-8">
                <section>
                  <h3 className="text-2xl font-bold text-black mb-4">Admin Dashboard Overview</h3>
                  <p className="text-gray-700 mb-4">
                    The admin dashboard is the central hub for managing your customer loyalty program.
                    As a store manager, you have access to all aspects of the platform including
                    customer management, offer creation, points tracking, and communication tools.
                  </p>
                  <p className="text-gray-700">
                    All actions in the admin panel are secured with authentication and audit-logged
                    to ensure data integrity and compliance with GDPR regulations.
                  </p>
                </section>

                <section>
                  <h3 className="text-2xl font-bold text-black mb-4">Key Admin Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-200 shadow-sm">
                      <div className="flex items-start">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-bold text-lg text-black mb-2">Customer Management</h4>
                          <ul className="list-disc pl-6 space-y-1 text-gray-700 text-sm">
                            <li>View all registered customers</li>
                            <li>Filter by name, country of origin, or residence</li>
                            <li>Add new customers (if needed)</li>
                            <li>Edit customer information</li>
                            <li>View customer history and engagement</li>
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
                          <h4 className="font-bold text-lg text-black mb-2">Loyalty Points System</h4>
                          <ul className="list-disc pl-6 space-y-1 text-gray-700 text-sm">
                            <li>Add points to customer accounts</li>
                            <li>Deduct points as needed</li>
                            <li>View complete points history</li>
                            <li>Configure points calculation formula</li>
                            <li>Convert points to vouchers</li>
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
                          <h4 className="font-bold text-lg text-black mb-2">Offers Management</h4>
                          <ul className="list-disc pl-6 space-y-1 text-gray-700 text-sm">
                            <li>Create weekly offers</li>
                            <li>Set up permanent offers</li>
                            <li>Configure multi-language descriptions</li>
                            <li>Set visibility periods for offers</li>
                            <li>Target offers to specific customer groups</li>
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
                          <h4 className="font-bold text-lg text-black mb-2">Reviews & Communications</h4>
                          <ul className="list-disc pl-6 space-y-1 text-gray-700 text-sm">
                            <li>Moderate customer reviews</li>
                            <li>Approve or hide reviews</li>
                            <li>Send WhatsApp campaigns</li>
                            <li>Send birthday messages</li>
                            <li>Target messages by nationality</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-2xl font-bold text-black mb-4">How to Manage Customers</h3>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-start mb-4">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="text-red-600 font-bold">1</span>
                      </div>
                      <p className="text-gray-700">Navigate to the "Customers" section in the admin dashboard</p>
                    </div>
                    <div className="flex items-start mb-4">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="text-red-600 font-bold">2</span>
                      </div>
                      <p className="text-gray-700">View the complete list of registered customers with their details</p>
                    </div>
                    <div className="flex items-start mb-4">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="text-red-600 font-bold">3</span>
                      </div>
                      <p className="text-gray-700">Use filters to search for specific customers by name, country, or residence</p>
                    </div>
                    <div className="flex items-start mb-4">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="text-red-600 font-bold">4</span>
                      </div>
                      <p className="text-gray-700">Click on a customer to view their profile, points history, and purchase history</p>
                    </div>
                    <div className="flex items-start mb-4">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="text-red-600 font-bold">5</span>
                      </div>
                      <p className="text-gray-700">Update customer information as needed</p>
                    </div>
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="text-red-600 font-bold">6</span>
                      </div>
                      <p className="text-gray-700">If necessary, add or deduct loyalty points to their account</p>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-2xl font-bold text-black mb-4">How to Process Loyalty Points</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 shadow-sm">
                      <h4 className="font-bold text-lg text-black mb-3 flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.25-1.982-.153-3.72-.604-5.245-1.284" />
                          </svg>
                        </div>
                        Adding Points
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0 text-xs">
                            1
                          </div>
                          <p className="text-gray-700 text-sm">Go to the "Points" section in the admin dashboard</p>
                        </div>
                        <div className="flex items-start">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0 text-xs">
                            2
                          </div>
                          <p className="text-gray-700 text-sm">Select "Add Points" option</p>
                        </div>
                        <div className="flex items-start">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0 text-xs">
                            3
                          </div>
                          <p className="text-gray-700 text-sm">Search and select the customer</p>
                        </div>
                        <div className="flex items-start">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0 text-xs">
                            4
                          </div>
                          <p className="text-gray-700 text-sm">Enter the purchase amount (default formula: €1 = 1 point)</p>
                        </div>
                        <div className="flex items-start">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0 text-xs">
                            5
                          </div>
                          <p className="text-gray-700 text-sm">Confirm the transaction</p>
                        </div>
                        <div className="flex items-start">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0 text-xs">
                            6
                          </div>
                          <p className="text-gray-700 text-sm">Points will be added to the customer's account immediately</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 shadow-sm">
                      <h4 className="font-bold text-lg text-black mb-3 flex items-center">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        Converting to Vouchers
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0 text-xs">
                            1
                          </div>
                          <p className="text-gray-700 text-sm">Access the customer's loyalty wallet</p>
                        </div>
                        <div className="flex items-start">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0 text-xs">
                            2
                          </div>
                          <p className="text-gray-700 text-sm">Click on "Create Voucher" option</p>
                        </div>
                        <div className="flex items-start">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0 text-xs">
                            3
                          </div>
                          <p className="text-gray-700 text-sm">Specify the point value to convert</p>
                        </div>
                        <div className="flex items-start">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0 text-xs">
                            4
                          </div>
                          <p className="text-gray-700 text-sm">System generates a unique voucher code</p>
                        </div>
                        <div className="flex items-start">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0 text-xs">
                            5
                          </div>
                          <p className="text-gray-700 text-sm">Share the voucher with the customer</p>
                        </div>
                        <div className="flex items-start">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0 text-xs">
                            6
                          </div>
                          <p className="text-gray-700 text-sm">Track voucher usage in the system</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-2xl font-bold text-black mb-4">Sending WhatsApp Messages</h3>
                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl border border-yellow-200 shadow-sm">
                    <p className="text-gray-700 mb-4">
                      The platform integrates with WhatsApp Business API to enable direct communication with customers.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { step: '1', text: 'Navigate to the "Campaigns" section in the admin dashboard' },
                        { step: '2', text: 'Select the type of message (Promotional, Birthday, Nationality-targeted)' },
                        { step: '3', text: 'Choose the target customer group using filters' },
                        { step: '4', text: 'Select from approved WhatsApp templates' },
                        { step: '5', text: 'Customize the message content as needed' },
                        { step: '6', text: 'Send the message and monitor delivery status in the logs' },
                      ].map((item, index) => (
                        <div key={index} className="flex items-start">
                          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                            <span className="text-yellow-600 font-bold">{item.step}</span>
                          </div>
                          <p className="text-gray-700 text-sm">{item.text}</p>
                        </div>
                      ))}
                    </div>
                    <p className="text-gray-700 mt-4 text-sm">
                      All messages must use pre-approved templates to comply with WhatsApp Business API policies.
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
              <h2 className="text-3xl font-bold text-black mb-6">Customer Guide</h2>

              <div className="space-y-8">
                <section>
                  <h3 className="text-2xl font-bold text-black mb-4">Getting Started</h3>
                  <p className="text-gray-700 mb-4">
                    The Baraka customer loyalty platform is designed to be simple and intuitive for all users.
                    Whether you're new to the platform or a returning customer, this guide will help you
                    make the most of your loyalty rewards.
                  </p>
                  <p className="text-gray-700">
                    Our platform supports multiple languages (Italian, English, French, Spanish, and Arabic)
                    to serve diverse communities. You can switch languages using the translator widget.
                  </p>
                </section>

                <section>
                  <h3 className="text-2xl font-bold text-black mb-4">How to Register</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-200 shadow-sm">
                      <h4 className="font-bold text-lg text-black mb-3 flex items-center">
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        Required Information
                      </h4>
                      <ul className="space-y-2">
                        {[
                          { icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', text: 'First name and last name' },
                          { icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', text: 'Date of birth' },
                          { icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z', text: 'Residence address' },
                          { icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z', text: 'Phone number' },
                          { icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', text: 'Email address' },
                          { icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z', text: 'Country of origin' },
                          { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.25-1.982-.153-3.72-.604-5.245-1.284', text: 'GDPR consent confirmation' },
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
                        Registration Steps
                      </h4>
                      <div className="space-y-3">
                        {[
                          { text: 'Click "Register" button on the homepage' },
                          { text: 'Fill in all required information' },
                          { text: 'Agree to GDPR consent requirements' },
                          { text: 'Submit your registration form' },
                          { text: 'Check your email or WhatsApp for confirmation' },
                          { text: 'Log in to your new account' },
                        ].map((step, index) => (
                          <div key={index} className="flex items-start">
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0 text-xs">
                              {index + 1}
                            </div>
                            <span className="text-gray-700 text-sm">{step.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-2xl font-bold text-black mb-4">Using Your Customer Dashboard</h3>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-gray-700 mb-4">
                      Once logged in, your customer dashboard becomes your central hub for managing your loyalty rewards.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white p-5 rounded-lg border border-gray-200">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mb-3 mx-auto">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <h4 className="font-bold text-center text-black mb-2">Profile Section</h4>
                        <ul className="list-disc pl-4 space-y-1 text-gray-700 text-sm">
                          <li>View your personal information</li>
                          <li>Edit details when needed</li>
                          <li>Update contact information</li>
                        </ul>
                      </div>
                      <div className="bg-white p-5 rounded-lg border border-gray-200">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3 mx-auto">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h4 className="font-bold text-center text-black mb-2">Loyalty Wallet</h4>
                        <ul className="list-disc pl-4 space-y-1 text-gray-700 text-sm">
                          <li>Check your current points balance</li>
                          <li>View points history and transactions</li>
                          <li>Track earned and used points</li>
                        </ul>
                      </div>
                      <div className="bg-white p-5 rounded-lg border border-gray-200">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3 mx-auto">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l5-5m0 10l-5-5m5-5h12" />
                          </svg>
                        </div>
                        <h4 className="font-bold text-center text-black mb-2">Offers & Vouchers</h4>
                        <ul className="list-disc pl-4 space-y-1 text-gray-700 text-sm">
                          <li>See active personalized offers</li>
                          <li>View general offers available</li>
                          <li>Access available vouchers</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-2xl font-bold text-black mb-4">Earning and Using Loyalty Points</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 shadow-sm">
                      <h4 className="font-bold text-lg text-black mb-3 flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2 1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        How Points Work
                      </h4>
                      <p className="text-gray-700 mb-4 text-sm">
                        Our loyalty program works on a simple principle: you earn points for every purchase you make,
                        which can then be redeemed for valuable rewards.
                      </p>
                      <ul className="space-y-2">
                        {[
                          { icon: 'M5 13l4 4L19 7', text: 'Default rate: €1 spent = 1 loyalty point earned' },
                          { icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', text: 'Points are added to your account after purchases' },
                          { icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', text: 'Points are tracked automatically in your wallet' },
                          { icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', text: 'Points never expire as long as your account remains active' },
                        ].map((item, index) => (
                          <li key={index} className="flex items-start">
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                              </svg>
                            </div>
                            <span className="text-gray-700 text-sm">{item.text}</span>
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
                        Redeeming Points
                      </h4>
                      <p className="text-gray-700 mb-4 text-sm">
                        When you have enough points, you can exchange them for vouchers to use at our store.
                      </p>
                      <div className="space-y-3">
                        {[
                          { text: 'Check your points balance in the dashboard' },
                          { text: 'Contact our staff for point redemption' },
                          { text: 'Admin converts points to unique voucher code' },
                          { text: 'Use voucher code at checkout to get discount' },
                        ].map((step, index) => (
                          <div key={index} className="flex items-start">
                            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0 text-xs">
                              {index + 1}
                            </div>
                            <span className="text-gray-700 text-sm">{step.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-2xl font-bold text-black mb-4">Managing Your Account</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-200 shadow-sm">
                      <h4 className="font-bold text-lg text-black mb-3 flex items-center">
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        Updating Information
                      </h4>
                      <p className="text-gray-700 mb-4 text-sm">
                        Keep your information up-to-date to receive personalized offers and communications.
                      </p>
                      <div className="space-y-3">
                        {[
                          { text: 'Login to your account' },
                          { text: 'Navigate to "Profile" section' },
                          { text: 'Edit your personal information' },
                          { text: 'Save your changes' },
                        ].map((step, index) => (
                          <div key={index} className="flex items-start">
                            <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0 text-xs">
                              {index + 1}
                            </div>
                            <span className="text-gray-700 text-sm">{step.text}</span>
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
                        Communicating with Us
                      </h4>
                      <p className="text-gray-700 mb-4 text-sm">
                        We may send you personalized offers, birthday messages, or important updates via WhatsApp.
                      </p>
                      <ul className="space-y-2">
                        {[
                          { icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z', text: 'Ensure your phone number is current' },
                          { icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z', text: 'Check your messages regularly' },
                          { icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z', text: 'Opt-out anytime if you don\'t wish to receive updates' },
                        ].map((item, index) => (
                          <li key={index} className="flex items-start">
                            <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                              </svg>
                            </div>
                            <span className="text-gray-700 text-sm">{item.text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-2xl font-bold text-black mb-4">FAQs for Customers</h3>
                  <div className="space-y-4">
                    {[
                      {
                        question: "How do I check my points balance?",
                        answer: "Log in to your account and visit your dashboard to see your current points balance and history."
                      },
                      {
                        question: "Do my points expire?",
                        answer: "No, your points do not expire as long as your account remains active."
                      },
                      {
                        question: "How do I redeem my points for rewards?",
                        answer: "Contact our staff at the store, and they will help convert your points to a voucher code."
                      },
                      {
                        question: "What if I forget my password?",
                        answer: "Use the 'Forgot Password' link on the login page to reset your password via email."
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
            Back to Home
          </Link>
        </motion.div>
      </div>
    </div>
  );
}