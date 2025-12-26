"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function PaymentMethodsBox() {
  const t = useTranslations('PaymentMethods');

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  const LogoItem = ({ src, alt, className = "" }: { src: string, alt: string, className?: string }) => (
    <div className={`relative h-12 w-20 bg-white rounded-lg border border-gray-100 shadow-sm flex items-center justify-center overflow-hidden hover:shadow-md transition-shadow duration-300 ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-contain p-2"
        sizes="80px"
      />
    </div>
  );

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
    >
      <div className="px-8 pt-8 pb-4 border-b border-gray-100">
        <h3 className="text-2xl font-bold text-gray-900">
          {t('title')}
        </h3>
        <p className="text-gray-500 mt-2 font-medium">
          {t('description')}
        </p>
        <div className="w-20 h-1 bg-red-600 rounded-full mt-4"></div>
      </div>

      <div className="p-8 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
        {/* Cash Section */}
        <motion.div variants={itemVariants} className="space-y-4">
          <h4 className="text-lg font-bold text-gray-800">
            {t('cash.title')}
          </h4>
          <div className="flex flex-wrap gap-3">
            <LogoItem src="/payment/cash.jpg" alt="Cash" />
          </div>
          <p className="text-sm text-gray-500 font-medium">
            {t('cash.standard')}
          </p>
        </motion.div>

        {/* Cards Section */}
        <motion.div variants={itemVariants} className="space-y-4">
          <h4 className="text-lg font-bold text-gray-800">
            {t('cards.title')}
          </h4>
          <div className="flex flex-wrap gap-3">
            <LogoItem src="/payment/VISA-Logo.jpg" alt="Visa" />
            <LogoItem src="/payment/MasterCard_Logo.svg.png" alt="Mastercard" />
            <LogoItem src="/payment/download.png" alt="Maestro" />
            <LogoItem src="/payment/VPay_logo_2015.svg.png" alt="V-Pay" />
          </div>
          <p className="text-sm text-gray-500 font-medium text-red-600">
            {t('cards.contactless')}
          </p>
        </motion.div>

        {/* Meal Vouchers Section */}
        <motion.div variants={itemVariants} className="space-y-4">
          <h4 className="text-lg font-bold text-gray-800">
            {t('vouchers.title')}
          </h4>
          <div className="flex flex-wrap gap-3">
            <LogoItem src="/payment/edenred.png" alt="Edenred" />
            <LogoItem src="/payment/pluxe.png" alt="Pluxee" />
            <LogoItem src="/payment/sodexo.webp" alt="Sodexo" />
            <LogoItem src="/payment/pallegrini.png" alt="Pellegrini" />
            <LogoItem src="/payment/logo_toduba_payoff-1.png" alt="Toduba" />
            <LogoItem src="/payment/dayup.png" alt="DayUp" />
            <LogoItem src="/payment/yesticket.jpg" alt="Yes Ticket" />
          </div>
        </motion.div>

        {/* Digital Payments Section */}
        <motion.div variants={itemVariants} className="space-y-4">
          <h4 className="text-lg font-bold text-gray-800">
            {t('digital.title')}
          </h4>
          <div className="flex flex-wrap gap-3">
            <LogoItem src="/payment/Logo_di_Satispay.svg.png" alt="Satispay" />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
