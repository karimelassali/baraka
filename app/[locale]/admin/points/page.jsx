// app/admin/points/page.jsx
"use client";

import PointsManagement from '../../../components/admin/PointsManagement';

export default function AdminPointsPage() {
  return (
    <>
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Points Management</h1>
        <p className="text-gray-600">Add or deduct loyalty points for customers</p>
        <div className="w-24 h-1 bg-yellow-500 mx-auto mt-4 rounded-full"></div>
      </div>

      <div className="max-w-6xl mx-auto">
        <PointsManagement />
      </div>
    </>
  );
}