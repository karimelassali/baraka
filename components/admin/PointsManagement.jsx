// components/admin/PointsManagement.jsx
"use client";

import { useState } from 'react';

export default function PointsManagement() {
  const [formData, setFormData] = useState({ customerId: '', points: 0, reason: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: '', message: '' });

  const validate = () => {
    const newErrors = {};
    if (!formData.customerId) newErrors.customerId = 'Customer ID is required';
    if (!formData.points) newErrors.points = 'Points are required';
    if (!formData.reason) newErrors.reason = 'Reason is required';
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
      const response = await fetch(`/api/admin/customers/${formData.customerId}/points`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ points: formData.points, reason: formData.reason }),
      });

      const result = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', message: 'Points updated successfully' });
        setFormData({ customerId: '', points: 0, reason: '' });
      } else {
        setStatus({ type: 'error', message: result.error || 'Failed to update points' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'An error occurred while updating points' });
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold">Points Management</h2>
      {status.message && (
        <div className={`mt-4 text-sm ${status.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
          {status.message}
        </div>
      )}
      <form onSubmit={handleSubmit} className="mt-4">
        <input name="customerId" placeholder="Customer ID" value={formData.customerId} onChange={handleChange} />
        {errors.customerId && <p className="text-red-500 text-sm">{errors.customerId}</p>}
        <input name="points" type="number" placeholder="Points" value={formData.points} onChange={handleChange} />
        {errors.points && <p className="text-red-500 text-sm">{errors.points}</p>}
        <input name="reason" placeholder="Reason" value={formData.reason} onChange={handleChange} />
        {errors.reason && <p className="text-red-500 text-sm">{errors.reason}</p>}
        <button type="submit">Update Points</button>
      </form>
    </div>
  );
}
