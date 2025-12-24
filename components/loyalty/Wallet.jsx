// components/loyalty/Wallet.jsx
"use client";

import { useEffect, useState } from 'react';
import { CreditCard, History, ArrowUpRight, ArrowDownLeft, Wallet, Download, Filter, Loader2, HelpCircle, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AddToGoogleWallet } from '@/components/wallet/AddToGoogleWallet';

function Skeleton({ compact }) {
  if (compact) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-24 bg-gray-100 rounded-xl"></div>
        <div className="space-y-2">
          <div className="h-10 bg-gray-100 rounded-lg"></div>
          <div className="h-10 bg-gray-100 rounded-lg"></div>
        </div>
      </div>
    );
  }
  return (
    <div className="p-8 rounded-xl bg-white border border-gray-200 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
      <div className="h-48 bg-gray-100 rounded-xl mb-8"></div>
      <div className="space-y-4">
        <div className="h-16 bg-gray-100 rounded-lg"></div>
        <div className="h-16 bg-gray-100 rounded-lg"></div>
        <div className="h-16 bg-gray-100 rounded-lg"></div>
      </div>
    </div>
  );
}

export default function LoyaltyWallet({ compact = false, user }) {
  const t = useTranslations('Dashboard.Wallet');
  const [points, setPoints] = useState(0);
  const [availablePoints, setAvailablePoints] = useState(0);
  const [pendingPoints, setPendingPoints] = useState(0);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all'); // all, earned, redeemed
  const [visibleCount, setVisibleCount] = useState(10);
  const [showTierModal, setShowTierModal] = useState(false);
  const [debugPoints, setDebugPoints] = useState('');

  const handleDownloadStatement = () => {
    const doc = new jsPDF();

    // Add Title
    doc.setFontSize(20);
    doc.text('Estratto Conto Fedeltà', 14, 22);

    doc.setFontSize(11);
    doc.text(`Generato il: ${new Date().toLocaleDateString('it-IT')}`, 14, 30);
    doc.text(`Saldo Punti Totale: ${points}`, 14, 36);

    // Define columns and rows
    const tableColumn = ["Data", "Descrizione", "Tipo", "Punti"];
    const tableRows = [];

    history.forEach(item => {
      const transactionData = [
        new Date(item.created_at).toLocaleDateString('it-IT'),
        item.description || item.transaction_type,
        item.points > 0 ? 'Guadagnati' : 'Riscattati',
        item.points
      ];
      tableRows.push(transactionData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 45,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [220, 38, 38] }, // Red header to match brand
    });

    doc.save(`estratto_conto_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  useEffect(() => {
    const fetchLoyaltyData = async () => {
      try {
        const response = await fetch('/api/customer/points');
        const data = await response.json();

        if (response.ok) {
          setPoints(Number(data.total_points) || 0);
          setAvailablePoints(Number(data.available_points) || 0);
          setPendingPoints(Number(data.pending_points) || 0);
          setHistory(data.points_history || []);
        } else {
          console.error('Failed to fetch loyalty data:', data.error);
        }
      } catch (error) {
        console.error('An error occurred while fetching loyalty data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLoyaltyData();
  }, []);

  const getCardStyle = (currentPoints) => {
    const numPoints = Number(currentPoints);
    if (numPoints >= 750) {
      return {
        gradient: "from-rose-600 via-red-600 to-red-900",
        shadow: "shadow-red-900/50",
        tier: t('legend_member'),
        iconColor: "text-rose-100",
        textColor: "text-white"
      };
    } else if (numPoints >= 500) {
      return {
        gradient: "from-yellow-300 via-yellow-500 to-yellow-600",
        shadow: "shadow-yellow-500/50",
        tier: t('gold_member'),
        iconColor: "text-yellow-50",
        textColor: "text-white"
      };
    } else if (numPoints >= 100) {
      return {
        gradient: "from-slate-300 via-slate-400 to-slate-500",
        shadow: "shadow-slate-400/50",
        tier: t('silver_member'),
        iconColor: "text-slate-50",
        textColor: "text-white"
      };
    } else {
      return {
        gradient: "from-stone-500 to-stone-700",
        shadow: "shadow-stone-900/50",
        tier: t('bronze_member'),
        iconColor: "text-stone-200",
        textColor: "text-stone-100"
      };
    }
  };

  const cardStyle = getCardStyle(points);

  const filteredTransactions = history.filter(item => {
    if (filterType === 'earned') return item.points > 0;
    if (filterType === 'redeemed') return item.points < 0;
    return true;
  });

  const displayTransactions = compact
    ? history.slice(0, 3)
    : filteredTransactions.slice(0, visibleCount);

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 10);
  };

  if (loading) {
    return <Skeleton compact={compact} />;
  }

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        <div className={`bg-gradient-to-br ${cardStyle.gradient} rounded-xl p-5 text-white shadow-lg relative overflow-hidden group transition-all duration-300 hover:scale-[1.02]`}>
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Wallet className="w-24 h-24" />
          </div>
          <div className="relative z-10">
            <p className="text-white/80 text-sm font-medium">{t('available_balance')}</p>
            <h3 className="text-3xl font-bold mt-1 tracking-tight">{availablePoints.toLocaleString()} <span className="text-lg font-normal opacity-80">{t('pts')}</span></h3>
            <div className="mt-4 flex items-center justify-between">
              <span className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-medium border border-white/10">
                {cardStyle.tier}
              </span>
              {pendingPoints > 0 && (
                <span className="text-xs text-white/90 font-medium">
                  {pendingPoints} {t('pending')}
                </span>
              )}
            </div>
          </div>
        </div>

        {user?.id && (
          <div className="flex justify-center">
            <AddToGoogleWallet userId={user.id} />
          </div>
        )}

        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center justify-between">
            {t('recent_activity')}
          </h4>
          <div className="space-y-3">
            {displayTransactions.length > 0 ? (
              displayTransactions.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-1">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${item.points > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                      {item.points > 0 ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                        {item.description || item.transaction_type}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm font-semibold ${item.points > 0 ? 'text-green-600' : 'text-gray-900'}`}>
                    {item.points > 0 ? '+' : ''}{item.points}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-2">{t('no_activity')}</p>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      id="dashboard-wallet"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full space-y-8"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">{t('title')}</h2>
        <div className="flex items-center gap-4">
          {process.env.NODE_ENV === 'development' && (
            <input
              type="number"
              placeholder="Debug Points"
              value={debugPoints}
              onChange={(e) => {
                setDebugPoints(e.target.value);
                if (e.target.value) setPoints(Number(e.target.value));
              }}
              className="w-32 px-2 py-1 text-sm border border-gray-300 rounded-md"
            />
          )}
          {user?.id && (
            <div className="h-[40px] flex items-center">
              <AddToGoogleWallet userId={user.id} />
            </div>
          )}
          <button
            onClick={handleDownloadStatement}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center transition-colors"
          >
            <Download className="w-4 h-4 mr-1.5" />
            {t('download_statement')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Card */}
        <div className={`md:col-span-2 bg-gradient-to-br ${cardStyle.gradient} rounded-2xl p-8 text-white shadow-xl relative overflow-hidden transition-all duration-500`}>
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <CreditCard className="w-64 h-64" />
          </div>

          <div className="relative z-10 flex flex-col justify-between h-full min-h-[200px]">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-white/80 font-medium text-lg">{t('total_balance')}</p>
                <h3 className="text-5xl font-bold mt-2 tracking-tight">{points.toLocaleString()}</h3>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 shadow-lg">
                  <span className="text-sm font-bold text-white tracking-wide uppercase">{cardStyle.tier}</span>
                </div>
                <button
                  onClick={() => setShowTierModal(true)}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm"
                >
                  <HelpCircle className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mt-8">
              <div>
                <p className="text-white/70 text-sm mb-1">{t('available_to_redeem')}</p>
                <p className="text-2xl font-semibold">{availablePoints.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-white/70 text-sm mb-1">{t('pending_points')}</p>
                <p className="text-2xl font-semibold">{pendingPoints.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-6">
          <motion.div
            whileHover={{ y: -2 }}
            className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                <ArrowDownLeft className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('earned_this_month')}</p>
                <p className="text-xl font-bold text-gray-900">
                  +{history.filter(h => h.points > 0 && new Date(h.created_at).getMonth() === new Date().getMonth()).reduce((acc, curr) => acc + curr.points, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </motion.div>
          <motion.div
            whileHover={{ y: -2 }}
            className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                <ArrowUpRight className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('spent_this_month')}</p>
                <p className="text-xl font-bold text-gray-900">
                  {history.filter(h => h.points < 0 && new Date(h.created_at).getMonth() === new Date().getMonth()).reduce((acc, curr) => acc + curr.points, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center">
            <History className="w-5 h-5 mr-2 text-gray-400" />
            {t('transaction_history')}
          </h3>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="text-sm border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 pl-3 pr-8"
            >
              <option value="all">{t('all_transactions')}</option>
              <option value="earned">{t('earned')}</option>
              <option value="redeemed">{t('redeemed')}</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('description')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('date')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('type')}</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('points')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayTransactions.length > 0 ? (
                displayTransactions.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-full mr-3 ${item.points > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                          {item.points > 0 ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{item.description || item.transaction_type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${item.points > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                        {item.points > 0 ? t('earned') : t('redeemed')}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold text-right ${item.points > 0 ? 'text-green-600' : 'text-gray-900'
                      }`}>
                      {item.points > 0 ? '+' : ''}{item.points}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                    {t('no_transactions')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {!compact && filteredTransactions.length > visibleCount && (
          <div className="p-4 border-t border-gray-200 flex justify-center">
            <button
              onClick={handleLoadMore}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              {t('load_more') || 'Load More'}
            </button>
          </div>
        )}
      </div>

      {/* Tier Info Modal */}
      <AnimatePresence>
        {showTierModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">{t('tier_info_title')}</h3>
                <button
                  onClick={() => setShowTierModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-center mb-4">
                  <img
                    src="/illus/undraw_wallet_diag.svg"
                    alt="Tiers"
                    className="h-32 w-auto object-contain"
                  />
                </div>
                <p className="text-gray-600 mb-4 text-center">{t('tier_info_desc')}</p>

                <div className="space-y-3">
                  {/* Legend */}
                  <div className="flex items-center p-3 rounded-xl bg-gradient-to-r from-red-50 to-white border border-red-100">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-rose-600 to-red-900 shadow-sm flex items-center justify-center text-white font-bold text-xs">
                      750+
                    </div>
                    <div className="ml-4">
                      <h4 className="font-bold text-gray-900">{t('legend_member')}</h4>
                      <p className="text-sm text-gray-500">{t('tiers.legend_desc')}</p>
                    </div>
                  </div>

                  {/* Gold */}
                  <div className="flex items-center p-3 rounded-xl bg-gradient-to-r from-yellow-50 to-white border border-yellow-100">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-300 to-yellow-600 shadow-sm flex items-center justify-center text-white font-bold text-xs">
                      500+
                    </div>
                    <div className="ml-4">
                      <h4 className="font-bold text-gray-900">{t('gold_member')}</h4>
                      <p className="text-sm text-gray-500">{t('tiers.gold_desc')}</p>
                    </div>
                  </div>

                  {/* Silver */}
                  <div className="flex items-center p-3 rounded-xl bg-gradient-to-r from-slate-50 to-white border border-slate-100">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-slate-300 to-slate-500 shadow-sm flex items-center justify-center text-white font-bold text-xs">
                      100+
                    </div>
                    <div className="ml-4">
                      <h4 className="font-bold text-gray-900">{t('silver_member')}</h4>
                      <p className="text-sm text-gray-500">{t('tiers.silver_desc')}</p>
                    </div>
                  </div>

                  {/* Bronze */}
                  <div className="flex items-center p-3 rounded-xl bg-gradient-to-r from-stone-50 to-white border border-stone-100">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-stone-500 to-stone-700 shadow-sm flex items-center justify-center text-white font-bold text-xs">
                      0+
                    </div>
                    <div className="ml-4">
                      <h4 className="font-bold text-gray-900">{t('bronze_member')}</h4>
                      <p className="text-sm text-gray-500">{t('tiers.bronze_desc')}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-gray-50 border-t border-gray-100">
                <button
                  onClick={() => setShowTierModal(false)}
                  className="w-full py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
                >
                  {t('close')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div >
  );
}
