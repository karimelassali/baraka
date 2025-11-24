// components/dashboard/Offers.jsx
"use client";

import { useEffect, useState } from 'react';
import { Tag, Calendar, ArrowRight, Clock } from 'lucide-react';

function Skeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
          <div className="h-40 bg-gray-100 rounded-lg mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        </div>
      ))}
    </div>
  );
}

export default function Offers({ limit }) {
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

  const displayOffers = limit ? offers.slice(0, limit) : offers;

  return (
    <div className="w-full">
      {!limit && (
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Special Offers</h2>
          <span className="bg-indigo-100 text-indigo-800 text-xs px-3 py-1 rounded-full font-medium">
            {offers.length} active
          </span>
        </div>
      )}

      {displayOffers.length > 0 ? (
        <div className={`grid grid-cols-1 ${limit ? 'md:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-3'} gap-6`}>
          {displayOffers.map((offer) => (
            <div
              key={offer.id}
              className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col"
            >
              <div className="h-40 bg-gradient-to-br from-indigo-500 to-purple-600 relative p-6 flex items-center justify-center">
                <div className="absolute top-0 right-0 p-4 opacity-20">
                  <Tag className="w-24 h-24 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white text-center relative z-10">{offer.title}</h3>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center space-x-2 mb-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${offer.offer_type === 'WEEKLY'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                    }`}>
                    {offer.offer_type}
                  </span>
                  {offer.end_date && (
                    <span className="flex items-center text-xs text-gray-500">
                      <Clock className="w-3 h-3 mr-1" />
                      {Math.ceil((new Date(offer.end_date) - new Date()) / (1000 * 60 * 60 * 24))} days left
                    </span>
                  )}
                </div>

                <p className="text-gray-600 text-sm mb-6 flex-1 line-clamp-3">{offer.description}</p>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                  <span className="text-xs text-gray-500 flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    Valid until {new Date(offer.end_date).toLocaleDateString()}
                  </span>
                  <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center group-hover:translate-x-1 transition-transform">
                    Details <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200 border-dashed">
          <div className="mx-auto w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
            <Tag className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No offers available</h3>
          <p className="text-gray-500 text-sm">Check back later for new exclusive deals!</p>
        </div>
      )}
    </div>
  );
}
