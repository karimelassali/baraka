// components/admin/PointsManagement.jsx
"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  X,
  User,
  Mail,
  MapPin,
  Award,
  History,
  TrendingUp,
  TrendingDown,
  Plus,
  Minus,
  Save,
  Sparkles,
  Zap,
  Loader2
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import GlassCard from '../../components/ui/GlassCard';
import { Input } from '../../components/ui/input';

// --- Sub-components ---

const QuickPointButton = ({ amount, onClick, type = 'add' }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={() => onClick(type === 'add' ? amount : -amount)}
    className={`
      flex items-center justify-center gap-1 px-4 py-2 rounded-xl font-bold text-sm transition-all
      ${type === 'add'
        ? 'bg-green-500/10 text-green-600 border border-green-500/20 hover:bg-green-500/20'
        : 'bg-red-500/10 text-red-600 border border-red-500/20 hover:bg-red-500/20'}
    `}
  >
    {type === 'add' ? <Plus className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
    {amount}
  </motion.button>
);

function PointsConsole({ customer, isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    points: '',
    reason: ''
  });
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customer && isOpen) {
      loadTransactionHistory();
      setFormData({ points: '', reason: '' });
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

  const handleQuickAdd = (amount) => {
    setFormData(prev => ({ ...prev, points: amount }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.points) return;

    setStatus({ type: '', message: '' });
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/customers/${customer.id}/points`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          points: parseInt(formData.points),
          reason: formData.reason || 'Manual adjustment'
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', message: 'Points updated successfully' });
        setFormData({ points: '', reason: '' });
        onSave && onSave();
        loadTransactionHistory();
      } else {
        setStatus({ type: 'error', message: result.error || 'Failed to update points' });
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
        className="bg-background/95 border border-border/50 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
      >
        {/* Left Panel: Profile & Actions */}
        <div className="w-full md:w-2/5 bg-muted/30 p-6 md:p-8 flex flex-col border-r border-border/50 relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-yellow-500/10 to-transparent pointer-events-none" />
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-yellow-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-yellow-500/20 rounded-2xl">
                <Award className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full md:hidden">
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-yellow-500/20">
                <img
                  src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${customer.first_name}`}
                  alt={customer.first_name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-xl font-bold">{customer.first_name} {customer.last_name}</h2>
                <p className="text-muted-foreground text-sm flex items-center gap-1">
                  <Mail className="w-3 h-3" /> {customer.email}
                </p>
              </div>
            </div>

            <div className="bg-background/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 mb-8 text-center shadow-sm">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Current Balance</p>
              <div className="text-5xl font-black text-foreground tracking-tight flex items-center justify-center gap-2">
                {customer.total_points || 0}
                <span className="text-lg font-normal text-muted-foreground mt-4">pts</span>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" /> Quick Actions
              </h3>
              <div className="flex flex-wrap gap-2">
                <QuickPointButton amount={50} onClick={handleQuickAdd} type="add" />
                <QuickPointButton amount={100} onClick={handleQuickAdd} type="add" />
                <QuickPointButton amount={500} onClick={handleQuickAdd} type="add" />
                <QuickPointButton amount={50} onClick={handleQuickAdd} type="subtract" />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Custom Adjustment</label>
                <div className="flex gap-2">
                  <Input
                    name="points"
                    type="number"
                    value={formData.points}
                    onChange={handleChange}
                    placeholder="+/- Points"
                    className="bg-background font-mono"
                  />
                  <Button type="submit" disabled={loading} className="bg-yellow-500 hover:bg-yellow-600 text-white min-w-[100px]">
                    {loading ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : 'Apply'}
                  </Button>
                </div>
              </div>
              <Input
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                placeholder="Reason (optional)"
                className="bg-background text-sm"
              />
              {status.message && (
                <div className={`text-xs p-2 rounded ${status.type === 'success' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                  {status.message}
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Right Panel: History */}
        <div className="w-full md:w-3/5 bg-background p-6 md:p-8 flex flex-col h-full overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <History className="w-5 h-5 text-muted-foreground" /> Transaction History
            </h3>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hidden md:flex">
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {loadingHistory ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
              </div>
            ) : transactionHistory.length > 0 ? (
              <div className="relative border-l-2 border-muted ml-3 space-y-8 py-2">
                {transactionHistory.map((transaction, idx) => (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="relative pl-8"
                  >
                    <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-background ${transaction.points > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                    <div className="flex justify-between items-start group">
                      <div>
                        <p className="font-medium text-foreground group-hover:text-yellow-600 transition-colors">
                          {transaction.description || (transaction.points > 0 ? 'Points Added' : 'Points Deducted')}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(transaction.created_at).toLocaleString()}
                        </p>
                      </div>
                      <span className={`font-mono font-bold ${transaction.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.points > 0 ? '+' : ''}{transaction.points}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground opacity-50">
                <History className="w-16 h-16 mb-4 stroke-1" />
                <p>No transactions yet</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

const CustomerCard = ({ customer, onClick }) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    whileHover={{ y: -5, transition: { duration: 0.2 } }}
    onClick={() => onClick(customer)}
    className="group cursor-pointer relative"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <GlassCard className="h-full border-border/50 hover:border-yellow-500/50 transition-colors overflow-hidden relative">
      <div className="absolute top-0 right-0 p-2 opacity-50 group-hover:opacity-100 transition-opacity">
        <div className="bg-yellow-500/10 p-2 rounded-full">
          <TrendingUp className="w-4 h-4 text-yellow-600" />
        </div>
      </div>

      <CardContent className="p-6 flex flex-col items-center text-center pt-8">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-50 dark:from-yellow-900/40 dark:to-yellow-900/10 flex items-center justify-center mb-4 shadow-inner overflow-hidden border-2 border-yellow-500/20">
          <img
            src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${customer.first_name}`}
            alt={customer.first_name}
            className="w-full h-full object-cover"
          />
        </div>

        <h3 className="font-bold text-lg truncate w-full px-2">{customer.first_name} {customer.last_name}</h3>
        <p className="text-sm text-muted-foreground truncate w-full px-2 mb-4">{customer.email}</p>

        <div className="mt-auto w-full pt-4 border-t border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Points</p>
          <p className="text-3xl font-black text-foreground group-hover:text-yellow-500 transition-colors">
            {customer.total_points || 0}
          </p>
        </div>
      </CardContent>
    </GlassCard>
  </motion.div>
);

export default function PointsManagement() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
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
          <h2 className="text-3xl font-bold tracking-tight">Points Dashboard</h2>
          <p className="text-muted-foreground mt-2">Manage customer loyalty points and view transaction history.</p>
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
            className="w-full pl-10 pr-4 py-3 bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all shadow-sm"
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
                <CustomerCard
                  key={customer.id}
                  customer={customer}
                  onClick={setSelectedCustomer}
                />
              ))}
            </AnimatePresence>
          </div>

          {hasMore && (
            <div className="flex justify-center mt-8">
              <Button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="bg-yellow-500 hover:bg-yellow-600 text-white min-w-[200px]"
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

      <PointsConsole
        customer={selectedCustomer}
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        onSave={() => loadCustomers(true)}
      />
    </motion.div>
  );
}