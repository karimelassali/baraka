// components/dashboard/Profile.jsx
"use client";

import { useEffect, useState } from 'react';

function Skeleton() {
  return (
    <div className="p-4 border rounded-lg animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
    </div>
  );
}

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({});
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/customer/profile');
        const data = await response.json();

        if (response.ok) {
          setProfile(data);
          setFormData(data);
        } else {
          console.error('Failed to fetch profile:', data.error);
        }
      } catch (error) {
        console.error('An error occurred while fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });

    try {
      const response = await fetch('/api/customer/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setProfile(result);
        setEditing(false);
        setStatus({ type: 'success', message: 'Profile updated successfully' });
      } else {
        setStatus({ type: 'error', message: result.error || 'Failed to update profile' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'An error occurred while updating the profile' });
    }
  };

  if (loading) {
    return <Skeleton />;
  }

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold">Profile</h2>
      {status.message && (
        <div className={`mt-4 text-sm ${status.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
          {status.message}
        </div>
      )}
      {profile && (
        <form onSubmit={handleUpdate}>
          <div className="mt-4">
            <label>First Name</label>
            <input name="first_name" type="text" value={formData.first_name || ''} onChange={handleChange} disabled={!editing} />
          </div>
          <div className="mt-4">
            <label>Last Name</label>
            <input name="last_name" type="text" value={formData.last_name || ''} onChange={handleChange} disabled={!editing} />
          </div>
          <div className="mt-4">
            <label>Email</label>
            <input type="email" value={profile.email} disabled />
          </div>
          <div className="mt-4">
            {editing ? (
              <button type="submit">Save</button>
            ) : (
              <button onClick={() => setEditing(true)}>Edit</button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
