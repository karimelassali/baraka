import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import TranslateWidget from "../components/ui/TranslateWidget";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Baraka Loyalty",
  description: "Sistema di fedeltà e gestione clienti Baraka",
  icons: {
    icon: "/logo.jpeg",
    apple: "/logo.jpeg",
  },
};

export default function RootLayout({ children }) {
  return ( 
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <div className="fixed bottom-4 right-4 z-50">
          {/* <TranslateWidget /> */}
        </div>
      </body>
    </html>
  );
}
