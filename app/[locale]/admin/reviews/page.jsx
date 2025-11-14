// app/admin/reviews/page.jsx
"use client";

import ReviewManagement from '../../../components/admin/ReviewManagement';

export default function AdminReviewsPage() {
  return (
    <>
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Review Management</h1>
        <p className="text-gray-600">Moderate and manage customer reviews</p>
        <div className="w-24 h-1 bg-green-500 mx-auto mt-4 rounded-full"></div>
      </div>

      <div className="max-w-6xl mx-auto">
        <ReviewManagement />
      </div>
    </>
  );
}