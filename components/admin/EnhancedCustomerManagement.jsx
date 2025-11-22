// components/admin/EnhancedCustomerManagement.jsx
"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Check,
  Search,
  Edit,
  Eye,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  Loader
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import GlassCard from '../../components/ui/GlassCard';

function AddCustomerModal({ isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    country_of_origin: '',
    residence: '',
    date_of_birth: '',
    password: '' // For customer creation
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        country_of_origin: '',
        residence: '',
        date_of_birth: '',
        password: ''
      });
      setStatus({ type: '', message: '' });
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });
    setLoading(true);

    try {
      // Attempt to create customer via admin register endpoint
      // This may need to be updated to a proper customer creation endpoint if available
      const response = await fetch('/api/admin/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.first_name,
          lastName: formData.last_name,
          email: formData.email,
          password: formData.password,
          phone_number: formData.phone_number,
          country_of_origin: formData.country_of_origin,
          residence: formData.residence,
          date_of_birth: formData.date_of_birth,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', message: 'Customer created successfully' });
        onSave && onSave(result.user); // Pass the new customer to parent
        setTimeout(() => {
          onClose();
          setStatus({ type: '', message: '' });
        }, 1500); // Close after success message
      } else {
        setStatus({ type: 'error', message: result.error || 'Failed to create customer' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'An error occurred while creating the customer' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        className="bg-card rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        <GlassCard>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Add New Customer
              </CardTitle>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-muted transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </CardHeader>
          <CardContent>
            {status.message && (
              <div className={`mb-4 p-3 rounded-lg ${status.type === 'success'
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                {status.message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">First Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <input
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Last Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <input
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <input
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <input
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Country of Origin</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <input
                      name="country_of_origin"
                      value={formData.country_of_origin}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Residence</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <input
                      name="residence"
                      value={formData.residence}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Date of Birth</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <input
                      name="date_of_birth"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Customer'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </GlassCard>
      </motion.div>
    </div>
  );
}

function EditCustomerModal({ customer, isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    country_of_origin: '',
    residence: '',
    date_of_birth: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customer) {
      setFormData({
        first_name: customer.first_name || '',
        last_name: customer.last_name || '',
        email: customer.email || '',
        phone_number: customer.phone_number || '',
        country_of_origin: customer.country_of_origin || '',
        residence: customer.residence || '',
        date_of_birth: customer.date_of_birth || ''
      });
    }
  }, [customer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/customers/${customer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', message: 'Customer updated successfully' });
        onSave && onSave({ ...customer, ...formData }); // Update customer in parent
        setTimeout(() => onClose(), 1500); // Close after success message
      } else {
        setStatus({ type: 'error', message: result.error || 'Failed to update customer' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'An error occurred while updating the customer' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !customer) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        className="bg-card rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        <GlassCard>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Edit Customer
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {customer.first_name} {customer.last_name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-muted transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </CardHeader>
          <CardContent>
            {status.message && (
              <div className={`mb-4 p-3 rounded-lg ${status.type === 'success'
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                {status.message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">First Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <input
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Last Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <input
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <input
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Country of Origin</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <input
                      name="country_of_origin"
                      value={formData.country_of_origin}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Residence</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <input
                      name="residence"
                      value={formData.residence}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Date of Birth</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <input
                      name="date_of_birth"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </GlassCard>
      </motion.div>
    </div>
  );
}

import { useSearchParams } from 'next/navigation';

// ... (imports remain the same)

export default function EnhancedCustomerManagement() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('created_at'); // Default sort by date
  const [sortDirection, setSortDirection] = useState('desc'); // Default sort descending (newest first)
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [expandedCustomerId, setExpandedCustomerId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const searchParams = useSearchParams();

  // Filter and sort states
  const [locationFilter, setLocationFilter] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState('all'); // 'all', 'verified', 'not-verified'

  // Load initial batch of customers
  const loadCustomers = async (reset = false) => {
    if (reset) {
      setLoading(true);
    }

    try {
      let url = `/api/admin/customers?limit=50&sort_by=created_at&sort_order=desc`;

      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        if (reset) {
          setCustomers(data.customers || data);
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
      }
    }
  };

  useEffect(() => {
    loadCustomers(true);

    // Check for AI search param
    const search = searchParams.get('search');
    if (search) {
      setSearchTerm(search);
    }
  }, [searchParams]);

  // Filtering and sorting on the client side
  const filteredAndSortedCustomers = customers.filter(customer => {
    // Search filter - check multiple fields
    const matchesSearch =
      !searchTerm ||
      customer.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.country_of_origin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.residence?.toLowerCase().includes(searchTerm.toLowerCase());

    // Location filter
    const matchesLocation =
      !locationFilter ||
      customer.country_of_origin?.toLowerCase().includes(locationFilter.toLowerCase()) ||
      customer.residence?.toLowerCase().includes(locationFilter.toLowerCase());

    // Verification filter
    const matchesVerification =
      verifiedFilter === 'all' ||
      (verifiedFilter === 'verified' && customer.email_confirmed) ||
      (verifiedFilter === 'not-verified' && !customer.email_confirmed);

    return matchesSearch && matchesLocation && matchesVerification;
  }).sort((a, b) => {
    // Sort by selected field and direction
    if (sortField === 'name') {
      const nameA = (a.first_name + ' ' + a.last_name).toLowerCase();
      const nameB = (b.first_name + ' ' + b.last_name).toLowerCase();
      if (sortDirection === 'asc') {
        return nameA.localeCompare(nameB);
      } else {
        return nameB.localeCompare(nameA);
      }
    } else if (sortField === 'created_at') {
      // Sort by date (assuming we have created_at field)
      if (sortDirection === 'asc') {
        return new Date(a.created_at || a.date_of_birth || '1970-01-01') - new Date(b.created_at || b.date_of_birth || '1970-01-01');
      } else {
        return new Date(b.created_at || b.date_of_birth || '1970-01-01') - new Date(a.created_at || a.date_of_birth || '1970-01-01');
      }
    } else {
      // Default sorting by the original API order
      return 0;
    }
  });

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
  };

  const toggleCustomerDetails = (customerId) => {
    setExpandedCustomerId(expandedCustomerId === customerId ? null : customerId);
  };

  // Change sort when header is clicked
  const handleSort = (field) => {
    if (sortField === field) {
      // If clicking same field, reverse direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // If clicking new field, sort by that field descending (newest first for dates)
      setSortField(field);
      setSortDirection(field === 'name' ? 'asc' : 'desc');
    }
  };

  // Function to get sort indicator for a field
  const getSortIndicator = (field) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />;
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <GlassCard>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Management
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your customer information and details
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent min-w-[240px]"
                />
              </div>
              <Button
                variant="outline"
                className="border-input hover:bg-primary/10 hover:text-primary flex items-center gap-2"
                onClick={() => setShowAddModal(true)}
              >
                <Plus className="h-4 w-4" />
                Add Customer
              </Button>
            </div>
          </div>

          {/* Advanced filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <input
                  type="text"
                  placeholder="Filter by location"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Verification Status</label>
              <select
                value={verifiedFilter}
                onChange={(e) => setVerifiedFilter(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Customers</option>
                <option value="verified">Verified Only</option>
                <option value="not-verified">Unverified Only</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Sort By</label>
              <div className="flex gap-2">
                <select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value)}
                  className="flex-1 px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="created_at">Registration Date</option>
                  <option value="name">Name</option>
                </select>
                <button
                  onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 bg-background border border-input rounded-lg hover:bg-accent transition-colors"
                >
                  {sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground mt-4">
            <span>Total Customers: <span className="font-medium">{filteredAndSortedCustomers.length}</span></span>
            <span className="text-xs">Last updated: Today</span>
          </div>
        </CardHeader>
      </GlassCard>

      {/* Customer Table */}
      <GlassCard className="p-0 overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">
                      Name {getSortIndicator('name')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Contact</th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => handleSort('location')}
                  >
                    <div className="flex items-center">
                      Location {getSortIndicator('location')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Points</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading && customers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    </td>
                  </tr>
                ) : filteredAndSortedCustomers.length > 0 ? (
                  filteredAndSortedCustomers.map((customer) => (
                    <React.Fragment key={customer.id}>
                      <tr
                        className={`hover:bg-accent transition-colors ${expandedCustomerId === customer.id ? 'bg-muted/30' : ''}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="bg-primary/10 p-2 rounded-lg mr-3">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium">{customer.first_name} {customer.last_name}</div>
                              <div className="text-sm text-muted-foreground">
                                {customer.date_of_birth ? new Date(customer.date_of_birth).toLocaleDateString() : 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <div className="flex items-center text-sm">
                              <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                              {customer.email}
                            </div>
                            <div className="flex items-center text-sm mt-1">
                              <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                              {customer.phone_number || 'N/A'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <div className="flex items-center text-sm">
                              <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                              {customer.country_of_origin || 'N/A'}
                            </div>
                            <div className="flex items-center text-sm mt-1">
                              <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                              {customer.residence || 'N/A'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-semibold">{customer.total_points || 0}</div>
                          <div className="text-xs text-muted-foreground">points</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {customer.email_confirmed ? (
                            <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                              <Check className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-100">
                              <Check className="h-3 w-3 mr-1" />
                              Not Verified
                            </Badge>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => toggleCustomerDetails(customer.id)}
                              className="p-2 rounded-lg hover:bg-accent transition-colors"
                              title="View details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleCustomerSelect(customer)}
                              className="p-2 rounded-lg hover:bg-accent transition-colors"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded details row */}
                      <AnimatePresence>
                        {expandedCustomerId === customer.id && (
                          <motion.tr
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <td colSpan="6" className="px-6 py-4">
                              <div className="bg-muted/30 p-4 rounded-lg">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-medium mb-2">Personal Information</h4>
                                    <div className="space-y-1 text-sm">
                                      <div className="flex">
                                        <span className="w-32 text-muted-foreground">ID:</span>
                                        <span>{customer.id}</span>
                                      </div>
                                      <div className="flex">
                                        <span className="w-32 text-muted-foreground">Email:</span>
                                        <span>{customer.email}</span>
                                      </div>
                                      <div className="flex">
                                        <span className="w-32 text-muted-foreground">Phone:</span>
                                        <span>{customer.phone_number || 'N/A'}</span>
                                      </div>
                                      <div className="flex">
                                        <span className="w-32 text-muted-foreground">Date of Birth:</span>
                                        <span>{customer.date_of_birth ? new Date(customer.date_of_birth).toLocaleDateString() : 'N/A'}</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div>
                                    <h4 className="font-medium mb-2">Location</h4>
                                    <div className="space-y-1 text-sm">
                                      <div className="flex">
                                        <span className="w-32 text-muted-foreground">Country of Origin:</span>
                                        <span>{customer.country_of_origin || 'N/A'}</span>
                                      </div>
                                      <div className="flex">
                                        <span className="w-32 text-muted-foreground">Residence:</span>
                                        <span>{customer.residence || 'N/A'}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </motion.tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-sm text-muted-foreground">
                      {searchTerm || locationFilter || verifiedFilter !== 'all'
                        ? 'No customers found matching your filters'
                        : 'No customers found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </GlassCard>

      <EditCustomerModal
        customer={selectedCustomer}
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        onSave={(updatedCustomer) => {
          // Update the customer in the list
          setCustomers(prev =>
            prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c)
          );
          setSelectedCustomer(null);
        }}
      />

      <AddCustomerModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={(newCustomer) => {
          // Add the new customer to the list
          setCustomers(prev => [newCustomer, ...prev]);
          setShowAddModal(false);
        }}
      />
    </motion.div>
  );
}