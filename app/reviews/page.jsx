"use client";
import { useState, useEffect } from "react";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reviews")
      .then((res) => res.json())
      .then((data) => {
        setReviews(data);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Loading reviews...</div>;
  }

  return (
    <div>
      <h1>Customer Reviews</h1>
      <ul>
        {reviews.map((review) => (
          <li key={review.id}>
            <p>{review.text}</p>
            <p>
              <strong>- {review.author}</strong>
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
