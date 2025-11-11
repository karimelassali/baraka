"use client";
import { useState, useEffect } from "react";

export default function OffersPage() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/offers")
      .then((res) => res.json())
      .then((data) => {
        setOffers(data);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Loading offers...</div>;
  }

  return (
    <div>
      <h1>Weekly and Permanent Offers</h1>
      <div>
        <h2>Weekly Offers</h2>
        <ul>
          {offers.weekly?.map((offer) => (
            <li key={offer.id}>{offer.title}</li>
          ))}
        </ul>
      </div>
      <div>
        <h2>Permanent Offers</h2>
        <ul>
          {offers.permanent?.map((offer) => (
            <li key={offer.id}>{offer.title}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
