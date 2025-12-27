import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Toaster } from 'sonner';
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import QRTracker from "@/components/QRTracker";
import { Suspense } from "react";
import JsonLd from "@/components/JsonLd";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL('https://www.barakasrl.it'),
  title: {
    default: "Baraka Loyalty | Piattaforma Fedeltà Clienti",
    template: "%s | Baraka Loyalty"
  },
  description: "Sistema di fedeltà e gestione clienti Baraka. Unisciti per premi esclusivi, sconti e offerte speciali.",
  keywords: ["Baraka", "Loyalty", "Fedeltà", "Clienti", "Macelleria", "Halal", "Premi", "Sconti"],
  authors: [{ name: "Baraka S.R.L." }],
  creator: "Baraka S.R.L.",
  publisher: "Baraka S.R.L.",
  openGraph: {
    title: "Baraka Loyalty",
    description: "La tua piattaforma di fiducia per la fedeltà e le offerte esclusive.",
    url: 'https://www.barakasrl.it',
    siteName: 'Baraka Loyalty',
    images: [
      {
        url: '/logo.jpeg', // Make sure this image is high quality
        width: 800,
        height: 600,
        alt: 'Baraka Logo',
      },
    ],
    locale: 'it_IT',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Baraka Loyalty",
    description: "Sistema di fedeltà e gestione clienti Baraka",
    images: ['/logo.jpeg'],
  },
  icons: {
    icon: [{ url: '/logo.jpeg', type: 'image/jpeg' }],
    apple: [{ url: '/logo.jpeg', type: 'image/jpeg' }],
  },
  alternates: {
    canonical: 'https://www.barakasrl.it',
    languages: {
      'it-IT': 'https://www.barakasrl.it/it',
      'en-US': 'https://www.barakasrl.it/en',
      'fr-FR': 'https://www.barakasrl.it/fr',
      'es-ES': 'https://www.barakasrl.it/es',
      'ar-SA': 'https://www.barakasrl.it/ar',
    },
  },
  verification: {
    google: 'S4KvEWAugH6so1ySUYlYxDzrZFHrgw6G72WIaqvRtyI',
  },
};

export default async function RootLayout({ children, params }) {
  const { locale } = await params;
  const messages = await getMessages();
  const direction = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <>
      <div dir={direction} className="min-h-screen" suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <JsonLd />
          <Suspense fallback={null}>
            <QRTracker />
          </Suspense>
          {children}
          <Toaster />
        </NextIntlClientProvider>
      </div>
      <SpeedInsights />
      <Analytics />
    </>
  );
}
