// components/admin/PointsManagement.jsx
"use client";

import { useState, useEffect } from 'react';

function CustomerDetailsModal({ customer, isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    points: 0,
    reason: ''
  });
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    if (customer && isOpen) {
      loadTransactionHistory();
    }
  }, [customer, isOpen]);

  const loadTransactionHistory = async () => {
    if (!customer) return;
    
    setLoadingHistory(true);
    try {
      const response = await fetch(`/api/customer/${customer.id}/points`);
      const data = await response.json();

      if (response.ok) {
        setTransactionHistory(data.points_history || []);
      } else {
        console.error('Failed to load transaction history:', data.error);
        setTransactionHistory([]);
      }
    } catch (error) {
      console.error('Error loading transaction history:', error);
      setTransactionHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });

    try {
      const response = await fetch(`/api/admin/customers/${customer.id}/points`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          points: parseInt(formData.points),
          reason: formData.reason
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', message: 'Points updated successfully' });
        setFormData({ points: 0, reason: '' });
        
        // Reload customer data and transaction history
        onSave && onSave();
        loadTransactionHistory();
      } else {
        setStatus({ type: 'error', message: result.error || 'Failed to update points' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'An error occurred while updating points' });
    }
  };

  if (!isOpen || !customer) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-800">Customer Details</h3>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
          {/* Customer Information */}
          <div className="md:col-span-1">
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-gray-700 mb-2">Customer Information</h4>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Name:</span> {customer.first_name} {customer.last_name}</p>
                <p><span className="font-medium">Email:</span> {customer.email}</p>
                <p><span className="font-medium">Phone:</span> {customer.phone_number || 'N/A'}</p>
                <p><span className="font-medium">Country of Origin:</span> {customer.country_of_origin || 'N/A'}</p>
                <p><span className="font-medium">Residence:</span> {customer.residence || 'N/A'}</p>
                <p><span className="font-medium">Total Points:</span> {customer.total_points || 0}</p>
              </div>
            </div>
            
            {/* Points Form */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-700 mb-3">Update Points</h4>
              {status.message && (
                <div className={`mb-3 p-2 rounded ${status.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {status.message}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Points</label>
                  <input
                    name="points"
                    type="number"
                    value={formData.points}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="Enter points (positive to add, negative to deduct)"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                  <input
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="Reason for points adjustment"
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-md transition"
                >
                  Update Points
                </button>
              </form>
            </div>
          </div>
          
          {/* Transaction History */}
          <div className="md:col-span-2">
            <div className="bg-gray-50 rounded-lg p-4 h-full flex flex-col">
              <h4 className="font-semibold text-gray-700 mb-3">Transaction History</h4>
              
              {loadingHistory ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
                </div>
              ) : transactionHistory.length > 0 ? (
                <div className="overflow-y-auto flex-1">
                  <div className="space-y-3">
                    {transactionHistory.map((transaction) => (
                      <div key={transaction.id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex justify-between">
                          <div>
                            <p className="font-medium">{transaction.description || transaction.transaction_type}</p>
                            <p className="text-sm text-gray-500">{new Date(transaction.created_at).toLocaleString()}</p>
                          </div>
                          <span className={`font-semibold ${transaction.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.points > 0 ? '+' : ''}{transaction.points}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  No transaction history available
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PointsManagement() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);

  // Load initial batch of customers
  const loadCustomers = async (reset = false) => {
    if (reset) {
      setLoading(true);
      setOffset(0);
    } else {
      setLoadingMore(true);
    }
    
    try {
      let url = `/api/admin/customers?limit=20&offset=${reset ? 0 : offset}`;
      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        if (reset) {
          setCustomers(data.customers || data);
        } else {
          setCustomers(prev => [...prev, ...(data.customers || data)]);
        }
        
        // Check if we have more customers to load
        setHasMore((data.customers || data).length === 20);
        if (!reset) {
          setOffset(prev => prev + 20);
        }
      } else {
        console.error('Failed to load customers:', data.error);
        if (reset) {
          setCustomers([]);
        }
      }
    } catch (error) {
      console.error('Error loading customers:', error);
      if (reset) {
        setCustomers([]);
      }
    } finally {
      if (reset) {
        setLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  };

  useEffect(() => {
    loadCustomers(true);
  }, [searchTerm]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
  };

  const loadMoreCustomers = async () => {
    if (!hasMore || loadingMore) return;
    await loadCustomers(false);
  };

  // Load more customers when scrolling
  useEffect(() => {
    const handleScroll = async () => {
      if (
        window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight ||
        loadingMore ||
        !hasMore
      ) {
        return;
      }

      await loadMoreCustomers();
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadingMore, hasMore, offset]);

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        Points Management
      </h2>
      
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search customers by name, email..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
        />
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading && customers.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-4 py-6 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
                  </div>
                </td>
              </tr>
            ) : customers.length > 0 ? (
              customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{customer.first_name} {customer.last_name}</div>
                    <div className="text-sm text-gray-500">{customer.date_of_birth ? new Date(customer.date_of_birth).toLocaleDateString() : 'N/A'}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {customer.email}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{customer.country_of_origin || 'N/A'}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 font-semibold">
                    {customer.total_points || 0}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleCustomerSelect(customer)}
                      className="text-yellow-600 hover:text-yellow-900 font-medium"
                    >
                      Manage Points
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-4 py-6 text-center text-sm text-gray-500">
                  {searchTerm ? 'No customers found matching your search' : 'No customers found'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {loadingMore && (
        <div className="flex justify-center my-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-600"></div>
        </div>
      )}

      <CustomerDetailsModal
        customer={selectedCustomer}
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        onSave={() => {
          // Reload the customer list to reflect changes
          loadCustomers(true);
        }}
      />
    </div>
  );
}