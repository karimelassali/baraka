// app/admin/campaigns/page.jsx
"use client";

import SmsCampaign from '../../../../components/admin/SmsCampaign';


import { useTranslations } from 'next-intl';

export default function AdminCampaignsPage() {
  const t = useTranslations('Admin.Campaigns');

  return (
    <>
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">📱 {t('title')}</h1>
        <p className="text-gray-600">{t('manage_desc')}</p>
        <div className="w-24 h-1 bg-blue-500 mx-auto mt-4 rounded-full"></div>
      </div>

      <div className="max-w-6xl mx-auto">
        <SmsCampaign />
      </div>
    </>
  );
}