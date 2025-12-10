"use client";

import WaitlistLanding from "../../components/home/WaitlistLanding";
import ThemeWrapper from '@/components/themes/ThemeWrapper';
import Hero from '@/components/home/Hero';
import About from '@/components/home/About';
import CategoriesSection from '@/components/home/CategoriesSection';
import OffersSection from '@/components/home/OffersSection';
import ReviewsSection from '@/components/home/ReviewsSection';
import ContactSection from '@/components/home/ContactSection';
import GallerySection from '@/components/home/GallerySection';
import PopupOffer from '@/components/home/PopupOffer';
import Navbar from '@/components/home/Navbar';

export default function Home() {
  const isMaintenance = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true';

  if (isMaintenance) {
    return (
      <ThemeWrapper>
        <WaitlistLanding />
      </ThemeWrapper>
    );
  }

  return (
    <ThemeWrapper>
      <Navbar />
      <Hero />
      <About />
      <CategoriesSection />
      <OffersSection />
      <GallerySection />
      <ReviewsSection />
      <ContactSection />
      <PopupOffer />
    </ThemeWrapper>
  );
}
