"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function SupabaseDiagnostics() {
    const [clientStatus, setClientStatus] = useState({ status: 'idle', message: 'Initializing...' });
    const [serverStatus, setServerStatus] = useState({ status: 'idle', message: 'Waiting to test...' });
    const [envConfig, setEnvConfig] = useState(null);

    useEffect(() => {
        // Check Environment Variables (Client Side)
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        setEnvConfig({
            url: url ? `${url.substring(0, 15)}...` : 'MISSING',
            key: key ? `${key.substring(0, 10)}...` : 'MISSING',
            urlLength: url?.length || 0,
            keyLength: key?.length || 0,
            hasUrl: !!url,
            hasKey: !!key,
            keyName: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ? '...DEFAULT_KEY' : '...ANON_KEY'
        });

        // Test Client Connection
        testClientConnection();
    }, []);

    const testClientConnection = async () => {
        setClientStatus({ status: 'loading', message: 'Testing client connection...' });
        try {
            const supabase = createClient();
            const start = performance.now();
            const { data, error } = await supabase.auth.getSession();
            const end = performance.now();

            if (error) throw error;

            setClientStatus({
                status: 'success',
                message: `Connected in ${Math.round(end - start)}ms`,
                details: data.session ? 'Active Session Found' : 'No Active Session (Public Access OK)'
            });
        } catch (err) {
            console.error(err);
            setClientStatus({
                status: 'error',
                message: err.message || 'Failed to connect',
                details: 'Check console for full error'
            });
        }
    };

    const testServerConnection = async () => {
        setServerStatus({ status: 'loading', message: 'Testing server connection...' });
        try {
            const res = await fetch('/api/test-supabase');
            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.error || 'Server responded with error');
            }

            setServerStatus({
                status: 'success',
                message: 'Server connection verified',
                details: data.message
            });
        } catch (err) {
            setServerStatus({
                status: 'error',
                message: err.message,
                details: 'API Route failed'
            });
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8 font-sans">
            <div className="max-w-4xl mx-auto space-y-8">

                <div className="border-b border-gray-700 pb-4">
                    <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
                        Supabase Diagnostics
                    </h1>
                    <p className="text-gray-400 mt-2">Environment & Connection Health Check</p>
                </div>

                {/* Environment Variables Section */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <span className="mr-2">🔐</span> Environment Configuration
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ConfigCard
                            label="NEXT_PUBLIC_SUPABASE_URL"
                            value={envConfig?.url}
                            isValid={envConfig?.hasUrl}
                            details={`Length: ${envConfig?.urlLength} chars`}
                        />
                        <ConfigCard
                            label={envConfig?.keyName || "SUPABASE_KEY"}
                            value={envConfig?.key}
                            isValid={envConfig?.hasKey}
                            details={`Length: ${envConfig?.keyLength} chars`}
                        />
                    </div>
                </div>

                {/* Connection Tests Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Client Side Test */}
                    <StatusCard
                        title="Client-Side Connection"
                        icon="🌐"
                        status={clientStatus}
                        onRetry={testClientConnection}
                    />

                    {/* Server Side Test */}
                    <StatusCard
                        title="Server-Side Connection"
                        icon="🖥️"
                        status={serverStatus}
                        actionLabel="Test Server Route"
                        onAction={testServerConnection}
                    />
                </div>

                {/* Data Seeding Section */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
                    <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-200">
                        <span className="mr-2">🌱</span> Mock Data Seeding
                    </h2>
                    <p className="text-gray-400 mb-6 text-sm">
                        Click to insert a random record into the respective table.
                        <br />
                        <span className="text-yellow-500 text-xs">Note: Tables with foreign keys (like loyalty_points) require a Customer to exist first.</span>
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        <SeedButton table="customers" label="Customers" />
                        <SeedButton table="loyalty_points" label="Loyalty Points" />
                        <SeedButton table="vouchers" label="Vouchers" />
                        <SeedButton table="offers" label="Offers" />
                        <SeedButton table="reviews" label="Reviews" />
                        <SeedButton table="admin_users" label="Admin Users" />
                        <SeedButton table="whatsapp_messages" label="WhatsApp Msgs" />
                        <SeedButton table="settings" label="Settings" />
                        <SeedButton table="gdpr_logs" label="GDPR Logs" />
                    </div>
                </div>

                <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4 text-sm text-blue-200">
                    <p><strong>Note:</strong> If Client-Side works but Server-Side fails, check your <code>lib/supabase/server.ts</code> configuration and ensure <code>cookies()</code> are being handled correctly.</p>
                </div>

            </div>
        </div>
    );
}

function SeedButton({ table, label }) {
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [message, setMessage] = useState('');

    const handleSeed = async () => {
        setStatus('loading');
        setMessage('');
        try {
            const res = await fetch('/api/test-supabase/seed', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ table })
            });
            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.error || 'Failed');
            }

            setStatus('success');
            setMessage('Inserted!');
            setTimeout(() => setStatus('idle'), 3000);
        } catch (err) {
            setStatus('error');
            setMessage(err.message);
        }
    };

    return (
        <button
            onClick={handleSeed}
            disabled={status === 'loading'}
            className={`
        relative p-4 rounded-lg border text-left transition-all
        ${status === 'idle' ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : ''}
        ${status === 'loading' ? 'bg-gray-700 border-gray-600 opacity-75 cursor-wait' : ''}
        ${status === 'success' ? 'bg-green-900/30 border-green-600 hover:bg-green-900/40' : ''}
        ${status === 'error' ? 'bg-red-900/30 border-red-600 hover:bg-red-900/40' : ''}
      `}
        >
            <div className="font-medium text-gray-200">{label}</div>
            <div className="text-xs mt-1 h-4 truncate">
                {status === 'idle' && <span className="text-gray-500">Click to seed</span>}
                {status === 'loading' && <span className="text-blue-400">Inserting...</span>}
                {status === 'success' && <span className="text-green-400">✓ {message}</span>}
                {status === 'error' && <span className="text-red-400" title={message}>✗ {message}</span>}
            </div>
        </button>
    );
}

