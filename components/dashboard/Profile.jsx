// components/dashboard/Profile.jsx
"use client";

import { useEffect, useState } from 'react';
import { User, Mail, Phone, Globe, MapPin, Edit3, Check, X } from 'lucide-react';

function Skeleton({ compact }) {
  if (compact) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-4 bg-gray-100 rounded w-3/4"></div>
        <div className="h-4 bg-gray-100 rounded w-full"></div>
        <div className="h-4 bg-gray-100 rounded w-2/3"></div>
      </div>
    );
  }
  return (
    <div className="p-8 rounded-xl bg-white border border-gray-200 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
      <div className="h-10 bg-gray-200 rounded w-full"></div>
    </div>
  );
}

export default function Profile({ compact = false }) {
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
    return <Skeleton compact={compact} />;
  }

  if (compact) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
            <User className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {profile?.first_name} {profile?.last_name}
            </h3>
            <p className="text-sm text-gray-500">{profile?.email}</p>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          {profile?.phone_number && (
            <div className="flex items-center text-gray-600">
              <Phone className="w-4 h-4 mr-2 text-gray-400" />
              {profile.phone_number}
            </div>
          )}
          {profile?.residence && (
            <div className="flex items-center text-gray-600">
              <MapPin className="w-4 h-4 mr-2 text-gray-400" />
              {profile.residence}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="text-sm text-gray-500">Active</span>
        </div>
      </div>

      {status.message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center ${status.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {status.type === 'success' ? <Check className="w-5 h-5 mr-2" /> : <X className="w-5 h-5 mr-2" />}
          {status.message}
        </div>
      )}

      {profile && (
        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <User className="w-4 h-4 mr-1.5 text-gray-400" />
                First Name
              </label>
              <input
                name="first_name"
                type="text"
                value={formData.first_name || ''}
                onChange={handleChange}
                disabled={!editing}
                className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 outline-none transition ${editing ? 'bg-white border-gray-300' : 'bg-gray-50 border-gray-200 text-gray-700'}`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <User className="w-4 h-4 mr-1.5 text-gray-400" />
                Last Name
              </label>
              <input
                name="last_name"
                type="text"
                value={formData.last_name || ''}
                onChange={handleChange}
                disabled={!editing}
                className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 outline-none transition ${editing ? 'bg-white border-gray-300' : 'bg-gray-50 border-gray-200 text-gray-700'}`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Mail className="w-4 h-4 mr-1.5 text-gray-400" />
                Email
              </label>
              <input
                type="email"
                value={profile.email || ''}
                disabled
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Phone className="w-4 h-4 mr-1.5 text-gray-400" />
                Phone Number
              </label>
              <input
                name="phone_number"
                type="tel"
                value={formData.phone_number || ''}
                onChange={handleChange}
                disabled={!editing}
                className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 outline-none transition ${editing ? 'bg-white border-gray-300' : 'bg-gray-50 border-gray-200 text-gray-700'}`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Globe className="w-4 h-4 mr-1.5 text-gray-400" />
                Country of Origin
              </label>
              <input
                name="country_of_origin"
                type="text"
                value={formData.country_of_origin || ''}
                onChange={handleChange}
                disabled={!editing}
                className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 outline-none transition ${editing ? 'bg-white border-gray-300' : 'bg-gray-50 border-gray-200 text-gray-700'}`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <MapPin className="w-4 h-4 mr-1.5 text-gray-400" />
                Residence
              </label>
              <input
                name="residence"
                type="text"
                value={formData.residence || ''}
                onChange={handleChange}
                disabled={!editing}
                className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 outline-none transition ${editing ? 'bg-white border-gray-300' : 'bg-gray-50 border-gray-200 text-gray-700'}`}
              />
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200 flex justify-end">
            {editing ? (
              <div className="space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setFormData(profile);
                    setEditing(false);
                    setStatus({ type: '', message: '' });
                  }}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium flex items-center"
                >
                  <X className="w-4 h-4 mr-1.5" />
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium flex items-center shadow-sm"
                >
                  <Check className="w-4 h-4 mr-1.5" />
                  Save Changes
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium flex items-center shadow-sm"
              >
                <Edit3 className="w-4 h-4 mr-1.5" />
                Edit Profile
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
