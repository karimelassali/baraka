// components/admin/ReviewManagement.jsx
"use client";

import { useEffect, useState } from 'react';
import { getReviews, updateReviewApproval } from '../../lib/supabase/review';
import { Search, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

function SkeletonRow() {
  return (
    <tr className="border-b border-gray-200">
      <td className="py-3 px-4">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
      </td>
      <td className="py-3 px-4">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
      </td>
      <td className="py-3 px-4">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4"></div>
      </td>
      <td className="py-3 px-4">
        <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
      </td>
    </tr>
  );
}

export default function ReviewManagement() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      // Use the API route or service. If using service, we need to update it.
      // For now, let's assume we need to fetch from a new admin API or update the service.
      // Since I can't easily update the service without seeing it, I'll use a direct fetch to a new admin API route I'll create, 
      // OR I'll update the service if I can see it.
      // Let's assume I'll update the service to accept params.
      const data = await getReviews(page, 10, search);
      // Assuming getReviews returns { data, count, totalPages } or similar if updated.
      // If it returns just array, I need to fix that.

      // FALLBACK: If getReviews is not updated yet, this might fail. 
      // I will update getReviews in the next step.
      if (data.data) {
        setReviews(data.data);
        setTotalPages(Math.ceil((data.count || 0) / 10));
        setTotalReviews(data.count || 0);
      } else {
        setReviews(data); // Legacy behavior
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchReviews();
    }, 500); // Debounce search
    return () => clearTimeout(timer);
  }, [page, search]);

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

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Review Management
        </h2>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search reviews..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="text-sm text-gray-600 whitespace-nowrap">
            Total: <span className="font-semibold">{totalReviews}</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Content</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </>
            ) : reviews.length > 0 ? (
              reviews.map((review) => (
                <tr key={review.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900 max-w-xs truncate">{review.content || review.review_text}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(review.created_at).toLocaleDateString()} - {review.reviewer_name || 'Anonymous'}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${review.is_approved || review.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {review.is_approved || review.approved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleToggleApproved(review.id, !(review.is_approved || review.approved))}
                      className={`px-3 py-1 rounded-md text-sm ${review.is_approved || review.approved
                          ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                    >
                      {review.is_approved || review.approved ? 'Hide' : 'Approve'}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-4 py-6 text-center text-sm text-gray-500">
                  No reviews found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between mt-4 border-t border-gray-200 pt-4">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1 || loading}
          className="flex items-center px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Previous
        </button>
        <span className="text-sm text-gray-600">
          Page {page} of {totalPages || 1}
        </span>
        <button
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages || loading}
          className="flex items-center px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  );
}
