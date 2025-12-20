import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import WaitlistLanding from "../../components/home/WaitlistLanding";
import ThemeWrapper from '@/components/themes/ThemeWrapper';
import { getTheme } from '@/lib/data/theme';
import QRTracker from '@/components/home/QRTracker';
import PaymentMethodsBox from '@/components/client/PaymentMethodsBox';


// Dynamically import components to optimize bundle size
const Hero = dynamic(() => import('@/components/home/Hero'));
const About = dynamic(() => import('@/components/home/About'));
const CategoriesSection = dynamic(() => import('@/components/home/CategoriesSection'));
const OffersSection = dynamic(() => import('@/components/home/OffersSection'));
const ReviewsSection = dynamic(() => import('@/components/home/ReviewsSection'));
const ContactSection = dynamic(() => import('@/components/home/ContactSection'));
const GallerySection = dynamic(() => import('@/components/home/GallerySection'));
const PopupOffer = dynamic(() => import('@/components/home/PopupOffer'));
const Navbar = dynamic(() => import('@/components/home/Navbar'));
const Footer = dynamic(() => import('@/components/home/Footer'));

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
      <Hero />
      <About />
      {/* <CategoriesSection /> */}
      <PaymentMethodsB ox />
      <OffersSection />
      <GallerySection />
      <ReviewsSection />
      <ContactSection />
      <PopupOffer />
      <Footer />
    </ThemeWrapper>
  );
}
