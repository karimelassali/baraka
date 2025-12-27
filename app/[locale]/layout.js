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
    default: "Baraka | Macelleria Halal & Alimentari dal Mondo - Castel San Giovanni",
    template: "%s | Baraka Store"
  },
  description: "Benvenuti da Baraka a Castel San Giovanni. Scopri la nostra macelleria Halal di prima scelta e prodotti alimentari internazionali. Qualità, freschezza e un programma fedeltà esclusivo.",
  keywords: ["Baraka", "Macelleria Halal", "Supermercato", "Alimentari", "Castel San Giovanni", "Piacenza", "Carne Fresca", "Prodotti Internazionali", "Fedeltà"],
  authors: [{ name: "Baraka" }],
  creator: "Baraka",
  publisher: "Baraka",
  openGraph: {
    title: "Baraka | Il Tuo Negozio di Fiducia a Castel San Giovanni",
    description: "Macelleria Halal, alimentari internazionali e qualità superiore. Vieni a trovarci in Via Borgonovo 1.",
    url: 'https://www.barakasrl.it',
    siteName: 'Baraka C.S.G.',
    images: [
      {
        url: '/logo.jpeg',
        width: 800,
        height: 800,
        alt: 'Baraka Logo Ufficiale',
      },
    ],
    locale: 'it_IT',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Baraka Store | Qualità e Tradizione",
    description: "Macelleria Halal e prodotti dal mondo a Castel San Giovanni.",
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
