"use client";

import { useEffect, useState } from "react";
import { AuthService } from "../../../lib/auth";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await AuthService.getUser();
        setUser(userData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <a 
            href="/login" 
            className="inline-block px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-2">Not Signed In</h2>
          <p className="text-gray-600 mb-4">Please sign in to access the dashboard.</p>
          <a 
            href="/login" 
            className="inline-block px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  // Extract user's name from email if not available as a separate field
  const firstName = user.user_metadata?.first_name || user.email.split('@')[0];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Welcome, {firstName}!</span>
            <button 
              onClick={async () => {
                await AuthService.logout();
                window.location.href = '/login';
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Hello, {firstName}!</h2>
          <p className="text-gray-600">
            Welcome to your personal dashboard. Here you can manage your account, check your profile details, 
            and access exclusive features.
          </p>
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Account Summary Card */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="font-medium text-gray-900">Account Summary</h3>
              <p className="text-sm text-gray-500 mt-2">Manage your account details</p>
              <a 
                href="/client/profile" 
                className="mt-4 inline-block text-red-600 hover:text-red-800 text-sm font-medium"
              >
                View Profile →
              </a>
            </div>
            
            {/* Offers Card */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="font-medium text-gray-900">Special Offers</h3>
              <p className="text-sm text-gray-500 mt-2">Check out personalized deals</p>
              <a 
                href="/offers" 
                className="mt-4 inline-block text-red-600 hover:text-red-800 text-sm font-medium"
              >
                View Offers →
              </a>
            </div>
            
            {/* Reviews Card */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="font-medium text-gray-900">Your Reviews</h3>
              <p className="text-sm text-gray-500 mt-2">See and manage your reviews</p>
              <a 
                href="/reviews" 
                className="mt-4 inline-block text-red-600 hover:text-red-800 text-sm font-medium"
              >
                View Reviews →
              </a>
            </div>
          </div>
        </div>
        
        {/* Recent Activity Section */}
        <div className="mt-8 bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
          <p className="text-gray-600">Your recent activity will appear here.</p>
        </div>
      </main>
    </div>
  );
}