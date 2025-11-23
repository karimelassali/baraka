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
  Calendar,
  CreditCard,
  Plus,
  Sparkles,
  Gift,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import GlassCard from '../../components/ui/GlassCard';
import { Input } from '../../components/ui/input';

// --- Sub-components ---

const VoucherTicket = ({ voucher }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="relative group"
  >
    <div className={`
      relative overflow-hidden rounded-xl border-2 
      ${voucher.is_used
        ? 'bg-muted border-muted-foreground/20 opacity-75'
        : voucher.is_active
          ? 'bg-background border-purple-500/30 hover:border-purple-500/60'
          : 'bg-background border-red-200 dark:border-red-900/30'}
      transition-all duration-300 shadow-sm hover:shadow-md
    `}>
      {/* Ticket Cutouts */}
      <div className="absolute top-1/2 -left-3 w-6 h-6 bg-background rounded-full border-2 border-inherit z-10 transform -translate-y-1/2" />
      <div className="absolute top-1/2 -right-3 w-6 h-6 bg-background rounded-full border-2 border-inherit z-10 transform -translate-y-1/2" />

      <div className="p-5 flex flex-col h-full relative z-0">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${voucher.is_active && !voucher.is_used ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-muted text-muted-foreground'}`}>
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <p className="font-mono font-bold text-lg tracking-wider">{voucher.code}</p>
              <p className="text-xs text-muted-foreground">Code</p>
            </div>
          </div>
          <Badge variant="outline" className={`
            ${voucher.is_used
              ? 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400'
              : voucher.is_active
                ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400'}
          `}>
            {voucher.is_used ? 'Redeemed' : voucher.is_active ? 'Active' : 'Expired'}
          </Badge>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Value</span>
            <span className="font-bold text-lg">{voucher.value} {voucher.currency}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Cost</span>
            <span className="font-medium text-purple-600 dark:text-purple-400">{voucher.points_redeemed} pts</span>
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-dashed border-border flex justify-between items-center text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(voucher.created_at).toLocaleDateString()}
          </div>
          {voucher.expires_at && (
            <div className="flex items-center gap-1 text-orange-500">
              <Clock className="w-3 h-3" />
              Exp: {new Date(voucher.expires_at).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
    </div>
  </motion.div>
);

function VoucherWallet({ customer, vouchers, isOpen, onClose, onSave }) {
  const [newVoucherData, setNewVoucherData] = useState({
    pointsToRedeem: '',
    description: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

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
        setStatus({ type: 'success', message: 'Voucher issued successfully!' });
        setNewVoucherData({ pointsToRedeem: '', description: '' });
        onSave && onSave();
        setTimeout(() => {
          setShowCreateForm(false);
          setStatus({ type: '', message: '' });
        }, 1500);
      } else {
        setStatus({ type: 'error', message: result.error || 'Failed to issue voucher' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'An error occurred' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !customer) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <motion.div
        className="bg-background/95 border border-border/50 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
      >
        {/* Header */}
        <div className="p-6 border-b border-border/50 flex justify-between items-center bg-muted/20">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 rounded-xl">
              <Gift className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Voucher Wallet</h2>
              <p className="text-sm text-muted-foreground">Manage vouchers for {customer.first_name}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Left Panel: Create Voucher */}
          <div className="w-full md:w-1/3 p-6 border-r border-border/50 bg-muted/10 overflow-y-auto">
            <div className="bg-purple-500/5 border border-purple-500/10 rounded-xl p-6 mb-6">
              <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">Available Points</p>
              <p className="text-3xl font-black">{customer.total_points || 0}</p>
            </div>

            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4" /> Issue New Voucher
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase text-muted-foreground">Points to Redeem</label>
                <Input
                  name="pointsToRedeem"
                  type="number"
                  value={newVoucherData.pointsToRedeem}
                  onChange={handleChange}
                  placeholder="e.g. 500"
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium uppercase text-muted-foreground">Description</label>
                <Input
                  name="description"
                  value={newVoucherData.description}
                  onChange={handleChange}
                  placeholder="e.g. Loyalty Reward"
                  className="bg-background"
                />
              </div>

              {status.message && (
                <div className={`text-xs p-3 rounded-lg flex items-center gap-2 ${status.type === 'success' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                  {status.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  {status.message}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading || !newVoucherData.pointsToRedeem}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                {loading ? 'Issuing...' : 'Issue Voucher'}
              </Button>
            </form>
          </div>

          {/* Right Panel: Voucher List */}
          <div className="w-full md:w-2/3 p-6 bg-background overflow-y-auto custom-scrollbar">
            <h3 className="font-semibold mb-6 flex items-center gap-2">
              <Ticket className="w-4 h-4 text-muted-foreground" /> Active & Past Vouchers
            </h3>

            {vouchers && vouchers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vouchers.map((voucher) => (
                  <VoucherTicket key={voucher.id} voucher={voucher} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground opacity-50">
                <Ticket className="w-16 h-16 mb-4 stroke-1" />
                <p>No vouchers issued yet</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

const CustomerVoucherCard = ({ customer, onClick }) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    whileHover={{ y: -5, transition: { duration: 0.2 } }}
    onClick={() => onClick(customer)}
    className="group cursor-pointer relative"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <GlassCard className="h-full border-border/50 hover:border-purple-500/50 transition-colors overflow-hidden relative">
      <div className="absolute top-0 right-0 p-2 opacity-50 group-hover:opacity-100 transition-opacity">
        <div className="bg-purple-500/10 p-2 rounded-full">
          <Ticket className="w-4 h-4 text-purple-600" />
        </div>
      </div>

      <CardContent className="p-6 flex flex-col items-center text-center pt-8">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/40 dark:to-purple-900/10 flex items-center justify-center mb-4 shadow-inner overflow-hidden border-2 border-purple-500/20">
          <img
            src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${customer.first_name}`}
            alt={customer.first_name}
            className="w-full h-full object-cover"
          />
        </div>

        <h3 className="font-bold text-lg truncate w-full px-2">{customer.first_name} {customer.last_name}</h3>
        <p className="text-sm text-muted-foreground truncate w-full px-2 mb-4">{customer.email}</p>

        <div className="mt-auto w-full pt-4 border-t border-border/50 flex justify-between items-center px-2">
          <div className="text-left">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Points</p>
            <p className="font-bold">{customer.total_points || 0}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Vouchers</p>
            <p className="font-bold text-purple-600 dark:text-purple-400">{customer.vouchers_count || 0}</p>
          </div>
        </div>
      </CardContent>
    </GlassCard>
  </motion.div>
);

export default function VoucherManagement() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerVouchers, setCustomerVouchers] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);

  const LIMIT = 10;

  const loadCustomers = async (reset = false) => {
    if (reset) {
      setLoading(true);
      setOffset(0);
    } else {
      setLoadingMore(true);
    }

    try {
      let url = `/api/admin/customers?limit=${LIMIT}&offset=${reset ? 0 : offset}`;
      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        const newCustomers = data.customers || data;
        if (reset) {
          setCustomers(newCustomers);
        } else {
          setCustomers(prev => [...prev, ...newCustomers]);
        }
        setHasMore(newCustomers.length === LIMIT);
        if (!reset) setOffset(prev => prev + LIMIT);
        else setOffset(LIMIT);
      } else {
        if (reset) setCustomers([]);
      }
    } catch (error) {
      if (reset) setCustomers([]);
    } finally {
      if (reset) setLoading(false);
      else setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadCustomers(true);
  }, [searchTerm]);

  const handleSearch = (e) => setSearchTerm(e.target.value);

  const handleCustomerSelect = async (customer) => {
    setSelectedCustomer(customer);
    try {
      const response = await fetch(`/api/admin/customers/${customer.id}/vouchers`);
      const data = await response.json();
      if (response.ok) {
        setCustomerVouchers(data.vouchers || []);
      } else {
        setCustomerVouchers([]);
      }
    } catch (error) {
      setCustomerVouchers([]);
    }
  };

  const handleLoadMore = () => {
    if (!hasMore || loadingMore) return;
    loadCustomers(false);
  };

  return (
    <motion.div
      className="space-y-8 pb-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Voucher Center</h2>
          <p className="text-muted-foreground mt-2">Issue and track vouchers for your customers.</p>
        </div>

        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-3 bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Content Grid */}
      {loading && customers.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-muted/20 animate-pulse" />
          ))}
        </div>
      ) : customers.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {customers.map((customer) => (
                <CustomerVoucherCard
                  key={customer.id}
                  customer={customer}
                  onClick={handleCustomerSelect}
                />
              ))}
            </AnimatePresence>
          </div>

          {hasMore && (
            <div className="flex justify-center mt-8">
              <Button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="bg-purple-600 hover:bg-purple-700 text-white min-w-[200px]"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load More Customers'
                )}
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <div className="bg-muted/30 p-6 rounded-full mb-4">
            <User className="h-10 w-10 opacity-50" />
          </div>
          <p className="text-lg font-medium">No customers found</p>
          <p className="text-sm">Try adjusting your search terms</p>
        </div>
      )}

      <VoucherWallet
        customer={selectedCustomer}
        vouchers={customerVouchers}
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        onSave={() => {
          loadCustomers(true);
          if (selectedCustomer) handleCustomerSelect(selectedCustomer);
        }}
      />
    </motion.div>
  );
}