"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export default function DBPerformanceTest() {
    const t = useTranslations('Admin.Performance');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState([]);

    const runTest = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/test-db-performance');
            const data = await res.json();

            setResults(data);

            // Save to local storage history
            const newHistory = [data, ...history].slice(0, 5);
            setHistory(newHistory);
            localStorage.setItem('db_perf_history', JSON.stringify(newHistory));

        } catch (err) {
            console.error(err);
            alert(t('test_failed'));
        } finally {
            setLoading(false);
        }
    };

    // Load history on mount
    useState(() => {
        const saved = localStorage.getItem('db_perf_history');
        if (saved) setHistory(JSON.parse(saved));
    }, []);

    return (
        <div className="p-6 max-w-2xl mx-auto bg-white rounded-xl shadow-lg border border-gray-100 my-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                🚀 {t('title')}
            </h2>

            <button
                onClick={runTest}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors mb-6 disabled:opacity-50"
            >
                {loading ? t('running') : t('run_test')}
            </button>

            {results && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-6">
                    <h3 className="font-bold text-green-800 mb-2">{t('current_result')}</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="p-3 bg-white rounded shadow-sm">
                            <span className="text-gray-500 block">{t('total_time')}</span>
                            <span className="font-mono font-bold text-lg">{results.totalTime}</span>
                        </div>
                        <div className="p-3 bg-white rounded shadow-sm">
                            <span className="text-gray-500 block">{t('analytics')}</span>
                            <span className="font-mono font-bold">{results.metrics?.analytics?.time}</span>
                            <span className="text-xs text-green-600 font-medium block">{results.metrics?.analytics?.method}</span>
                        </div>
                        <div className="p-3 bg-white rounded shadow-sm">
                            <span className="text-gray-500 block">{t('customers_list')}</span>
                            <span className="font-mono font-bold">{results.metrics?.customers?.time}</span>
                            <span className="text-xs text-green-600 font-medium block">{results.metrics?.customers?.method}</span>
                        </div>
                        <div className="p-3 bg-white rounded shadow-sm">
                            <span className="text-gray-500 block">{t('inventory')}</span>
                            <span className="font-mono font-bold">{results.metrics?.inventory?.time}</span>
                            <span className="text-xs text-green-600 font-medium block">{results.metrics?.inventory?.method}</span>
                        </div>
                    </div>
                </div>
            )}

            {history.length > 0 && (
                <div>
                    <h3 className="font-bold text-gray-700 mb-3">{t('history')}</h3>
                    <div className="space-y-2">
                        {history.map((run, i) => (
                            <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded text-sm">
                                <span className="text-gray-500">{new Date(run.timestamp).toLocaleTimeString()}</span>
                                <span className="font-mono font-bold">{run.totalTime}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
