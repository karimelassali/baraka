// app/admin/campaigns/page.jsx
"use client";

import WhatsAppCampaign from '../../../../components/admin/WhatsAppCampaign';


export default function AdminCampaignsPage() {




  return (
    <>
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">WhatsApp Campaigns</h1>
        <p className="text-gray-600">Create and manage WhatsApp messaging campaigns</p>
        <div className="w-24 h-1 bg-indigo-500 mx-auto mt-4 rounded-full"></div>
      </div>

      <div className="max-w-6xl mx-auto">
        <WhatsAppCampaign />

      </div>
    </>
  );
}