// app/admin/customers/new/page.jsx
"use client";

import AddCustomerForm from '../../../../components/admin/AddCustomerForm';

export default function AddCustomerPage() {
  return (
    <>
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Add New Customer</h1>
        <p className="text-gray-600">Create a new customer account</p>
        <div className="w-24 h-1 bg-blue-500 mx-auto mt-4 rounded-full"></div>
      </div>

      <div className="max-w-2xl mx-auto">
        <AddCustomerForm />
      </div>
    </>
  );
}
