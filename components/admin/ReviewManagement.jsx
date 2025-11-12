// components/admin/ReviewManagement.jsx
"use client";

import { useEffect, useState } from 'react';
import { getReviews, updateReviewApproval } from '../../lib/supabase/review';

export default function ReviewManagement() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await getReviews();
        setReviews(data);
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const handleToggleApproved = async (reviewId, approved) => {
    try {
      const updatedReview = await updateReviewApproval(reviewId, approved);
      setReviews((prev) =>
        prev.map((r) => (r.id === updatedReview.id ? updatedReview : r))
      );
    } catch (error) {
      console.error('Failed to update review:', error);
    }
  };

  if (loading) {
    return <div>Loading reviews...</div>;
  }

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold">Review Management</h2>
      <div className="mt-4">
        <table>
          <thead>
            <tr>
              <th>Author</th>
              <th>Content</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((review) => (
              <tr key={review.id}>
                <td>{review.author}</td>
                <td>{review.content}</td>
                <td>{review.approved ? 'Approved' : 'Pending'}</td>
                <td>
                  <button onClick={() => handleToggleApproved(review.id, !review.approved)}>
                    {review.approved ? 'Hide' : 'Approve'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
