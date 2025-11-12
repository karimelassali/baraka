// components/admin/OfferManagement.jsx
"use client";

import { useState } from 'react';

export default function OfferManagement() {
  const [formData, setFormData] = useState({ title: '', description: '', type: 'weekly' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: '', message: '' });

  const validate = () => {
    const newErrors = {};
    if (!formData.title) newErrors.title = 'Title is required';
    if (!formData.description) newErrors.description = 'Description is required';
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
      const response = await fetch('/api/admin/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', message: 'Offer created successfully' });
        setFormData({ title: '', description: '', type: 'weekly' });
      } else {
        setStatus({ type: 'error', message: result.error || 'Failed to create offer' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'An error occurred while creating the offer' });
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold">Offer Management</h2>
      {status.message && (
        <div className={`mt-4 text-sm ${status.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
          {status.message}
        </div>
      )}
      <form onSubmit={handleSubmit} className="mt-4">
        <input name="title" placeholder="Title" value={formData.title} onChange={handleChange} />
        {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
        <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} />
        {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
        <select name="type" value={formData.type} onChange={handleChange}>
          <option value="weekly">Weekly</option>
          <option value="permanent">Permanent</option>
        </select>
        <button type="submit">Create Offer</button>
      </form>
    </div>
  );
}
