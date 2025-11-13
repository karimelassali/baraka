"use client";
import Image from "next/image";
import Gallery from "../components/ui/Gallery";
import Hours from "../components/ui/Hours";
import WhatsAppButton from "../components/ui/WhatsAppButton";
import ContactOptions from "../components/ui/ContactOptions";
import TranslateWidget from "../components/ui/TranslateWidget";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  // Business information from infos file
  const businessInfo = {
    name: "Baraka",
    phone: "+393245668944",
    address: "Via Salvador Allende, 4, 29015 Castel San Giovanni PC, Italy",
    mapLink: "https://maps.app.goo.gl/3C6QCM", // Placeholder - would need real maps link
  };

  // Sample reviews data
  const reviews = [
    {
      id: 1,
      name: "Maria R.",
      rating: 5,
      comment: "Great service and quality products!",
      date: "2024-05-15",
    },
    {
      id: 2,
      name: "Giuseppe M.",
      rating: 4,
      comment: "Fast delivery and friendly staff.",
      date: "2024-05-10",
    },
    {
      id: 3,
      name: "Sofia L.",
      rating: 5,
      comment: "Love their weekly offers, always a good deal!",
      date: "2024-05-08",
    },
    {
      id: 4,
      name: "Marco T.",
      rating: 4,
      comment: "Excellent customer support, they solved my issue quickly.",
      date: "2024-05-05",
    },
    {
      id: 5,
      name: "Elena F.",
      rating: 5,
      comment: "Beautiful products and attention to detail.",
      date: "2024-05-01",
    },
    {
      id: 6,
      name: "Roberto P.",
      rating: 4,
      comment: "Good value for money, will definitely come back.",
      date: "2024-04-28",
    },
    {
      id: 7,
      name: "Lucia B.",
      rating: 5,
      comment: "The permanent offers section has great deals.",
      date: "2024-04-25",
    },
    {
      id: 8,
      name: "Alessandro C.",
      rating: 4,
      comment: "Convenient location and easy parking.",
      date: "2024-04-20",
    },
    {
      id: 9,
      name: "Francesca D.",
      rating: 5,
      comment: "The customer service is top-notch.",
      date: "2024-04-18",
    },
    {
      id: 10,
      name: "Daniele G.",
      rating: 4,
      comment: "Quality products at fair prices.",
      date: "2024-04-15",
    },
    {
      id: 11,
      name: "Valentina S.",
      rating: 5,
      comment: "Quick turnaround on orders.",
      date: "2024-04-12",
    },
    {
      id: 12,
      name: "Thomas V.",
      rating: 4,
      comment: "Great experience, will recommend to friends.",
      date: "2024-04-10",
    },
    {
      id: 13,
      name: "Giulia N.",
      rating: 5,
      comment: "The gallery shows amazing products.",
      date: "2024-04-08",
    },
    {
      id: 14,
      name: "Luca F.",
      rating: 4,
      comment: "Professional and efficient service.",
      date: "2024-04-05",
    },
    {
      id: 15,
      name: "Chiara Z.",
      rating: 5,
      comment: "Perfect place for all my shopping needs.",
      date: "2024-04-03",
    },
    {
      id: 16,
      name: "Antonio M.",
      rating: 4,
      comment: "The WhatsApp support is very convenient.",
      date: "2024-04-01",
    },
    {
      id: 17,
      name: "Elisa R.",
      rating: 5,
      comment: "Always find what I'm looking for here.",
      date: "2024-03-28",
    },
    {
      id: 18,
      name: "Simone B.",
      rating: 4,
      comment: "Good variety of products to choose from.",
      date: "2024-03-25",
    },
    {
      id: 19,
      name: "Alessia P.",
      rating: 5,
      comment: "Clean store and helpful staff.",
      date: "2024-03-20",
    },
    {
      id: 20,
      name: "Matteo L.",
      rating: 4,
      comment: "Will definitely return for future purchases.",
      date: "2024-03-18",
    },
  ];

  // Sample offers data
  const weeklyOffers = [
    {
      id: 1,
      name: "Premium Product A",
      originalPrice: 29.99,
      salePrice: 19.99,
      badge: "25% OFF",
    },
    {
      id: 2,
      name: "Deluxe Item B",
      originalPrice: 49.99,
      salePrice: 34.99,
      badge: "30% OFF",
    },
    {
      id: 3,
      name: "Special Edition C",
      originalPrice: 79.99,
      salePrice: 59.99,
      badge: "25% OFF",
    },
  ];

  const permanentOffers = [
    {
      id: 1,
      name: "Basic Product X",
      originalPrice: 19.99,
      salePrice: 14.99,
      badge: "BEST VALUE",
    },
    {
      id: 2,
      name: "Standard Item Y",
      originalPrice: 34.99,
      salePrice: 29.99,
      badge: "NEW",
    },
    {
      id: 3,
      name: "Classic Model Z",
      originalPrice: 59.99,
      salePrice: 49.99,
      badge: "SALE",
    },
  ];

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

  const slideIn = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
  };

  const bounce = {
    hidden: { y: 0 },
    visible: {
      y: [-10, 0, -10],
      transition: {
        repeat: Infinity,
        duration: 1.5,
        ease: "easeInOut",
      },
    },
  };

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="bg-gradient-to-b from-white to-gray-100 text-gray-800 font-sans">
      {/* Floating WhatsApp button for easy access */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
      >
        <WhatsAppButton
          phoneNumber={businessInfo.phone}
          message="Hello Baraka!"
        />
      </motion.div>

      {/* Navbar */}
      <motion.header
        className="bg-white shadow-sm sticky top-0 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
            </motion.div>
            <motion.h1
              className="ml-3 text-2xl font-bold text-black"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Baraka
            </motion.h1>
          </div>

          <nav className="hidden md:flex space-x-6">
            {["about", "gallery", "offers", "reviews", "contact"].map(
              (item) => (
                <motion.a
                  key={item}
                  href={`#${item}`}
                  className="text-gray-600 hover:text-red-600 transition"
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </motion.a>
              )
            )}
          </nav>

          <div className="flex items-center space-x-4">
            {/* Add the translate widget here */}
            <div className="mr-2">
              <TranslateWidget />
            </div>
            
            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <motion.svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </motion.svg>
            </button>

            <motion.a
              href="/auth/login"
              className="text-gray-600 hover:text-red-600 transition hidden md:block"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Login
            </motion.a>

            <motion.a
              href="/auth/register"
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-full transition duration-300 text-sm"
              whileHover={{
                scale: 1.05,
                boxShadow: "0px 4px 14px rgba(220, 38, 38, 0.4)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              Register
            </motion.a>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <motion.div
            className="md:hidden bg-white py-4 px-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col space-y-3">
              {["about", "gallery", "offers", "reviews", "contact"].map(
                (item) => (
                  <motion.a
                    key={item}
                    href={`#${item}`}
                    className="text-gray-600 hover:text-red-600 transition py-2"
                    whileHover={{ x: 10 }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                  </motion.a>
                )
              )}
              <motion.a
                href="/auth/login"
                className="text-gray-600 hover:text-red-600 transition py-2"
              >
                Login
              </motion.a>
            </div>
          </motion.div>
        )}
      </motion.header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-red-50 to-white">
        <div className="container mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center">
          <motion.div
            className="md:w-1/2 mb-12 md:mb-0"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black leading-tight">
              Welcome to <span className="text-red-600">Baraka</span>
            </h1>
            <motion.p
              className="text-lg md:text-xl text-gray-700 mt-4 mb-8 max-w-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Your trusted local business offering quality products and services
              with exceptional customer care.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <motion.a
                href="#gallery"
                className="bg-red-600 hover:bg-red-800 text-white font-medium py-3 px-8 rounded-full transition duration-300 text-center"
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0px 8px 20px rgba(220, 38, 38, 0.4)",
                }}
                whileTap={{ scale: 0.95 }}
              >
                View Our Products
              </motion.a>
              <motion.a
                href="#contact"
                className="border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white font-medium py-3 px-8 rounded-full transition duration-300 text-center"
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0px 8px 20px rgba(220, 38, 38, 0.2)",
                }}
                whileTap={{ scale: 0.95 }}
              >
                Contact Us
              </motion.a>
            </motion.div>
          </motion.div>

          <motion.div
            className="md:w-1/2 flex justify-center"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="relative w-full max-w-lg">
              <motion.div
                className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-80 md:h-96"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              />
              <motion.div
                className="absolute -bottom-6 -right-6 bg-white p-4 rounded-xl shadow-lg w-3/4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                whileHover={{ y: -5 }}
              >
                <p className="text-gray-700 italic">
                  &quot;We pride ourselves on quality and customer satisfaction.&quot;
                </p>
                <p className="text-sm text-gray-500 mt-2">- Baraka Team</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* About Section */}
        <section id="about" className="py-16">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
              About Baraka
            </h2>
            <p className="text-lg text-gray-700">
              At Baraka, we are committed to providing our customers with the
              highest quality products and exceptional service. Located in the
              heart of Castel San Giovanni, we have been serving our community
              for years with dedication and care. Our team takes pride in
              offering personalized service and ensuring every customer leaves
              satisfied.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-black mb-2">
                Quality Products
              </h3>
              <p className="text-gray-700">
                We carefully select each product to ensure the highest
                standards.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-black mb-2">
                Best Service
              </h3>
              <p className="text-gray-700">
                Our team is dedicated to providing personalized attention.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-black mb-2">
                Customer Care
              </h3>
              <p className="text-gray-700">
                Your satisfaction is our top priority.
              </p>
            </div>
          </div>
        </section>

        {/* Location Section with Google Maps */}
        <section
          id="location"
          className="py-16 bg-red-50 rounded-2xl p-6 my-16"
        >
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-black mb-12">
              Visit Our Store
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-xl font-bold text-black mb-4">
                  Our Address
                </h3>
                <p className="text-gray-800 mb-4">{businessInfo.address}</p>
                <a
                  href={businessInfo.mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-red-600 hover:text-red-800 font-medium"
                >
                  Open in Google Maps
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 ml-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>

                <h3 className="text-xl font-bold text-black mt-8 mb-4">
                  Opening Hours
                </h3>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <Hours />
                </div>
              </div>
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-80 flex items-center justify-center">
                <p className="text-gray-500">Google Maps Integration</p>
              </div>
            </div>
          </div>
        </section>

        {/* Gallery Section */}
        <section id="gallery" className="py-16">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-black">
              Our Gallery
            </h2>
            <a href="#" className="text-red-600 hover:text-red-800 font-medium">
              View All
            </a>
          </div>
          <Gallery />
        </section>

        {/* Offers Section */}
        <section id="offers" className="py-16">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-black mb-16">
            Special Offers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            {/* Weekly Offers */}
            <div>
              <h3 className="text-2xl font-bold text-black mb-8 flex items-center">
                <span className="bg-red-100 text-red-800 text-xs font-semibold px-3 py-1 rounded mr-3">
                  WEEKLY
                </span>
                Weekly Offers
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                {weeklyOffers.map((offer) => (
                  <div
                    key={offer.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex"
                  >
                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-24 h-24 mr-6" />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="text-lg font-bold text-black">
                          {offer.name}
                        </h4>
                        <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                          {offer.badge}
                        </span>
                      </div>
                      <div className="mt-2 flex items-baseline">
                        <span className="text-2xl font-bold text-black">
                          €{offer.salePrice}
                        </span>
                        <span className="text-gray-500 line-through ml-2">
                          €{offer.originalPrice}
                        </span>
                      </div>
                      <button className="mt-4 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-full transition duration-300 text-sm">
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Permanent Offers */}
            <div>
              <h3 className="text-2xl font-bold text-black mb-8 flex items-center">
                <span className="bg-black text-white text-xs font-semibold px-3 py-1 rounded mr-3">
                  PERMANENT
                </span>
                Permanent Offers
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                {permanentOffers.map((offer) => (
                  <div
                    key={offer.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex"
                  >
                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-24 h-24 mr-6" />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="text-lg font-bold text-black">
                          {offer.name}
                        </h4>
                        <span className="bg-black text-white text-xs font-semibold px-2.5 py-0.5 rounded">
                          {offer.badge}
                        </span>
                      </div>
                      <div className="mt-2 flex items-baseline">
                        <span className="text-2xl font-bold text-black">
                          €{offer.salePrice}
                        </span>
                        <span className="text-gray-500 line-through ml-2">
                          €{offer.originalPrice}
                        </span>
                      </div>
                      <button className="mt-4 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-full transition duration-300 text-sm">
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <section id="reviews" className="py-16">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-black">
              Customer Reviews
            </h2>
            <div className="flex space-x-2">
              <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option>Most Recent</option>
                <option>Highest Rating</option>
                <option>Lowest Rating</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center mb-4">
                  <div className="bg-gray-200 border-2 border-dashed rounded-full w-10 h-10" />
                  <div className="ml-4">
                    <h4 className="font-bold text-black">{review.name}</h4>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          xmlns="http://www.w3.org/2000/svg"
                          className={`h-5 w-5 ${
                            i < review.rating
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }`}
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">{review.comment}</p>
                <p className="text-gray-400 text-xs mt-3">{review.date}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-8 rounded-full transition duration-300">
              Load More Reviews
            </button>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-16 bg-red-50 rounded-2xl p-8 my-16">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-black mb-12">
              Contact Us
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <h3 className="text-xl font-bold text-black mb-6">
                  Get in Touch
                </h3>
                <div className="bg-white p-8 rounded-xl shadow-sm">
                  <ContactOptions />
                  <div className="mt-8">
                    <form className="space-y-4">
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-gray-700 mb-2"
                        >
                          Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          placeholder="Your name"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-gray-700 mb-2"
                        >
                          Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          placeholder="Your email"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="message"
                          className="block text-gray-700 mb-2"
                        >
                          Message
                        </label>
                        <textarea
                          id="message"
                          rows="4"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          placeholder="Your message"
                        ></textarea>
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition duration-300"
                      >
                        Send Message
                      </button>
                    </form>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-black mb-6">
                  Contact Options
                </h3>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="bg-red-100 p-3 rounded-lg mr-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-red-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-black">Phone</h4>
                      <a
                        href={`tel:${businessInfo.phone}`}
                        className="text-gray-700 hover:text-red-600"
                      >
                        {businessInfo.phone}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-red-100 p-3 rounded-lg mr-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-red-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-black">Email</h4>
                      <a
                        href="mailto:contact@baraka.com"
                        className="text-gray-700 hover:text-red-600"
                      >
                        contact@baraka.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-red-100 p-3 rounded-lg mr-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-red-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-black">Address</h4>
                      <p className="text-gray-700">{businessInfo.address}</p>
                      <a
                        href={businessInfo.mapLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-red-600 hover:text-red-800 mt-1 inline-block"
                      >
                        View on map
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-green-100 p-3 rounded-lg mr-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-green-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-black">WhatsApp</h4>
                      <p className="text-gray-700">
                        Chat with us directly on WhatsApp
                      </p>
                      <div className="mt-3">
                        <WhatsAppButton
                          phoneNumber={businessInfo.phone}
                          message="Hello Baraka!"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-black text-white pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center mb-4">
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10" />
                <h3 className="ml-3 text-xl font-bold">Baraka</h3>
              </div>
              <p className="text-gray-300">
                Your trusted local business for quality products and exceptional
                service in Castel San Giovanni.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <a href="#about" className="hover:text-red-400 transition">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#gallery" className="hover:text-red-400 transition">
                    Gallery
                  </a>
                </li>
                <li>
                  <a href="#offers" className="hover:text-red-400 transition">
                    Special Offers
                  </a>
                </li>
                <li>
                  <a href="#reviews" className="hover:text-red-400 transition">
                    Reviews
                  </a>
                </li>
                <li>
                  <a href="#contact" className="hover:text-red-400 transition">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-4">Contact Info</h4>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 mt-0.5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{businessInfo.address}</span>
                </li>
                <li className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.493 1.498a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  <a
                    href={`tel:${businessInfo.phone}`}
                    className="hover:text-red-400"
                  >
                    {businessInfo.phone}
                  </a>
                </li>
                <li className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  <a
                    href="mailto:contact@baraka.com"
                    className="hover:text-red-400"
                  >
                    contact@baraka.com
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-4">Opening Hours</h4>
              <ul className="space-y-2 text-gray-300">
                <li className="flex justify-between">
                  <span>Monday - Friday:</span>
                  <span className="font-medium">9am - 5pm</span>
                </li>
                <li className="flex justify-between">
                  <span>Saturday:</span>
                  <span className="font-medium">10am - 3pm</span>
                </li>
                <li className="flex justify-between">
                  <span>Sunday:</span>
                  <span className="font-medium text-red-500">Closed</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} Baraka. All rights reserved.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a
                  href="/privacy"
                  className="text-gray-400 hover:text-red-400 text-sm"
                >
                  Privacy Policy
                </a>
                <a
                  href="/cookies"
                  className="text-gray-400 hover:text-red-400 text-sm"
                >
                  Cookie Policy
                </a>
                <a
                  href="/terms"
                  className="text-gray-400 hover:text-red-400 text-sm"
                >
                  Terms & Conditions
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
