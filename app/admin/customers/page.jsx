// app/admin/customers/page.jsx
"use client";

import CustomerManagement from '../../../components/admin/CustomerManagement';
import Link from 'next/link';

export default function AdminCustomersPage() {
  return (
    <>
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Customer Management</h1>
        <p className="text-gray-600">View, edit, and manage your customers</p>
        <div className="w-24 h-1 bg-red-500 mx-auto mt-4 rounded-full"></div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="flex justify-end mb-4">
          <Link href="/admin/customers/new" className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition">
            Add New Customer
          </Link>
        </div>
        <CustomerManagement />
      </div>
    </>
  );
}
