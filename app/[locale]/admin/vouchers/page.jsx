// app/admin/vouchers/page.jsx
"use client";

import VoucherManagement from '../../../../components/admin/VoucherManagement';

export default function AdminVouchersPage() {
  return (
    <>
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Voucher Management</h1>
        <p className="text-gray-600">Create and manage customer vouchers</p>
        <div className="w-24 h-1 bg-purple-500 mx-auto mt-4 rounded-full"></div>
      </div>

      <div className="max-w-6xl mx-auto">
        <VoucherManagement />
      </div>
    </>
  );
}