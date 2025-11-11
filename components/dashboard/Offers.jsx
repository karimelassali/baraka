'use client';

export default function Offers() {
  // Placeholder for fetching and displaying offers
  const offers = [
    { id: 1, title: '10% off your next purchase' },
    { id: 2, title: 'Free coffee with any pastry' },
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Active Offers</h2>
      <ul>
        {offers.map((offer) => (
          <li key={offer.id}>{offer.title}</li>
        ))}
      </ul>
    </div>
  );
}
