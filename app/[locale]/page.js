"use client";

import { motion } from "framer-motion";
import WhatsAppButton from "../../components/ui/WhatsAppButton";
import Navbar from "../../components/home/Navbar";
import Hero from "../../components/home/Hero";
import About from "../../components/home/About";
import GallerySection from "../../components/home/GallerySection";
import OffersSection from "../../components/home/OffersSection";
import ReviewsSection from "../../components/home/ReviewsSection";
import ContactSection from "../../components/home/ContactSection";
import CategoriesSection from "../../components/home/CategoriesSection";
import PopupOffer from "../../components/home/PopupOffer";
import PaymentMethodsBox from '../../components/client/PaymentMethodsBox';
import ThemeWrapper from '@/components/themes/ThemeWrapper';

import { useTranslations } from 'next-intl';

export default function Home() {
  const t = useTranslations('Home');
  const businessInfo = {
    phone: "+393245668944",
  };

  return (
    <ThemeWrapper>
      <div className="bg-white text-gray-800 font-sans min-h-screen flex flex-col">
        {/* Floating WhatsApp button for easy access */}
        <motion.div
          className="fixed bottom-6 right-6 z-50"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, type: "spring", stiffness: 200 }}
        >
          <WhatsAppButton
            phoneNumber={businessInfo.phone}
            message="Hello Baraka!"
          />
        </motion.div>

        <Navbar />

        <main className="flex-grow">
          <Hero />
          <div className="container mx-auto px-4 py-8">
            <PaymentMethodsBox />
          </div>
          {/* <CategoriesSection /> */}
          <About />
          <GallerySection />
          <OffersSection />
          <ReviewsSection />
          <ContactSection />

        </main>
        <PopupOffer />

        <footer className="bg-gray-900 text-white py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-6 md:mb-0">
                <h2 className="text-2xl font-bold mb-2">Baraka</h2>
                <p className="text-gray-400 text-sm">
                  © {new Date().getFullYear()} Baraka. {t('rights_reserved')}
                </p>
              </div>
              <div className="flex space-x-6">
                <a href="#" className="text-gray-400 hover:text-white transition">{t('privacy_policy')}</a>
                <a href="#" className="text-gray-400 hover:text-white transition">{t('terms_of_service')}</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </ThemeWrapper>
  );
}
