"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import TranslateWidget from "../../components/ui/TranslateWidget";

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
            className={`px-6 py-3 font-medium text-lg ${
              activeTab === "overview"
                ? "text-red-600 border-b-2 border-red-600"
                : "text-gray-600 hover:text-red-600"
            }`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
          <button
            className={`px-6 py-3 font-medium text-lg ${
              activeTab === "admin"
                ? "text-red-600 border-b-2 border-red-600"
                : "text-gray-600 hover:text-red-600"
            }`}
            onClick={() => setActiveTab("admin")}
          >
            Admin Guide
          </button>
          <button
            className={`px-6 py-3 font-medium text-lg ${
              activeTab === "client"
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
                  <h3 className="text-2xl font-bold text-black mb-4">What is Baraka Platform?</h3>
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
                  <h3 className="text-2xl font-bold text-black mb-4">Why Use Baraka Platform?</h3>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li>Build customer loyalty and retention through points-based rewards</li>
                    <li>Increase customer engagement with personalized offers and communications</li>
                    <li>Easily manage customer information and track their interactions</li>
                    <li>Improve customer communication through integrated WhatsApp messaging</li>
                    <li>Track sales performance with comprehensive analytics</li>
                    <li>Support for multiple languages to serve diverse communities</li>
                    <li>GDPR-compliant data handling to ensure customer privacy</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-2xl font-bold text-black mb-4">When to Use Baraka Platform?</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-red-50 p-6 rounded-lg">
                      <h4 className="font-bold text-lg text-black mb-3">For Business Owners</h4>
                      <ul className="list-disc pl-6 space-y-2 text-gray-700">
                        <li>Launching a new retail business</li>
                        <li>Looking to increase customer retention</li>
                        <li>Wanting to gather customer data for marketing</li>
                        <li>Needing to manage customer communications</li>
                        <li>Expanding to serve diverse linguistic communities</li>
                      </ul>
                    </div>
                    <div className="bg-blue-50 p-6 rounded-lg">
                      <h4 className="font-bold text-lg text-black mb-3">For Customers</h4>
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
                  <h3 className="text-2xl font-bold text-black mb-4">How Does It Work?</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                      <div className="text-red-600 text-3xl font-bold mb-3">1</div>
                      <h4 className="font-bold text-lg text-black mb-2">Customer Registration</h4>
                      <p className="text-gray-700">
                        Customers register with personal information and consent to data processing
                      </p>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                      <div className="text-red-600 text-3xl font-bold mb-3">2</div>
                      <h4 className="font-bold text-lg text-black mb-2">Loyalty Points</h4>
                      <p className="text-gray-700">
                        Customers earn points based on purchases which can be redeemed for rewards
                      </p>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                      <div className="text-red-600 text-3xl font-bold mb-3">3</div>
                      <h4 className="font-bold text-lg text-black mb-2">Admin Management</h4>
                      <p className="text-gray-700">
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
                    <div className="bg-red-50 p-6 rounded-lg">
                      <h4 className="font-bold text-lg text-black mb-3">Customer Management</h4>
                      <ul className="list-disc pl-6 space-y-2 text-gray-700">
                        <li>View all registered customers</li>
                        <li>Filter by name, country of origin, or residence</li>
                        <li>Add new customers (if needed)</li>
                        <li>Edit customer information</li>
                        <li>View customer history and engagement</li>
                      </ul>
                    </div>
                    <div className="bg-blue-50 p-6 rounded-lg">
                      <h4 className="font-bold text-lg text-black mb-3">Loyalty Points System</h4>
                      <ul className="list-disc pl-6 space-y-2 text-gray-700">
                        <li>Add points to customer accounts</li>
                        <li>Deduct points as needed</li>
                        <li>View complete points history</li>
                        <li>Configure points calculation formula</li>
                        <li>Convert points to vouchers</li>
                      </ul>
                    </div>
                    <div className="bg-green-50 p-6 rounded-lg">
                      <h4 className="font-bold text-lg text-black mb-3">Offers Management</h4>
                      <ul className="list-disc pl-6 space-y-2 text-gray-700">
                        <li>Create weekly offers</li>
                        <li>Set up permanent offers</li>
                        <li>Configure multi-language descriptions</li>
                        <li>Set visibility periods for offers</li>
                        <li>Target offers to specific customer groups</li>
                      </ul>
                    </div>
                    <div className="bg-yellow-50 p-6 rounded-lg">
                      <h4 className="font-bold text-lg text-black mb-3">Reviews & Communications</h4>
                      <ul className="list-disc pl-6 space-y-2 text-gray-700">
                        <li>Moderate customer reviews</li>
                        <li>Approve or hide reviews</li>
                        <li>Send WhatsApp campaigns</li>
                        <li>Send birthday messages</li>
                        <li>Target messages by nationality</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-2xl font-bold text-black mb-4">How to Manage Customers</h3>
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <ol className="list-decimal pl-6 space-y-3 text-gray-700">
                      <li>Navigate to the "Customers" section in the admin dashboard</li>
                      <li>View the complete list of registered customers with their details</li>
                      <li>Use filters to search for specific customers by name, country, or residence</li>
                      <li>Click on a customer to view their profile, points history, and purchase history</li>
                      <li>Update customer information as needed</li>
                      <li>If necessary, add or deduct loyalty points to their account</li>
                    </ol>
                  </div>
                </section>

                <section>
                  <h3 className="text-2xl font-bold text-black mb-4">How to Process Loyalty Points</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-bold text-lg text-black mb-3">Adding Points</h4>
                      <ol className="list-decimal pl-6 space-y-2 text-gray-700">
                        <li>Go to the "Points" section in the admin dashboard</li>
                        <li>Select "Add Points" option</li>
                        <li>Search and select the customer</li>
                        <li>Enter the purchase amount (default formula: €1 = 1 point)</li>
                        <li>Confirm the transaction</li>
                        <li>Points will be added to the customer's account immediately</li>
                      </ol>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-black mb-3">Converting to Vouchers</h4>
                      <ol className="list-decimal pl-6 space-y-2 text-gray-700">
                        <li>Access the customer's loyalty wallet</li>
                        <li>Click on "Create Voucher" option</li>
                        <li>Specify the point value to convert</li>
                        <li>System generates a unique voucher code</li>
                        <li>Share the voucher with the customer</li>
                        <li>Track voucher usage in the system</li>
                      </ol>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-2xl font-bold text-black mb-4">Sending WhatsApp Messages</h3>
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <p className="text-gray-700 mb-4">
                      The platform integrates with WhatsApp Business API to enable direct communication with customers.
                    </p>
                    <ol className="list-decimal pl-6 space-y-3 text-gray-700">
                      <li>Navigate to the "Campaigns" section in the admin dashboard</li>
                      <li>Select the type of message (Promotional, Birthday, Nationality-targeted)</li>
                      <li>Choose the target customer group using filters</li>
                      <li>Select from approved WhatsApp templates</li>
                      <li>Customize the message content as needed</li>
                      <li>Send the message and monitor delivery status in the logs</li>
                    </ol>
                    <p className="text-gray-700 mt-4">
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
                    <div className="bg-red-50 p-6 rounded-lg">
                      <h4 className="font-bold text-lg text-black mb-3">Required Information</h4>
                      <ul className="list-disc pl-6 space-y-2 text-gray-700">
                        <li>First name and last name</li>
                        <li>Date of birth</li>
                        <li>Residence address</li>
                        <li>Phone number</li>
                        <li>Email address</li>
                        <li>Country of origin</li>
                        <li>GDPR consent confirmation</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-black mb-3">Registration Steps</h4>
                      <ol className="list-decimal pl-6 space-y-2 text-gray-700">
                        <li>Click "Register" button on the homepage</li>
                        <li>Fill in all required information</li>
                        <li>Agree to GDPR consent requirements</li>
                        <li>Submit your registration form</li>
                        <li>Check your email or WhatsApp for confirmation</li>
                        <li>Log in to your new account</li>
                      </ol>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-2xl font-bold text-black mb-4">Using Your Customer Dashboard</h3>
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <p className="text-gray-700 mb-4">
                      Once logged in, your customer dashboard becomes your central hub for managing your loyalty rewards.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <h4 className="font-bold text-lg text-black mb-2">Profile Section</h4>
                        <ul className="list-disc pl-6 space-y-2 text-gray-700">
                          <li>View your personal information</li>
                          <li>Edit details when needed</li>
                          <li>Update contact information</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-bold text-lg text-black mb-2">Loyalty Wallet</h4>
                        <ul className="list-disc pl-6 space-y-2 text-gray-700">
                          <li>Check your current points balance</li>
                          <li>View points history and transactions</li>
                          <li>Track earned and used points</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-bold text-lg text-black mb-2">Offers & Vouchers</h4>
                        <ul className="list-disc pl-6 space-y-2 text-gray-700">
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
                    <div>
                      <h4 className="font-bold text-lg text-black mb-3">How Points Work</h4>
                      <p className="text-gray-700 mb-4">
                        Our loyalty program works on a simple principle: you earn points for every purchase you make, 
                        which can then be redeemed for valuable rewards.
                      </p>
                      <ul className="list-disc pl-6 space-y-2 text-gray-700">
                        <li>Default rate: €1 spent = 1 loyalty point earned</li>
                        <li>Points are added to your account after purchases</li>
                        <li>Points are tracked automatically in your wallet</li>
                        <li>Points never expire as long as your account remains active</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-black mb-3">Redeeming Points</h4>
                      <p className="text-gray-700 mb-4">
                        When you have enough points, you can exchange them for vouchers to use at our store.
                      </p>
                      <ol className="list-decimal pl-6 space-y-2 text-gray-700">
                        <li>Check your points balance in the dashboard</li>
                        <li>Contact our staff for point redemption</li>
                        <li>Admin converts points to unique voucher code</li>
                        <li>Use voucher code at checkout to get discount</li>
                      </ol>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-2xl font-bold text-black mb-4">Managing Your Account</h3>
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-bold text-lg text-black mb-3">Updating Information</h4>
                        <p className="text-gray-700 mb-4">
                          Keep your information up-to-date to receive personalized offers and communications.
                        </p>
                        <ol className="list-decimal pl-6 space-y-2 text-gray-700">
                          <li>Login to your account</li>
                          <li>Navigate to "Profile" section</li>
                          <li>Edit your personal information</li>
                          <li>Save your changes</li>
                        </ol>
                      </div>
                      <div>
                        <h4 className="font-bold text-lg text-black mb-3">Communicating with Us</h4>
                        <p className="text-gray-700 mb-4">
                          We may send you personalized offers, birthday messages, or important updates via WhatsApp.
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-gray-700">
                          <li>Ensure your phone number is current</li>
                          <li>Check your messages regularly</li>
                          <li>Opt-out anytime if you don't wish to receive updates</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-2xl font-bold text-black mb-4">FAQs for Customers</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-bold text-lg text-black">How do I check my points balance?</h4>
                      <p className="text-gray-700 pl-4">Log in to your account and visit your dashboard to see your current points balance and history.</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-black">Do my points expire?</h4>
                      <p className="text-gray-700 pl-4">No, your points do not expire as long as your account remains active.</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-black">How do I redeem my points for rewards?</h4>
                      <p className="text-gray-700 pl-4">Contact our staff at the store, and they will help convert your points to a voucher code.</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-black">What if I forget my password?</h4>
                      <p className="text-gray-700 pl-4">Use the "Forgot Password" link on the login page to reset your password via email.</p>
                    </div>
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