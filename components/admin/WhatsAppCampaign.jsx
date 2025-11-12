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
    if (formData.targetGroup === 'points' && !formData.pointsThreshold) {
      newErrors.pointsThreshold = 'Points threshold is required';
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
        setStatus({ type: 'success', message: 'Campaign sent successfully' });
        setFormData({ message: '', targetGroup: 'all', nationality: '', pointsThreshold: 0 });
      } else {
        setStatus({ type: 'error', message: result.error || 'Failed to send campaign' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'An error occurred while sending the campaign' });
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold">WhatsApp Campaign</h2>
      {status.message && (
        <div className={`mt-4 text-sm ${status.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
          {status.message}
        </div>
      )}
      <form onSubmit={handleSubmit} className="mt-4">
        <textarea name="message" placeholder="Message" value={formData.message} onChange={handleChange} />
        {errors.message && <p className="text-red-500 text-sm">{errors.message}</p>}
        <select name="targetGroup" value={formData.targetGroup} onChange={handleChange}>
          <option value="all">All Customers</option>
          <option value="nationality">By Nationality</option>
          <option value="points">By Points Threshold</option>
        </select>
        {formData.targetGroup === 'nationality' && (
          <div>
            <input name="nationality" placeholder="Nationality" value={formData.nationality} onChange={handleChange} />
            {errors.nationality && <p className="text-red-500 text-sm">{errors.nationality}</p>}
          </div>
        )}
        {formData.targetGroup === 'points' && (
          <div>
            <input name="pointsThreshold" type="number" placeholder="Points Threshold" value={formData.pointsThreshold} onChange={handleChange} />
            {errors.pointsThreshold && <p className="text-red-500 text-sm">{errors.pointsThreshold}</p>}
          </div>
        )}
        <button type="submit">Send Campaign</button>
      </form>
    </div>
  );
}
