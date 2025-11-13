// app/admin/offers/page.jsx
"use client";

import OfferManagement from '../../../components/admin/OfferManagement';

export default function AdminOffersPage() {
  return (
    <>
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Offer Management</h1>
        <p className="text-gray-600">Create and manage weekly and permanent offers</p>
        <div className="w-24 h-1 bg-blue-500 mx-auto mt-4 rounded-full"></div>
      </div>

      <div className="max-w-6xl mx-auto">
        <OfferManagement />
      </div>
    </>
  );
}