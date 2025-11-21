"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HiddenAdminSetup() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: '',
        secretKey: ''
    });
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            const res = await fetch('/api/setup-admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to create admin');
            }

            setStatus({ type: 'success', message: 'Admin created successfully! Redirecting...' });
            setTimeout(() => router.push('/auth/login'), 2000);
        } catch (err) {
            setStatus({ type: 'error', message: err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
            <div className="max-w-md w-full bg-gray-800 rounded-xl shadow-2xl p-8 border border-gray-700">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-red-500">⚠️ Restricted Access</h1>
                    <p className="text-gray-400 text-sm mt-2">Initial Admin Setup</p>
                </div>

                {status.message && (
                    <div className={`mb-6 p-4 rounded-lg text-sm ${status.type === 'success' ? 'bg-green-900/50 text-green-200 border border-green-800' : 'bg-red-900/50 text-red-200 border border-red-800'
                        }`}>
                        {status.message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Setup Secret</label>
                        <input
                            type="password"
                            name="secretKey"
                            value={formData.secretKey}
                            onChange={handleChange}
                            required
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                            placeholder="Enter the secret key from .env"
                        />
                    </div>

                    <div className="h-px bg-gray-700 my-6"></div>

                    <div>
                        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Full Name</label>
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            minLength={6}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                        {loading ? 'Creating...' : 'Create Admin User'}
                    </button>
                </form>
            </div>
        </div>
    );
}
