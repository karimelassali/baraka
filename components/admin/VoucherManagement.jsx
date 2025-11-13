// components/admin/VoucherManagement.jsx
"use client";

import { useState, useEffect } from 'react';

function VoucherDetailsModal({ customer, vouchers, isOpen, onClose, onSave }) {
  const [newVoucherData, setNewVoucherData] = useState({
    pointsToRedeem: 0,
    description: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewVoucherData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });
    setLoading(true);

    try {
      const response = await fetch('/api/admin/vouchers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: customer.id,
          points_to_convert: parseInt(newVoucherData.pointsToRedeem),
          description: newVoucherData.description
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', message: 'Voucher created successfully' });
        setNewVoucherData({ pointsToRedeem: 0, description: '' });
        onSave && onSave(); // Refresh the vouchers list
      } else {
        setStatus({ type: 'error', message: result.error || 'Failed to create voucher' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'An error occurred while creating the voucher' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !customer) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-800">Voucher Management - {customer.first_name} {customer.last_name}</h3>
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
            
            {/* Create Voucher Form */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-700 mb-3">Create New Voucher</h4>
              {status.message && (
                <div className={`mb-3 p-2 rounded ${status.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {status.message}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Points to Redeem</label>
                  <input
                    name="pointsToRedeem"
                    type="number"
                    value={newVoucherData.pointsToRedeem}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter points to redeem for voucher"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    name="description"
                    value={newVoucherData.description}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Voucher description"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md transition disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Voucher'}
                </button>
              </form>
            </div>
          </div>
          
          {/* Voucher History */}
          <div className="md:col-span-2">
            <div className="bg-gray-50 rounded-lg p-4 h-full flex flex-col">
              <h4 className="font-semibold text-gray-700 mb-3">Voucher History</h4>
              
              {vouchers && vouchers.length > 0 ? (
                <div className="overflow-y-auto flex-1">
                  <div className="space-y-3">
                    {vouchers.map((voucher) => (
                      <div key={voucher.id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex justify-between">
                          <div>
                            <p className="font-medium">Code: {voucher.code}</p>
                            <p className="text-sm">Value: {voucher.value} {voucher.currency}</p>
                            <p className="text-sm text-gray-500">Created: {new Date(voucher.created_at).toLocaleString()}</p>
                            {voucher.expires_at && <p className="text-sm text-gray-500">Expires: {new Date(voucher.expires_at).toLocaleDateString()}</p>}
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              voucher.is_used 
                                ? 'bg-red-100 text-red-800' 
                                : voucher.is_active 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                            }`}>
                              {voucher.is_used ? 'Used' : voucher.is_active ? 'Active' : 'Expired'}
                            </span>
                            <p className="text-sm mt-1">{voucher.points_redeemed} pts</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  No vouchers available for this customer
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

export default function VoucherManagement() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerVouchers, setCustomerVouchers] = useState([]);
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

  const handleCustomerSelect = async (customer) => {
    // Load customer's vouchers
    try {
      const response = await fetch(`/api/admin/customers/${customer.id}/vouchers`);
      const data = await response.json();
      
      if (response.ok) {
        setCustomerVouchers(data.vouchers || []);
      } else {
        console.error('Failed to load vouchers:', data.error);
        setCustomerVouchers([]);
      }
    } catch (error) {
      console.error('Error loading customer vouchers:', error);
      setCustomerVouchers([]);
    }
    
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
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
        </svg>
        Voucher Management
      </h2>
      
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search customers by name, email..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vouchers</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading && customers.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-6 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
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
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {customer.vouchers_count || 0}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleCustomerSelect(customer)}
                      className="text-purple-600 hover:text-purple-900 font-medium"
                    >
                      Manage Vouchers
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-4 py-6 text-center text-sm text-gray-500">
                  {searchTerm ? 'No customers found matching your search' : 'No customers found'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {loadingMore && (
        <div className="flex justify-center my-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
        </div>
      )}

      <VoucherDetailsModal
        customer={selectedCustomer}
        vouchers={customerVouchers}
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        onSave={() => {
          // Reload the customer list to reflect changes
          loadCustomers(true);
          // Reload the current customer's voucher list
          if (selectedCustomer) {
            handleCustomerSelect(selectedCustomer);
          }
        }}
      />
    </div>
  );
}