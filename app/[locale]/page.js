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
const GlobalSourcing = dynamic(() => import('@/components/home/GlobalSourcing'));
const CategoriesSection = dynamic(() => import('@/components/home/CategoriesSection'));
const OffersSection = dynamic(() => import('@/components/home/OffersSection'));
const ReviewsSection = dynamic(() => import('@/components/home/ReviewsSection'));
const ContactSection = dynamic(() => import('@/components/home/ContactSection'));
const GallerySection = dynamic(() => import('@/components/home/GallerySection'));
const PopupOffer = dynamic(() => import('@/components/home/PopupOffer'));
const Navbar = dynamic(() => import('@/components/home/Navbar'));
const Footer = dynamic(() => import('@/components/home/Footer'));
const MacbookScroll = dynamic(() => import('@/components/ui/macbook-scroll').then(mod => mod.MacbookScroll));

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
      <div className="overflow-hidden w-full dark:bg-[#0B0B0F] bg-white">
        <MacbookScroll
          src="https://indian-retailer.s3.ap-south-1.amazonaws.com/s3fs-public/2021-09/5.jpg"
          showGradient={false}
          title={<span className="text-4xl font-bold text-neutral-800 dark:text-white">Explore Our New Store</span>}
        />
      </div>
      <About />
      <GlobalSourcing />
      {/* <CategoriesSection /> */}
      <PaymentMethodsBox />
      <OffersSection />
      <GallerySection />
      <ReviewsSection />
      <ContactSection />
      <PopupOffer />
      <Footer />
    </ThemeWrapper>
  );
}
