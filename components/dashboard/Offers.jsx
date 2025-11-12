// components/dashboard/Offers.jsx
"use client";

import { useEffect, useState } from 'react';

function Skeleton() {
  return (
    <div className="p-4 border rounded-lg animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
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
          setOffers(data);
        } else {
          console.error('Failed to fetch offers:', data.error);
        }
      } catch (error) {
        console.error('An error occurred while fetching offers:', error);
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
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold">Your Offers</h2>
      <div className="mt-4">
        {offers.length > 0 ? (
          <ul>
            {offers.map((offer) => (
              <li key={offer.id}>{offer.title}</li>
            ))}
          </ul>
        ) : (
          <p>No offers available at the moment.</p>
        )}
      </div>
    </div>
  );
}
