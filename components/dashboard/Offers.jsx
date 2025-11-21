// components/dashboard/Offers.jsx
"use client";

import { useEffect, useState } from 'react';

function Skeleton() {
  return (
    <div className="p-8 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
      <div className="space-y-4">
        <div className="h-24 bg-gray-200 rounded w-full"></div>
        <div className="h-24 bg-gray-200 rounded w-full"></div>
        <div className="h-24 bg-gray-200 rounded w-full"></div>
      </div>
    </div>
  );
}

export default function Offers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const response = await fetch('/api/offers');
        const data = await response.json();

        if (response.ok) {
          setOffers(data.offers || []);
        } else {
          console.error('Failed to fetch offers:', data.error);
          setOffers([]);
        }
      } catch (error) {
        console.error('An error occurred while fetching offers:', error);
        setOffers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  if (loading) {
    return <Skeleton />;
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Special Offers</h2>
        <span className="bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full font-medium">
          {offers.length} active
        </span>
      </div>
      
      {offers.length > 0 ? (
        <div className="space-y-4">
          {offers.map((offer) => (
            <div 
              key={offer.id} 
              className="p-5 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-100 rounded-xl hover:shadow-md transition-shadow"
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-4">
                  <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-800">{offer.title}</h3>
                  <p className="text-gray-600 mt-1">{offer.description}</p>
                  <div className="mt-3 flex items-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      offer.offer_type === 'WEEKLY' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {offer.offer_type}
                    </span>
                    {offer.start_date && (
                      <span className="ml-2 text-xs text-gray-500">
                        {new Date(offer.start_date).toLocaleDateString()} - {new Date(offer.end_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <div className="mx-auto w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No offers available</h3>
          <p className="text-gray-500">Check back later for new exclusive deals!</p>
        </div>
      )}
    </div>
  );
}
