// components/admin/PointsManagement.jsx
"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  CheckCircle,
  X,
  User,
  Mail,
  MapPin,
  Phone,
  Award,
  History,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import GlassCard from '../../components/ui/GlassCard';
import { Input } from '../../components/ui/input';

function CustomerDetailsModal({ customer, isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    points: 0,
    reason: ''
  });
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customer && isOpen) {
      loadTransactionHistory();
      setFormData({ points: 0, reason: '' });
      setStatus({ type: '', message: '' });
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
    setLoading(true);

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
              <Award className="h-6 w-6 text-yellow-500" />
              Manage Points - {customer.first_name} {customer.last_name}
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
                    <p className="text-2xl font-bold text-yellow-500">{customer.total_points || 0}</p>
                  </div>
                </div>
              </div>

              {/* Points Form */}
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-yellow-500" /> Update Points
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
                    <label className="block text-xs font-medium mb-1">Points (+/-)</label>
                    <Input
                      name="points"
                      type="number"
                      value={formData.points}
                      onChange={handleChange}
                      placeholder="e.g. 100 or -50"
                      className="bg-background"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1">Reason</label>
                    <Input
                      name="reason"
                      value={formData.reason}
                      onChange={handleChange}
                      placeholder="Reason for adjustment"
                      className="bg-background"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
                  >
                    {loading ? 'Updating...' : 'Update Points'}
                  </Button>
                </form>
              </div>
            </div>

            {/* Transaction History */}
            <div className="md:col-span-2 flex flex-col h-full">
              <div className="bg-muted/30 rounded-lg border border-border/50 flex flex-col h-full overflow-hidden">
                <div className="p-4 border-b border-border/50 bg-muted/20">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <History className="h-4 w-4" /> Transaction History
                  </h4>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  {loadingHistory ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
                    </div>
                  ) : transactionHistory.length > 0 ? (
                    <div className="space-y-3">
                      {transactionHistory.map((transaction) => (
                        <div key={transaction.id} className="bg-background border border-border rounded-lg p-3 flex justify-between items-center shadow-sm">
                          <div>
                            <p className="font-medium text-sm">{transaction.description || transaction.transaction_type}</p>
                            <p className="text-xs text-muted-foreground">{new Date(transaction.created_at).toLocaleString()}</p>
                          </div>
                          <div className={`flex items-center gap-1 font-bold ${transaction.points > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {transaction.points > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            {transaction.points > 0 ? '+' : ''}{transaction.points}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                      <History className="h-12 w-12 mb-2 opacity-20" />
                      <p>No transaction history available</p>
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
                <Award className="h-5 w-5 text-yellow-500" />
                Points Management
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Add or deduct loyalty points for customers
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
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading && customers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
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
                        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-200 hover:bg-yellow-500/20">
                          {customer.total_points || 0} pts
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCustomerSelect(customer)}
                          className="hover:bg-yellow-500/10 hover:text-yellow-600 hover:border-yellow-200"
                        >
                          Manage Points
                        </Button>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-muted-foreground">
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
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-500"></div>
            </div>
          )}
        </CardContent>
      </GlassCard>

      <CustomerDetailsModal
        customer={selectedCustomer}
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        onSave={() => {
          // Reload the customer list to reflect changes
          loadCustomers(true);
        }}
      />
    </motion.div>
  );
}