// components/dashboard/Profile.jsx
"use client";

import { useEffect, useState } from 'react';

function Skeleton() {
  return (
    <div className="p-8 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
      <div className="h-10 bg-gray-200 rounded w-full"></div>
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
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Profile Information</h2>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-sm text-gray-500">Online</span>
        </div>
      </div>
      
      {status.message && (
        <div className={`mb-4 p-3 rounded-lg ${status.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {status.message}
        </div>
      )}
      
      {profile && (
        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input 
                name="first_name" 
                type="text" 
                value={formData.first_name || ''} 
                onChange={handleChange} 
                disabled={!editing}
                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 outline-none transition ${editing ? 'bg-white border-gray-300' : 'bg-gray-100 border-transparent'}`}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input 
                name="last_name" 
                type="text" 
                value={formData.last_name || ''} 
                onChange={handleChange} 
                disabled={!editing}
                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 outline-none transition ${editing ? 'bg-white border-gray-300' : 'bg-gray-100 border-transparent'}`}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                type="email" 
                value={profile.email || ''} 
                disabled
                className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input 
                name="phone_number" 
                type="tel" 
                value={formData.phone_number || ''} 
                onChange={handleChange} 
                disabled={!editing}
                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 outline-none transition ${editing ? 'bg-white border-gray-300' : 'bg-gray-100 border-transparent'}`}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country of Origin</label>
              <input 
                name="country_of_origin" 
                type="text" 
                value={formData.country_of_origin || ''} 
                onChange={handleChange} 
                disabled={!editing}
                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 outline-none transition ${editing ? 'bg-white border-gray-300' : 'bg-gray-100 border-transparent'}`}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Residence</label>
              <input 
                name="residence" 
                type="text" 
                value={formData.residence || ''} 
                onChange={handleChange} 
                disabled={!editing}
                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 outline-none transition ${editing ? 'bg-white border-gray-300' : 'bg-gray-100 border-transparent'}`}
              />
            </div>
          </div>
          
          <div className="pt-4 flex justify-end">
            {editing ? (
              <div className="space-x-3">
                <button 
                  type="button"
                  onClick={() => {
                    setFormData(profile);
                    setEditing(false);
                    setStatus({ type: '', message: '' });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  Save Changes
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                Edit Profile
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
