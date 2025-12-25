import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import WaitlistLanding from "../../components/home/WaitlistLanding";
import ThemeWrapper from '@/components/themes/ThemeWrapper';
import { getTheme } from '@/lib/data/theme';
import QRTracker from '@/components/home/QRTracker';
import PaymentMethodsBox from '@/components/client/PaymentMethodsBox';
import Navbar from '@/components/home/Navbar';
import Hero from '@/components/home/Hero';

// Dynamically import components to optimize bundle size
const About = dynamic(() => import('@/components/home/About'));
const GlobalSourcing = dynamic(() => import('@/components/home/GlobalSourcing'));
const CategoriesSection = dynamic(() => import('@/components/home/CategoriesSection'));
const OffersSection = dynamic(() => import('@/components/home/OffersSection'));
const ReviewsSection = dynamic(() => import('@/components/home/ReviewsSection'));
const ContactSection = dynamic(() => import('@/components/home/ContactSection'));
const GallerySection = dynamic(() => import('@/components/home/GallerySection'));
const PopupOffer = dynamic(() => import('@/components/home/PopupOffer'));
const Footer = dynamic(() => import('@/components/home/Footer'));
const FloatingActionButtons = dynamic(() => import('@/components/home/FloatingActionButtons'));

export default async function Home() {
  const isMaintenance = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true';
  const { theme } = await getTheme();

  if (isMaintenance) {
    return (
      <ThemeWrapper initialTheme={theme}>
        <WaitlistLanding />
      </ThemeWrapper>
    );
  }

  return (
    <ThemeWrapper initialTheme={theme}>
      <Suspense fallback={null}>
        <QRTracker />
      </Suspense>
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <About />
        <PaymentMethodsBox />
        <GlobalSourcing />
        {/* <CategoriesSection /> */}
        <OffersSection />
        <GallerySection />
        <ReviewsSection />
        <ContactSection />
      </main>
      <PopupOffer />
      <FloatingActionButtons />
      <Footer />
    </ThemeWrapper>
  );
}
