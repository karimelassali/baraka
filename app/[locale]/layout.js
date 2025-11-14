// app/[locale]/layout.js
'use client';
import { I18nProvider } from '../../lib/i18n';
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import TranslateWidget from "../../components/ui/TranslateWidget";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function LocaleLayout({ children, params: { locale } }) {
  return (
    <I18nProvider locale={locale}>
      <div className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <div className="fixed bottom-4 right-4 z-50">
          <TranslateWidget />
        </div>
      </div>
    </I18nProvider>
  );
}
