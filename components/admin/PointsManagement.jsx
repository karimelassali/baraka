// components/admin/PointsManagement.jsx
"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  TrendingUp,
  History,
  X,
  User,
  Plus,
  Minus,
  Save,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Globe,
  ChevronDown
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import GlassCard from '../../components/ui/GlassCard';
import { Input } from '../../components/ui/input';
import { countries } from '../../lib/constants/countries';
import { useTranslations } from 'next-intl';
import { getAvatarUrl } from '@/lib/avatar';
import { formatDistanceToNow } from 'date-fns';
import ActiveFilterSummary from './ActiveFilterSummary';

// --- Sub-components ---

function PointsConsole({ customer, isOpen, onClose, onSave }) {
  const t = useTranslations('Admin.Points');
  const [pointsChange, setPointsChange] = useState('');
  const [reason, setReason] = useState('');
  const [action, setAction] = useState('add'); // 'add' or 'deduct'
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (isOpen && customer) {
      loadHistory();
      setPointsChange('');
      setReason('');
      setStatus({ type: '', message: '' });
    }
  }, [isOpen, customer]);

  const loadHistory = async () => {
    if (!customer?.id) return;
    setLoadingHistory(true);
    try {
      const response = await fetch(`/api/admin/customers/${customer.id}/points`);
      const data = await response.json();
      if (response.ok) {
        setHistory(data.history || []);
      }
    } catch (error) {
      console.error('Failed to load history', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customer?.id) {
      setStatus({ type: 'error', message: t('toast.error_missing_id') });
      return;
    }

    setStatus({ type: '', message: '' });
    setLoading(true);

    try {
      const points = parseInt(pointsChange);
      const finalPoints = action === 'add' ? points : -points;

      const response = await fetch(`/api/admin/customers/${customer.id}/points`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          points: finalPoints,
          description: reason || (action === 'add' ? t('console.manual_add') : t('console.manual_deduct'))
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', message: t('toast.success') });
        setPointsChange('');
        setReason('');
        loadHistory();
        onSave && onSave();
        setTimeout(() => setStatus({ type: '', message: '' }), 2000);
      } else {
        setStatus({ type: 'error', message: result.error || t('toast.error_update') });
      }
    } catch (error) {
      setStatus({ type: 'error', message: t('toast.error_generic') });
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
        <div className="p-4 md:p-6 border-b border-border/50 flex justify-between items-center bg-muted/20">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="p-2 md:p-3 bg-yellow-500/10 rounded-xl">
              <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold">{t('console.title')}</h2>
              <p className="text-xs md:text-sm text-muted-foreground">{t('console.manage_for', { name: customer.first_name })}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Left Panel: Action */}
          <div className="w-full md:w-1/3 p-4 md:p-6 border-b md:border-b-0 md:border-r border-border/50 bg-muted/10 overflow-y-auto">

            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-yellow-500/20 shrink-0">
                <img
                  src={getAvatarUrl(customer.email || customer.first_name)}
                  alt={customer.first_name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-bold text-base md:text-lg leading-tight">{customer.first_name} {customer.last_name}</h3>
                <p className="text-xs text-muted-foreground truncate max-w-[150px]">{customer.email}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <span>{countries.find(c => c.name === customer.country_of_origin)?.flag}</span>
                  <span>{customer.country_of_origin || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-xl p-4 md:p-6 mb-6">
              <p className="text-sm font-medium text-yellow-600 mb-1">{t('console.current_balance')}</p>
              <p className="text-2xl md:text-3xl font-black">{customer.total_points || 0}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex bg-muted rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setAction('add')}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${action === 'add' ? 'bg-background shadow-sm text-green-600' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <Plus className="w-4 h-4" /> {t('console.add')}
                </button>
                <button
                  type="button"
                  onClick={() => setAction('deduct')}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${action === 'deduct' ? 'bg-background shadow-sm text-red-600' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <Minus className="w-4 h-4" /> {t('console.deduct')}
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium uppercase text-muted-foreground">{t('console.amount_label')}</label>
                <Input
                  type="number"
                  value={pointsChange}
                  onChange={(e) => setPointsChange(e.target.value)}
                  placeholder="0"
                  className="bg-background text-lg font-bold"
                  min="1"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium uppercase text-muted-foreground">{t('console.reason_label')}</label>
                <Input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={t('console.reason_placeholder')}
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
                disabled={loading || !pointsChange}
                className={`w-full ${action === 'add' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white`}
              >
                {loading ? t('console.updating') : (action === 'add' ? t('console.add_btn') : t('console.deduct_btn'))}
              </Button>
            </form>
          </div>

          {/* Right Panel: History */}
          <div className="w-full md:w-2/3 p-4 md:p-6 bg-background overflow-y-auto custom-scrollbar h-[300px] md:h-auto">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <History className="w-4 h-4 text-muted-foreground" /> {t('console.history')}
            </h3>

            {loadingHistory ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : history.length > 0 ? (
              <div className="space-y-3">
                {history.map((transaction) => (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-3 md:p-4 rounded-xl border border-border/40 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className={`p-2 rounded-full ${transaction.points > 0 ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                        {transaction.points > 0 ? <Plus className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{transaction.description || 'Manual Adjustment'}</p>
                        <p className="text-xs text-muted-foreground">{new Date(transaction.created_at).toLocaleDateString()} at {new Date(transaction.created_at).toLocaleTimeString()}</p>
                      </div>
                    </div>
                    <span className={`font-mono font-bold ${transaction.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.points > 0 ? '+' : ''}{transaction.points}
                    </span>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 md:h-64 text-muted-foreground opacity-50">
                <History className="w-12 h-12 md:w-16 md:h-16 mb-4 stroke-1" />
                <p>{t('console.no_history')}</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

const CustomerCard = ({ customer, onClick, t }) => {
  const hasIssues = !customer.first_name || !customer.last_name || !customer.email || customer.email.includes('noemail') || !customer.country_of_origin;

  return (
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
        {hasIssues && (
          <div className="absolute top-4 left-4 z-10" title="Missing Information">
            <div className="p-2 bg-red-500/10 rounded-full text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/30">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
        )}
        <div className="absolute top-0 right-0 p-2 opacity-50 group-hover:opacity-100 transition-opacity">
          <div className="bg-yellow-500/10 p-2 rounded-full">
            <TrendingUp className="w-4 h-4 text-yellow-600" />
          </div>
        </div>

        <CardContent className="p-6 flex flex-col items-center text-center pt-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-50 dark:from-yellow-900/40 dark:to-yellow-900/10 flex items-center justify-center mb-4 shadow-inner overflow-visible border-2 border-yellow-500/20 relative">
            <img
              src={getAvatarUrl(customer.first_name)}
              alt={customer.first_name}
              className="w-full h-full object-cover rounded-full overflow-hidden"
            />
            {(() => {
              const countryCode = countries.find(c => c.name === customer.country_of_origin)?.code?.toLowerCase();
              return countryCode ? (
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full border-2 border-background overflow-hidden z-20 shadow-md bg-white">
                  <img
                    src={`https://flagcdn.com/w80/${countryCode}.png`}
                    alt={customer.country_of_origin}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : null;
            })()}
          </div>

          <h3 className="font-bold text-lg truncate w-full px-2">{customer.first_name} {customer.last_name}</h3>
          <p className="text-sm text-muted-foreground truncate w-full px-2 mb-1">{customer.email}</p>
          <p className="text-xs text-muted-foreground/70 mb-4">
            Since {customer.created_at ? formatDistanceToNow(new Date(customer.created_at)) : 'N/A'}
          </p>

          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-4">
            <span>{countries.find(c => c.name === customer.country_of_origin)?.flag}</span>
            <span className="truncate max-w-[100px]">{customer.country_of_origin || 'N/A'}</span>
          </div>

          <div className="mt-auto w-full pt-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{t('total_points')}</p>
            <p className="text-3xl font-black text-foreground group-hover:text-yellow-500 transition-colors">
              {customer.total_points || 0}
            </p>
          </div>
        </CardContent>
      </GlassCard>
    </motion.div>
  );
};

export default function PointsManagement() {
  const t = useTranslations('Admin.Points');
  const [customers, setCustomers] = useState([]);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);

  // Filter states
  const [locationFilter, setLocationFilter] = useState('');
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [minPoints, setMinPoints] = useState('');
  const [maxPoints, setMaxPoints] = useState('');

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

      // Add sorting
      url += `&sort_by=${sortField}&sort_order=${sortDirection}`;

      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }

      if (locationFilter) {
        url += `&country=${encodeURIComponent(locationFilter)}`;
      }

      if (minPoints) url += `&min_points=${minPoints}`;
      if (maxPoints) url += `&max_points=${maxPoints}`;

      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        const newCustomers = data.customers || data;
        setTotalCustomers(data.total || 0);
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
  }, [searchTerm, sortField, sortDirection, locationFilter, minPoints, maxPoints]);

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
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{t('title')}</h2>
            <p className="text-muted-foreground mt-2">{t('subtitle')}</p>
          </div>

          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <input
              type="text"
              placeholder={t('search_placeholder')}
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-3 bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-muted/20 rounded-xl border border-border/50">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">{t('nationality')}</label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 appearance-none transition-all"
              >
                <option value="">{t('all_countries')}</option>
                {countries.map((c) => (
                  <option key={c.code} value={c.name}>
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Points Range</label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPoints}
                onChange={(e) => setMinPoints(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all text-sm"
              />
              <input
                type="number"
                placeholder="Max"
                value={maxPoints}
                onChange={(e) => setMaxPoints(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">{t('sort_by')}</label>
            <div className="relative">
              <select
                value={`${sortField}-${sortDirection}`}
                onChange={(e) => {
                  const [field, direction] = e.target.value.split('-');
                  setSortField(field);
                  setSortDirection(direction);
                }}
                className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 appearance-none transition-all"
              >
                <option value="created_at-desc">{t('sort.newest')}</option>
                <option value="created_at-asc">{t('sort.oldest')}</option>
                <option value="first_name-asc">{t('sort.name_asc')}</option>
                <option value="first_name-desc">{t('sort.name_desc')}</option>
                <option value="country_of_origin-asc">{t('sort.nat_asc')}</option>
                <option value="country_of_origin-desc">{t('sort.nat_desc')}</option>
                <option value="total_points-desc">Points (High to Low)</option>
                <option value="total_points-asc">Points (Low to High)</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>


      {/* Active Filter Summary */}
      <ActiveFilterSummary
        total={totalCustomers}
        customers={customers}
        isLoading={loading && customers.length === 0}
      />

      {/* Content Grid */}
      {
        loading && customers.length === 0 ? (
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
                    t={t}
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
                      {t('loading')}
                    </>
                  ) : (
                    t('load_more')
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
            <p className="text-lg font-medium">{t('no_customers')}</p>
            <p className="text-sm">{t('try_adjusting')}</p>
          </div>
        )
      }

      <PointsConsole
        customer={selectedCustomer}
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        onSave={() => loadCustomers(true)}
      />
    </motion.div >
  );
}