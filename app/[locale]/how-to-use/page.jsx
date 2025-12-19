"use client";

import { useTranslations } from "next-intl";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";
import { Link } from "@/navigation";
import { User, ShieldCheck, ArrowRight } from "lucide-react";

export default function HowToUseLandingPage() {
  const t = useTranslations('HowToUse');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <BackgroundBeamsWithCollision className="flex-1 flex flex-col justify-center items-center p-4 bg-neutral-950">
        <div className="relative z-10 text-center max-w-4xl mx-auto mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            {t('Overview.what_title')}
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            {t('Overview.what_desc')}
          </p>
        </div>

        <div className="relative z-10 grid md:grid-cols-2 gap-8 max-w-4xl w-full">
          <Link href="/how-to-use/user" className="group">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 hover:bg-white/20 transition-all duration-300 h-full flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <User className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">{t('Overview.customer_title')}</h2>
              <p className="text-white/80 mb-6 flex-grow">
                {t('Overview.customer_list.0')}
              </p>
              <span className="inline-flex items-center text-white font-semibold group-hover:translate-x-1 transition-transform">
                {t('Overview.customer_title')} <ArrowRight className="w-4 h-4 ml-2" />
              </span>
            </div>
          </Link>

          <Link href="/how-to-use/admin" className="group">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 hover:bg-white/20 transition-all duration-300 h-full flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">{t('Overview.business_title')}</h2>
              <p className="text-white/80 mb-6 flex-grow">
                {t('Overview.business_list.0')}
              </p>
              <span className="inline-flex items-center text-white font-semibold group-hover:translate-x-1 transition-transform">
                {t('Overview.business_title')} <ArrowRight className="w-4 h-4 ml-2" />
              </span>
            </div>
          </Link>
        </div>
      </BackgroundBeamsWithCollision>
    </div>
  );
}