// components/admin/VoucherManagement.jsx
"use client";

import { useState } from 'react';

export default function VoucherManagement() {
  const [formData, setFormData] = useState({ customerId: '', pointsToRedeem: 0 });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: '', message: '' });

  const validate = () => {
    const newErrors = {};
    if (!formData.customerId) newErrors.customerId = 'Customer ID is required';
    if (!formData.pointsToRedeem) newErrors.pointsToRedeem = 'Points to redeem are required';
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setStatus({ type: '', message: '' });

    try {
      const response = await fetch('/api/admin/vouchers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', message: 'Voucher created successfully' });
        setFormData({ customerId: '', pointsToRedeem: 0 });
      } else {
        setStatus({ type: 'error', message: result.error || 'Failed to create voucher' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'An error occurred while creating the voucher' });
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold">Voucher Management</h2>
      {status.message && (
        <div className={`mt-4 text-sm ${status.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
          {status.message}
        </div>
      )}
      <form onSubmit={handleSubmit} className="mt-4">
        <input name="customerId" placeholder="Customer ID" value={formData.customerId} onChange={handleChange} />
        {errors.customerId && <p className="text-red-500 text-sm">{errors.customerId}</p>}
        <input name="pointsToRedeem" type="number" placeholder="Points to Redeem" value={formData.pointsToRedeem} onChange={handleChange} />
        {errors.pointsToRedeem && <p className="text-red-500 text-sm">{errors.pointsToRedeem}</p>}
        <button type="submit">Create Voucher</button>
      </form>
    </div>
  );
}