function ConfigCard({ label, value, isValid, details }) {
    return (
        <div className={`p-4 rounded-lg border ${isValid ? 'bg-green-900/10 border-green-800' : 'bg-red-900/10 border-red-800'}`}>
            <div className="text-xs text-gray-400 font-mono mb-1">{label}</div>
            <div className={`font-mono text-sm truncate ${isValid ? 'text-green-400' : 'text-red-400'}`}>
                {value || 'Checking...'}
            </div>
            <div className="text-xs text-gray-500 mt-2">{details}</div>
        </div>
    );
}

function StatusCard({ title, icon, status, onRetry, actionLabel, onAction }) {
    const isSuccess = status.status === 'success';
    const isError = status.status === 'error';
    const isLoading = status.status === 'loading';

    return (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg flex flex-col h-full">
            <h3 className="text-lg font-medium mb-4 flex items-center text-gray-200">
                <span className="mr-2">{icon}</span> {title}
            </h3>

            <div className="flex-grow">
                <div className={`flex items-center mb-2 ${isSuccess ? 'text-green-400' : isError ? 'text-red-400' : 'text-yellow-400'
                    }`}>
                    <div className={`w-3 h-3 rounded-full mr-2 ${isSuccess ? 'bg-green-500' : isError ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'
                        }`}></div>
                    <span className="font-semibold capitalize">{status.status}</span>
                </div>

                <p className="text-gray-300 font-medium">{status.message}</p>
                {status.details && (
                    <p className="text-gray-500 text-sm mt-1 font-mono bg-gray-900/50 p-2 rounded">
                        {status.details}
                    </p>
                )}
            </div>

            <div className="mt-6">
                {onAction ? (
                    <button
                        onClick={onAction}
                        disabled={isLoading}
                        className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors text-sm font-medium"
                    >
                        {isLoading ? 'Testing...' : actionLabel}
                    </button>
                ) : (
                    <button
                        onClick={onRetry}
                        disabled={isLoading}
                        className="w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors text-sm font-medium"
                    >
                        {isLoading ? 'Testing...' : 'Retry Connection'}
                    </button>
                )}
            </div>
        </div>
    );
}
