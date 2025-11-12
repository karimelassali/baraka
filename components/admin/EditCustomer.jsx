// components/admin/EditCustomer.jsx
"use client";

import { useState } from 'react';

export default function EditCustomer({ customer, onClose, onSave }) {
  const [formData, setFormData] = useState(customer);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: '', message: '' });

  const validate = () => {
    const newErrors = {};
    if (!formData.first_name) newErrors.first_name = 'First name is required';
    if (!formData.last_name) newErrors.last_name = 'Last name is required';
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
      const response = await fetch(`/api/admin/customers/${customer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        onSave(result);
        onClose();
      } else {
        setStatus({ type: 'error', message: result.error || 'Failed to update customer' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'An error occurred while updating the customer' });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Edit Customer</h2>
        {status.message && (
          <div className={`mb-4 text-sm ${status.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {status.message}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div>
            <label>First Name</label>
            <input name="first_name" value={formData.first_name} onChange={handleChange} />
            {errors.first_name && <p className="text-red-500 text-sm">{errors.first_name}</p>}
          </div>
          <div>
            <label>Last Name</label>
            <input name="last_name" value={formData.last_name} onChange={handleChange} />
            {errors.last_name && <p className="text-red-500 text-sm">{errors.last_name}</p>}
          </div>
          {/* Add other fields as needed */}
          <button type="submit">Save</button>
          <button onClick={onClose}>Cancel</button>
        </form>
      </div>
    </div>
  );
}
