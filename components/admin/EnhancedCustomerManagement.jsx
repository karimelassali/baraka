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
  Loader,
  MoreHorizontal,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import GlassCard from '../../components/ui/GlassCard';
import { useSearchParams } from 'next/navigation';

// --- Components ---

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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <motion.div
        className="bg-card rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-border/50"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
      >
        <div className="p-6">
          <div className="flex flex-row items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <User className="h-6 w-6 text-primary" />
                </div>
                Add New Customer
              </h2>
              <p className="text-muted-foreground mt-1 ml-12">Create a new customer account manually.</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {status.message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-6 p-4 rounded-xl border ${status.type === 'success'
                ? 'bg-green-50 text-green-900 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800'
                : 'bg-red-50 text-red-900 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800'
                }`}
            >
              <div className="flex items-center gap-2">
                {status.type === 'success' ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
                <span className="font-medium">{status.message}</span>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-medium">First Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <input
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                    placeholder="John"
                    className="w-full pl-10 pr-4 py-2.5 border border-input rounded-xl bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Last Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <input
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                    placeholder="Doe"
                    className="w-full pl-10 pr-4 py-2.5 border border-input rounded-xl bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="john.doe@example.com"
                    className="w-full pl-10 pr-4 py-2.5 border border-input rounded-xl bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <input
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 border border-input rounded-xl bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <input
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    placeholder="+1 234 567 890"
                    className="w-full pl-10 pr-4 py-2.5 border border-input rounded-xl bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Country of Origin</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <input
                    name="country_of_origin"
                    value={formData.country_of_origin}
                    onChange={handleChange}
                    placeholder="USA"
                    className="w-full pl-10 pr-4 py-2.5 border border-input rounded-xl bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Residence</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <input
                    name="residence"
                    value={formData.residence}
                    onChange={handleChange}
                    placeholder="New York"
                    className="w-full pl-10 pr-4 py-2.5 border border-input rounded-xl bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Date of Birth</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <input
                    name="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-input rounded-xl bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-border/50">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
                className="rounded-xl px-6"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="rounded-xl px-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
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
        </div>
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <motion.div
        className="bg-card rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-border/50"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
      >
        <div className="p-6">
          <div className="flex flex-row items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Edit className="h-6 w-6 text-blue-500" />
                </div>
                Edit Customer
              </h2>
              <p className="text-muted-foreground mt-1 ml-12">
                Update details for {customer.first_name} {customer.last_name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {status.message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-6 p-4 rounded-xl border ${status.type === 'success'
                ? 'bg-green-50 text-green-900 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800'
                : 'bg-red-50 text-red-900 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800'
                }`}
            >
              <div className="flex items-center gap-2">
                {status.type === 'success' ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
                <span className="font-medium">{status.message}</span>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-medium">First Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <input
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-input rounded-xl bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Last Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <input
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-input rounded-xl bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-input rounded-xl bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <input
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-input rounded-xl bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Country of Origin</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <input
                    name="country_of_origin"
                    value={formData.country_of_origin}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-input rounded-xl bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Residence</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <input
                    name="residence"
                    value={formData.residence}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-input rounded-xl bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium">Date of Birth</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <input
                    name="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-input rounded-xl bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-border/50">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
                className="rounded-xl px-6"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="rounded-xl px-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
              >
                {loading ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default function EnhancedCustomerManagement() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [expandedCustomerId, setExpandedCustomerId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const searchParams = useSearchParams();

  const LIMIT = 10;

  // Filter and sort states
  const [locationFilter, setLocationFilter] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState('all'); // 'all', 'verified', 'not-verified'

  // Load customers with pagination
  const loadCustomers = async (reset = false) => {
    const currentOffset = reset ? 0 : offset;

    if (reset) {
      setLoading(true);
      setOffset(0);
      setHasMore(true);
    } else {
      setLoadingMore(true);
    }

    try {
      let url = `/api/admin/customers?limit=${LIMIT}&offset=${currentOffset}&sort_by=created_at&sort_order=desc`;

      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        const newCustomers = data.customers || [];

        if (reset) {
          setCustomers(newCustomers);
        } else {
          setCustomers(prev => [...prev, ...newCustomers]);
        }

        // Check if we have more customers to load
        if (newCustomers.length < LIMIT) {
          setHasMore(false);
        } else {
          setOffset(currentOffset + LIMIT);
        }
      } else {
        console.error('Failed to load customers:', data.error);
        if (reset) setCustomers([]);
      }
    } catch (error) {
      console.error('Error loading customers:', error);
      if (reset) setCustomers([]);
    } finally {
      if (reset) setLoading(false);
      else setLoadingMore(false);
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

  // Filtering and sorting on the client side (for the loaded batch)
  // Note: Ideally filtering should be server-side for large datasets, 
  // but we'll keep client-side for the loaded batch as per current architecture
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
      // Sort by date
      if (sortDirection === 'asc') {
        return new Date(a.created_at || a.date_of_birth || '1970-01-01') - new Date(b.created_at || b.date_of_birth || '1970-01-01');
      } else {
        return new Date(b.created_at || b.date_of_birth || '1970-01-01') - new Date(a.created_at || a.date_of_birth || '1970-01-01');
      }
    } else {
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

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection(field === 'name' ? 'asc' : 'desc');
    }
  };

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
      {/* Header Card */}
      <GlassCard className="border-l-4 border-l-primary overflow-hidden relative">
        <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <CardHeader className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <User className="h-6 w-6 text-primary" />
                </div>
                Customer Management
              </CardTitle>
              <p className="text-muted-foreground mt-2 ml-1">
                Manage your customer base, track points, and view details.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-10 pr-4 py-2.5 bg-background/50 border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-w-[260px] transition-all"
                />
              </div>
              <Button
                className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 flex items-center gap-2 px-5"
                onClick={() => setShowAddModal(true)}
              >
                <Plus className="h-4 w-4" />
                Add Customer
              </Button>
            </div>
          </div>

          {/* Advanced filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6 pt-6 border-t border-border/50">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <input
                  type="text"
                  placeholder="Filter by location"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-background/50 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Status</label>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <select
                  value={verifiedFilter}
                  onChange={(e) => setVerifiedFilter(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-background/50 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none transition-all"
                >
                  <option value="all">All Customers</option>
                  <option value="verified">Verified Only</option>
                  <option value="not-verified">Unverified Only</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Sort By</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <select
                    value={sortField}
                    onChange={(e) => setSortField(e.target.value)}
                    className="w-full px-3 py-2 bg-background/50 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none transition-all"
                  >
                    <option value="created_at">Registration Date</option>
                    <option value="name">Name</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 pointer-events-none" />
                </div>
                <button
                  onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 bg-background/50 border border-input rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  {sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        </CardHeader>
      </GlassCard>

      {/* Customer Table */}
      <GlassCard className="p-0 overflow-hidden border-0 shadow-xl">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/30 border-b border-border/50">
                <tr>
                  <th
                    className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-primary transition-colors"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-1">
                      Name {getSortIndicator('name')}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contact Info</th>
                  <th
                    className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-primary transition-colors"
                    onClick={() => handleSort('location')}
                  >
                    <div className="flex items-center gap-1">
                      Location {getSortIndicator('location')}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Loyalty</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {loading && customers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <p className="text-sm text-muted-foreground">Loading customers...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredAndSortedCustomers.length > 0 ? (
                  filteredAndSortedCustomers.map((customer, index) => (
                    <React.Fragment key={customer.id}>
                      <motion.tr
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`group hover:bg-muted/30 transition-colors ${expandedCustomerId === customer.id ? 'bg-muted/40' : ''}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 text-sm font-bold shadow-sm ${index % 3 === 0 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                                index % 3 === 1 ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                                  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                              }`}>
                              {customer.first_name?.[0]}{customer.last_name?.[0]}
                            </div>
                            <div>
                              <div className="font-semibold text-foreground">{customer.first_name} {customer.last_name}</div>
                              <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                <Calendar className="h-3 w-3" />
                                {customer.date_of_birth ? new Date(customer.date_of_birth).toLocaleDateString() : 'No DOB'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center text-sm group-hover:text-primary transition-colors">
                              <Mail className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                              {customer.email}
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Phone className="h-3.5 w-3.5 mr-2" />
                              {customer.phone_number || 'N/A'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center text-sm">
                              <MapPin className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                              <span className="font-medium">{customer.country_of_origin || 'N/A'}</span>
                            </div>
                            {customer.residence && (
                              <div className="text-xs text-muted-foreground ml-5.5">
                                {customer.residence}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <div className="font-bold text-lg text-primary">{customer.total_points || 0}</div>
                            <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Points</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {customer.email_confirmed ? (
                            <Badge variant="default" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800">
                              <Check className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800">
                              Pending
                            </Badge>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => toggleCustomerDetails(customer.id)}
                              className={`p-2 rounded-lg transition-all ${expandedCustomerId === customer.id
                                  ? 'bg-primary text-primary-foreground shadow-md'
                                  : 'hover:bg-background hover:shadow-sm border border-transparent hover:border-border'
                                }`}
                              title="View details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleCustomerSelect(customer)}
                              className="p-2 rounded-lg hover:bg-background hover:shadow-sm border border-transparent hover:border-border transition-all text-blue-600 dark:text-blue-400"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>

                      {/* Expanded details row */}
                      <AnimatePresence>
                        {expandedCustomerId === customer.id && (
                          <motion.tr
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                          >
                            <td colSpan="6" className="px-0 py-0 border-b border-border/50">
                              <div className="bg-muted/30 p-6 border-t border-border/50 shadow-inner">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                  <div className="bg-background/50 p-5 rounded-xl border border-border/50">
                                    <h4 className="font-semibold mb-4 flex items-center gap-2 text-primary">
                                      <User className="h-4 w-4" /> Personal Information
                                    </h4>
                                    <div className="space-y-3 text-sm">
                                      <div className="flex justify-between py-1 border-b border-border/30">
                                        <span className="text-muted-foreground">Customer ID</span>
                                        <span className="font-mono text-xs">{customer.id.substring(0, 8)}...</span>
                                      </div>
                                      <div className="flex justify-between py-1 border-b border-border/30">
                                        <span className="text-muted-foreground">Full Name</span>
                                        <span className="font-medium">{customer.first_name} {customer.last_name}</span>
                                      </div>
                                      <div className="flex justify-between py-1 border-b border-border/30">
                                        <span className="text-muted-foreground">Date of Birth</span>
                                        <span>{customer.date_of_birth ? new Date(customer.date_of_birth).toLocaleDateString() : 'N/A'}</span>
                                      </div>
                                      <div className="flex justify-between py-1">
                                        <span className="text-muted-foreground">Joined</span>
                                        <span>{new Date(customer.created_at).toLocaleDateString()}</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="bg-background/50 p-5 rounded-xl border border-border/50">
                                    <h4 className="font-semibold mb-4 flex items-center gap-2 text-primary">
                                      <MapPin className="h-4 w-4" /> Contact & Location
                                    </h4>
                                    <div className="space-y-3 text-sm">
                                      <div className="flex justify-between py-1 border-b border-border/30">
                                        <span className="text-muted-foreground">Email</span>
                                        <span className="font-medium">{customer.email}</span>
                                      </div>
                                      <div className="flex justify-between py-1 border-b border-border/30">
                                        <span className="text-muted-foreground">Phone</span>
                                        <span>{customer.phone_number || 'N/A'}</span>
                                      </div>
                                      <div className="flex justify-between py-1 border-b border-border/30">
                                        <span className="text-muted-foreground">Country</span>
                                        <span>{customer.country_of_origin || 'N/A'}</span>
                                      </div>
                                      <div className="flex justify-between py-1">
                                        <span className="text-muted-foreground">Residence</span>
                                        <span>{customer.residence || 'N/A'}</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="bg-background/50 p-5 rounded-xl border border-border/50">
                                    <h4 className="font-semibold mb-4 flex items-center gap-2 text-primary">
                                      <Check className="h-4 w-4" /> Account Status
                                    </h4>
                                    <div className="space-y-3 text-sm">
                                      <div className="flex justify-between items-center py-1 border-b border-border/30">
                                        <span className="text-muted-foreground">Email Verified</span>
                                        {customer.email_confirmed ? (
                                          <span className="text-green-600 flex items-center gap-1 text-xs font-bold uppercase"><Check className="h-3 w-3" /> Yes</span>
                                        ) : (
                                          <span className="text-amber-600 flex items-center gap-1 text-xs font-bold uppercase">No</span>
                                        )}
                                      </div>
                                      <div className="flex justify-between items-center py-1 border-b border-border/30">
                                        <span className="text-muted-foreground">Total Points</span>
                                        <span className="font-bold text-primary">{customer.total_points || 0}</span>
                                      </div>
                                      <div className="flex justify-between items-center py-1">
                                        <span className="text-muted-foreground">Vouchers</span>
                                        <span className="font-medium">{customer.vouchers_count || 0}</span>
                                      </div>
                                      <div className="pt-2 mt-2">
                                        <Button size="sm" variant="outline" className="w-full" onClick={() => handleCustomerSelect(customer)}>
                                          Edit Profile
                                        </Button>
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
                    <td colSpan="6" className="px-6 py-16 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Search className="h-10 w-10 text-muted-foreground/30" />
                        <p className="font-medium">No customers found</p>
                        <p className="text-sm">Try adjusting your search or filters</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Load More Button */}
          {hasMore && !loading && filteredAndSortedCustomers.length > 0 && (
            <div className="p-4 border-t border-border/50 flex justify-center bg-muted/10">
              <Button
                variant="outline"
                onClick={() => loadCustomers(false)}
                disabled={loadingMore}
                className="min-w-[200px] rounded-xl border-primary/20 hover:bg-primary/5 hover:text-primary hover:border-primary/50 transition-all"
              >
                {loadingMore ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Loading more...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Load More Customers
                  </>
                )}
              </Button>
            </div>
          )}
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