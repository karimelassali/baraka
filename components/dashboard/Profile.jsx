'use client';

import { useState } from 'react';

export default function Profile({ customer }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(customer);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch('/api/customer/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });
    const data = await response.json();
    setIsEditing(false);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
      <h2 className="text-xl font-bold mb-4">Profile</h2>
      {isEditing ? (
        <form onSubmit={handleSubmit}>
          {/* Add form fields for all customer attributes */}
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg">
            Save
          </button>
          <button
            type="button"
            className="ml-2 bg-gray-300 px-4 py-2 rounded-lg"
            onClick={() => setIsEditing(false)}
          >
            Cancel
          </button>
        </form>
      ) : (
        <div>
          <p>
            <strong>Name:</strong> {customer.first_name} {customer.last_name}
          </p>
          <p>
            <strong>Email:</strong> {customer.email}
          </p>
          {/* Display other customer attributes */}
          <button
            onClick={() => setIsEditing(true)}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg"
          >
            Edit Profile
          </button>
        </div>
      )}
    </div>
  );
}
