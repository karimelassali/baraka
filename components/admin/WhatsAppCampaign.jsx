// components/admin/WhatsAppCampaign.jsx
"use client";

import { useState } from 'react';

export default function WhatsAppCampaign() {
  const [formData, setFormData] = useState({ message: '', targetGroup: 'all', nationality: '', pointsThreshold: 0 });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: '', message: '' });

  const validate = () => {
    const newErrors = {};
    if (!formData.message) newErrors.message = 'Message is required';
    if (formData.targetGroup === 'nationality' && !formData.nationality) {
      newErrors.nationality = 'Nationality is required';
    }
    if (formData.targetGroup === 'points' && (!formData.pointsThreshold || formData.pointsThreshold <= 0)) {
      newErrors.pointsThreshold = 'Points threshold must be greater than 0';
    }
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
      const response = await fetch('/api/admin/campaigns/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', message: result.message || 'Campaign sent successfully' });
        setFormData({ message: '', targetGroup: 'all', nationality: '', pointsThreshold: 0 });
      } else {
        setStatus({ type: 'error', message: result.error || 'Failed to send campaign' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'An error occurred while sending the campaign' });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        WhatsApp Campaign
      </h2>
      
      {status.message && (
        <div className={`mb-4 p-3 rounded-md ${status.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {status.message}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
          <textarea 
            name="message" 
            placeholder="Enter your WhatsApp message here" 
            value={formData.message} 
            onChange={handleChange}
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
          {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Target Group</label>
          <select 
            name="targetGroup" 
            value={formData.targetGroup} 
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="all">All Customers</option>
            <option value="nationality">By Nationality</option>
            <option value="points">By Points Threshold</option>
          </select>
        </div>
        
        {formData.targetGroup === 'nationality' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
            <input 
              name="nationality" 
              placeholder="Enter nationality" 
              value={formData.nationality} 
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            {errors.nationality && <p className="mt-1 text-sm text-red-600">{errors.nationality}</p>}
          </div>
        )}
        
        {formData.targetGroup === 'points' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Points Threshold</label>
            <input 
              name="pointsThreshold" 
              type="number" 
              placeholder="Minimum points required" 
              value={formData.pointsThreshold} 
              onChange={handleChange}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            {errors.pointsThreshold && <p className="mt-1 text-sm text-red-600">{errors.pointsThreshold}</p>}
          </div>
        )}
        
        <button 
          type="submit" 
          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition duration-300"
        >
          Send Campaign
        </button>
      </form>
    </div>
  );
}
