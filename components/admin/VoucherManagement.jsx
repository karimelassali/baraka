// components/admin/VoucherManagement.jsx
"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Ticket,
  X,
  User,
  Mail,
  MapPin,
  Phone,
  Calendar,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import GlassCard from '../../components/ui/GlassCard';
import { Input } from '../../components/ui/input';

function History({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l4 2" />
    </svg>
  )
}

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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        className="bg-card rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        <GlassCard className="h-full flex flex-col border-0 shadow-none rounded-none">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/50">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Ticket className="h-6 w-6 text-purple-500" />
              Voucher Management - {customer.first_name} {customer.last_name}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
              <X className="h-5 w-5" />
            </Button>
          </CardHeader>

          <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
            {/* Customer Information */}
            <div className="md:col-span-1 space-y-6">
              <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" /> Customer Info
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    <span className="truncate">{customer.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    <span>{customer.phone_number || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>{customer.country_of_origin || 'N/A'}</span>
                  </div>
                  <div className="pt-2 mt-2 border-t border-border/50">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Points</p>
                    <p className="text-2xl font-bold text-purple-500">{customer.total_points || 0}</p>
                  </div>
                </div>
              </div>

              {/* Create Voucher Form */}
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Ticket className="h-4 w-4 text-purple-500" /> Create New Voucher
                </h4>
                {status.message && (
                  <div className={`mb-3 p-2 rounded text-sm ${status.type === 'success'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                    {status.message}
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">Points to Redeem</label>
                    <Input
                      name="pointsToRedeem"
                      type="number"
                      value={newVoucherData.pointsToRedeem}
                      onChange={handleChange}
                      min="1"
                      placeholder="Enter points"
                      className="bg-background"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1">Description</label>
                    <Input
                      name="description"
                      value={newVoucherData.description}
                      onChange={handleChange}
                      placeholder="Voucher description"
                      className="bg-background"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    {loading ? 'Creating...' : 'Create Voucher'}
                  </Button>
                </form>
              </div>
            </div>

            {/* Voucher History */}
            <div className="md:col-span-2 flex flex-col h-full">
              <div className="bg-muted/30 rounded-lg border border-border/50 flex flex-col h-full overflow-hidden">
                <div className="p-4 border-b border-border/50 bg-muted/20">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <History className="h-4 w-4" /> Voucher History
                  </h4>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  {vouchers && vouchers.length > 0 ? (
                    <div className="space-y-3">
                      {vouchers.map((voucher) => (
                        <div key={voucher.id} className="bg-background border border-border rounded-lg p-3 shadow-sm">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono font-bold text-lg tracking-wider bg-muted px-2 py-0.5 rounded border border-border">
                                  {voucher.code}
                                </span>
                                <Badge variant="outline" className={`
                                  ${voucher.is_used
                                    ? 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
                                    : voucher.is_active
                                      ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
                                      : 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'}
                                `}>
                                  {voucher.is_used ? 'Used' : voucher.is_active ? 'Active' : 'Expired'}
                                </Badge>
                              </div>
                              <p className="text-sm font-medium flex items-center gap-1 mt-2">
                                <CreditCard className="h-3 w-3 text-muted-foreground" />
                                {voucher.value} {voucher.currency}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Created: {new Date(voucher.created_at).toLocaleString()}
                              </p>
                              {voucher.expires_at && (
                                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  Expires: {new Date(voucher.expires_at).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-bold text-purple-500 flex items-center justify-end gap-1">
                                {voucher.points_redeemed} pts
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                      <Ticket className="h-12 w-12 mb-2 opacity-20" />
                      <p>No vouchers available for this customer</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-border/50 flex justify-end bg-muted/10">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </GlassCard>
      </motion.div>
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
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <GlassCard>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5 text-purple-500" />
                Voucher Management
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Create and manage customer vouchers
              </p>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search customers..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10 pr-4 py-2 min-w-[300px]"
              />
            </div>
          </div>
        </CardHeader>
      </GlassCard>

      <GlassCard className="overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Country</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Points</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Vouchers</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading && customers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                      </div>
                    </td>
                  </tr>
                ) : customers.length > 0 ? (
                  customers.map((customer) => (
                    <motion.tr
                      key={customer.id}
                      className="hover:bg-accent/50 transition-colors"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-foreground">{customer.first_name} {customer.last_name}</div>
                        <div className="text-xs text-muted-foreground">{customer.date_of_birth ? new Date(customer.date_of_birth).toLocaleDateString() : 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {customer.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">{customer.country_of_origin || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-200 hover:bg-purple-500/20">
                          {customer.total_points || 0} pts
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {customer.vouchers_count || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCustomerSelect(customer)}
                          className="hover:bg-purple-500/10 hover:text-purple-600 hover:border-purple-200"
                        >
                          Manage Vouchers
                        </Button>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <User className="h-8 w-8 text-muted-foreground/50" />
                        <p>{searchTerm ? 'No customers found matching your search' : 'No customers found'}</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {loadingMore && (
            <div className="flex justify-center py-4 border-t border-border">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
            </div>
          )}
        </CardContent>
      </GlassCard>

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
    </motion.div>
  );
}