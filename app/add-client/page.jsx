"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ChevronDown, ChevronUp, CheckCircle, XCircle, User, Phone, Mail, Trash2, AlertTriangle, Send, Users, MapPin, Globe, Search, Info } from 'lucide-react';
import { countries } from '@/lib/constants/countries';

export default function AddClientPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Client List State
    const [showClients, setShowClients] = useState(false);
    const [clients, setClients] = useState([]);
    const [loadingClients, setLoadingClients] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [totalClients, setTotalClients] = useState(0);
    const [loadingMore, setLoadingMore] = useState(false);

    // Unverified Users Modal State
    const [showUnverifiedModal, setShowUnverifiedModal] = useState(false);
    const [sendingBulk, setSendingBulk] = useState(false);
    const [bulkSuccess, setBulkSuccess] = useState(false);

    // Delete State
    const [clientToDelete, setClientToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Country Selector State
    const [isCountryOpen, setIsCountryOpen] = useState(false);
    const [countrySearch, setCountrySearch] = useState('');
    const countryDropdownRef = useRef(null);

    // Form State
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        countryOfOrigin: '',
        residence: ''
    });

    // New Modals State
    const [showExistingModal, setShowExistingModal] = useState(false);
    const [showWhatsNewModal, setShowWhatsNewModal] = useState(false);

    useEffect(() => {
        const session = localStorage.getItem('add_client_session');
        if (session) {
            const { timestamp } = JSON.parse(session);
            const now = new Date().getTime();
            // 5 hours in milliseconds
            if (now - timestamp < 5 * 60 * 60 * 1000) {
                setIsAuthenticated(true);
            } else {
                localStorage.removeItem('add_client_session');
            }
        }

        // Check for What's New Modal
        const hasSeenWhatsNew = localStorage.getItem('whats_new_modal_seen_v1');
        if (!hasSeenWhatsNew) {
            setShowWhatsNewModal(true);
        }

        // Close country dropdown when clicking outside
        const handleClickOutside = (event) => {
            if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target)) {
                setIsCountryOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const closeWhatsNew = () => {
        localStorage.setItem('whats_new_modal_seen_v1', 'true');
        setShowWhatsNewModal(false);
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        const envPassword = process.env.NEXT_PUBLIC_ADD_CLIENT_PASSWORD;

        if (password === envPassword) {
            setIsAuthenticated(true);
            localStorage.setItem('add_client_session', JSON.stringify({
                timestamp: new Date().getTime()
            }));
            setError('');
        } else {
            setError('Password non corretta');
        }
    };

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCountrySelect = (country) => {
        setFormData({ ...formData, countryOfOrigin: country.name });
        setIsCountryOpen(false);
        setCountrySearch('');
    };

    const filteredCountries = countries.filter(country =>
        country.name.toLowerCase().includes(countrySearch.toLowerCase())
    );

    const fetchClients = async (pageNum = 1, isLoadMore = false) => {
        if (isLoadMore) {
            setLoadingMore(true);
        } else {
            setLoadingClients(true);
        }

        try {
            const res = await fetch(`/api/admin/clients-status?page=${pageNum}&limit=10`);
            if (!res.ok) throw new Error('Impossibile recuperare i clienti');
            const data = await res.json();
            const newClients = Array.isArray(data.clients) ? data.clients : [];

            if (isLoadMore) {
                setClients(prev => [...(Array.isArray(prev) ? prev : []), ...newClients]);
            } else {
                setClients(newClients);
            }

            setHasMore(data.hasMore);
            setTotalClients(data.total);
            setPage(pageNum);

        } catch (err) {
            console.error('Error fetching clients:', err);
        } finally {
            setLoadingClients(false);
            setLoadingMore(false);
        }
    };

    const toggleClients = () => {
        if (!showClients) {
            setClients([]);
            setPage(1);
            setHasMore(true);
            fetchClients(1, false);
        }
        setShowClients(!showClients);
    };

    const confirmDelete = (client) => {
        setClientToDelete(client);
    };

    const cancelDelete = () => {
        setClientToDelete(null);
    };

    const handleDelete = async () => {
        if (!clientToDelete) return;
        setIsDeleting(true);
        try {
            const res = await fetch('/api/admin/delete-client', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ authId: clientToDelete.auth_id }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Impossibile eliminare il cliente');
            }

            // Remove from local state
            setClients(prev => (Array.isArray(prev) ? prev.filter(c => c.id !== clientToDelete.id) : []));
            setClientToDelete(null);
        } catch (err) {
            console.error('Error deleting client:', err);
            alert('Impossibile eliminare il cliente: ' + err.message);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleClientSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Use the new API route instead of client-side signUp
            const res = await fetch('/api/admin/create-client', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    password: 'TempPassword123!', // Temporary password
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    phoneNumber: formData.phoneNumber,
                    countryOfOrigin: formData.countryOfOrigin,
                    residence: formData.residence
                })
            });

            if (!res.ok) {
                const errorData = await res.json();
                if (res.status === 409) {
                    setShowExistingModal(true);
                    return;
                }
                throw new Error(errorData.error || 'Impossibile creare il cliente');
            }

            setSuccess(true);
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                phoneNumber: '',
                countryOfOrigin: '',
                residence: ''
            });
            // Refresh client list if open
            if (showClients) fetchClients(1, false);
            setTimeout(() => setSuccess(false), 3000);

        } catch (err) {
            setError(err.message || 'Impossibile creare il cliente');
        } finally {
            setLoading(false);
        }
    };

    const getUnverifiedClients = () => {
        return Array.isArray(clients) ? clients.filter(client => !client.is_verified) : [];
    };

    const handleBulkVerification = async () => {
        const unverifiedEmails = getUnverifiedClients().map(c => c.email);
        if (unverifiedEmails.length === 0) return;

        setSendingBulk(true);
        try {
            const res = await fetch('/api/admin/send-bulk-verification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ emails: unverifiedEmails })
            });

            if (!res.ok) throw new Error('Errore invio email');

            setBulkSuccess(true);
            setTimeout(() => {
                setBulkSuccess(false);
                setShowUnverifiedModal(false);
            }, 2000);
        } catch (err) {
            console.error(err);
            alert('Errore durante l\'invio delle email');
        } finally {
            setSendingBulk(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md"
                >
                    <form onSubmit={handlePasswordSubmit} className="bg-white p-8 rounded-2xl shadow-2xl border border-red-100">
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 mx-auto mb-4 relative rounded-full overflow-hidden border-2 border-red-500">
                                <Image src="/logo.jpeg" alt="Logo" fill className="object-cover" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800">Accesso Limitato</h2>
                        </div>

                        <div className="mb-6">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Inserisci Password di Accesso"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                                autoFocus
                            />
                        </div>

                        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

                        <button
                            type="submit"
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors shadow-lg"
                        >
                            Sblocca Accesso
                        </button>
                    </form>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {clientToDelete && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden"
                        >
                            <div className="p-6 text-center">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <AlertTriangle className="w-8 h-8 text-red-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Elimina Cliente?</h3>
                                <p className="text-gray-500 mb-6">
                                    Sei sicuro di voler eliminare <strong>{clientToDelete.first_name} {clientToDelete.last_name}</strong>? Questa azione non può essere annullata.
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={cancelDelete}
                                        disabled={isDeleting}
                                        className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                                    >
                                        Annulla
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        disabled={isDeleting}
                                        className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        {isDeleting ? (
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <Trash2 className="w-4 h-4" /> Elimina
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Existing Client Modal */}
            <AnimatePresence>
                {showExistingModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden"
                        >
                            <div className="p-6 text-center">
                                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <AlertTriangle className="w-8 h-8 text-yellow-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Cliente Esistente</h3>
                                <p className="text-gray-500 mb-6">
                                    Esiste già un cliente con questo numero di telefono o email. Controlla la lista clienti.
                                </p>
                                <button
                                    onClick={() => setShowExistingModal(false)}
                                    className="w-full px-4 py-3 rounded-xl bg-yellow-500 text-white font-medium hover:bg-yellow-600 transition-colors"
                                >
                                    Ho capito
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* What's New Modal */}
            <AnimatePresence>
                {showWhatsNewModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-[80] flex items-center justify-center p-4 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
                        >
                            <div className="bg-gradient-to-r from-red-600 to-red-500 p-6 text-white">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                        <Info className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold">Novità di Oggi!</h3>
                                </div>
                                <p className="text-red-100 opacity-90 text-sm">
                                    Abbiamo aggiornato il sistema per renderlo più veloce e semplice.
                                </p>
                            </div>
                            <div className="p-6">
                                <ul className="space-y-4 mb-8">
                                    <li className="flex items-start gap-3">
                                        <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                            <User className="w-4 h-4 text-purple-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-800">Nuovi Profili DiceBear</h4>
                                            <p className="text-sm text-gray-500">Abbiamo aggiunto i profili DiceBear per rendere più facile ricordare i clienti.</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-800">Email Facoltativa</h4>
                                            <p className="text-sm text-gray-500">Ora puoi aggiungere clienti anche senza indirizzo email.</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                            <Phone className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-800">Verifica Duplicati</h4>
                                            <p className="text-sm text-gray-500">Il sistema ti avviserà se provi ad aggiungere un numero già esistente.</p>
                                        </div>
                                    </li>
                                </ul>
                                <button
                                    onClick={closeWhatsNew}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-colors shadow-lg"
                                >
                                    Fantastico, Iniziamo!
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Unverified Users Modal */}
            <AnimatePresence>
                {showUnverifiedModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[80vh]"
                        >
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <Users className="w-5 h-5 text-red-600" />
                                    Utenti Non Verificati
                                </h3>
                                <button onClick={() => setShowUnverifiedModal(false)} className="text-gray-400 hover:text-gray-600">
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="p-0 overflow-y-auto flex-grow">
                                {getUnverifiedClients().length === 0 ? (
                                    <div className="p-8 text-center text-gray-500">
                                        Tutti gli utenti sono verificati!
                                    </div>
                                ) : (
                                    <ul className="divide-y divide-gray-100">
                                        {getUnverifiedClients().map(client => (
                                            <li key={client.id} className="p-4 hover:bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div className="flex-grow">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="font-medium text-gray-800">{client.first_name} {client.last_name}</p>
                                                            <p className="text-sm text-gray-500">{client.email}</p>
                                                        </div>
                                                        <span className="sm:hidden text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">Non Verificato</span>
                                                    </div>

                                                    {(client.country_of_origin || client.residence) && (
                                                        <div className="flex flex-wrap items-center gap-3 mt-1.5 text-sm text-gray-600">
                                                            {client.country_of_origin && (
                                                                <span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-md">
                                                                    {countries.find(c => c.name === client.country_of_origin)?.flag || '🌍'}
                                                                    {client.country_of_origin}
                                                                </span>
                                                            )}
                                                            {client.residence && (
                                                                <span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-md">
                                                                    <MapPin className="w-3 h-3 text-gray-500" />
                                                                    {client.residence}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="hidden sm:inline-block text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full shrink-0">Non Verificato</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <div className="p-6 border-t border-gray-100 bg-gray-50">
                                {bulkSuccess ? (
                                    <div className="w-full bg-green-100 text-green-700 py-3 rounded-xl text-center font-medium flex items-center justify-center gap-2">
                                        <CheckCircle className="w-5 h-5" /> Email Inviate con Successo!
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleBulkVerification}
                                        disabled={sendingBulk || getUnverifiedClients().length === 0}
                                        className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors shadow-lg flex items-center justify-center gap-2"
                                    >
                                        {sendingBulk ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Invio in corso...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-5 h-5" /> Invia Verifica a Tutti ({getUnverifiedClients().length})
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <header className="p-6 flex justify-between items-center border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-md z-50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 relative rounded-full overflow-hidden border border-red-200">
                        <Image src="/logo.jpeg" alt="Logo" fill className="object-cover" />
                    </div>
                    <span className="font-bold text-xl text-gray-800">Amministratore <span className="text-red-600">Baraka</span></span>
                </div>
                <button
                    onClick={() => {
                        localStorage.removeItem('add_client_session');
                        setIsAuthenticated(false);
                    }}
                    className="text-sm text-gray-500 hover:text-red-600 transition-colors"
                >
                    Esci
                </button>
            </header>

            <main className="flex-grow flex flex-col items-center p-4 md:p-8 gap-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-2xl"
                >
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                        <div className="bg-red-600 p-6 text-white text-center">
                            <h1 className="text-2xl font-bold">Aggiungi Nuovo Cliente</h1>
                            <p className="text-red-100 opacity-90">Inserisci i dettagli del cliente qui sotto</p>
                        </div>

                        <div className="p-8">
                            <AnimatePresence mode="wait">
                                {success ? (
                                    <motion.div
                                        key="success"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className="text-center py-12"
                                    >
                                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <CheckCircle className="w-10 h-10" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Cliente Aggiunto con Successo!</h3>
                                        <p className="text-gray-500">Il modulo è stato resettato per il prossimo inserimento.</p>
                                    </motion.div>
                                ) : (
                                    <motion.form
                                        key="form"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        onSubmit={handleClientSubmit}
                                        className="space-y-6"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                                    <input
                                                        type="text"
                                                        name="firstName"
                                                        value={formData.firstName}
                                                        onChange={handleFormChange}
                                                        required
                                                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all bg-gray-50"
                                                        placeholder="Mario"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Cognome</label>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                                    <input
                                                        type="text"
                                                        name="lastName"
                                                        value={formData.lastName}
                                                        onChange={handleFormChange}
                                                        required
                                                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all bg-gray-50"
                                                        placeholder="Rossi"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Indirizzo Email</label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleFormChange}
                                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all bg-gray-50"
                                                    placeholder="mario@esempio.com (Opzionale)"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Numero di Telefono</label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                                <input
                                                    type="tel"
                                                    name="phoneNumber"
                                                    value={formData.phoneNumber}
                                                    onChange={handleFormChange}
                                                    required
                                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all bg-gray-50"
                                                    placeholder="+1 234 567 890"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="relative" ref={countryDropdownRef}>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Paese di Origine</label>
                                                <div
                                                    className="relative cursor-pointer"
                                                    onClick={() => setIsCountryOpen(!isCountryOpen)}
                                                >
                                                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                                    <div className={`w-full pl-10 pr-10 py-3 rounded-lg border ${isCountryOpen ? 'border-red-500 ring-2 ring-red-500' : 'border-gray-300'} bg-gray-50 flex items-center justify-between transition-all`}>
                                                        <span className={formData.countryOfOrigin ? 'text-gray-900' : 'text-gray-400'}>
                                                            {formData.countryOfOrigin || 'Seleziona Paese'}
                                                        </span>
                                                        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isCountryOpen ? 'rotate-180' : ''}`} />
                                                    </div>
                                                </div>

                                                <AnimatePresence>
                                                    {isCountryOpen && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: 10 }}
                                                            className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 max-h-60 overflow-hidden flex flex-col"
                                                        >
                                                            <div className="p-2 border-b border-gray-100 sticky top-0 bg-white">
                                                                <div className="relative">
                                                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                                                    <input
                                                                        type="text"
                                                                        value={countrySearch}
                                                                        onChange={(e) => setCountrySearch(e.target.value)}
                                                                        placeholder="Cerca paese..."
                                                                        className="w-full pl-9 pr-4 py-2 rounded-lg bg-gray-50 border-none text-sm focus:ring-2 focus:ring-red-500 outline-none"
                                                                        autoFocus
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="overflow-y-auto flex-grow">
                                                                {filteredCountries.length === 0 ? (
                                                                    <div className="p-4 text-center text-gray-500 text-sm">Nessun paese trovato</div>
                                                                ) : (
                                                                    filteredCountries.map((country) => (
                                                                        <button
                                                                            key={country.code}
                                                                            type="button"
                                                                            onClick={() => handleCountrySelect(country)}
                                                                            className="w-full px-4 py-3 text-left hover:bg-red-50 flex items-center gap-3 transition-colors"
                                                                        >
                                                                            <span className="text-xl">{country.flag}</span>
                                                                            <span className="text-gray-700">{country.name}</span>
                                                                        </button>
                                                                    ))
                                                                )}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Residenza</label>
                                                <div className="relative">
                                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                                    <input
                                                        type="text"
                                                        name="residence"
                                                        value={formData.residence}
                                                        onChange={handleFormChange}
                                                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all bg-gray-50"
                                                        placeholder="Città di residenza"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl transition-all transform hover:scale-[1.01] active:scale-[0.99] shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {loading ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    Aggiunta Cliente...
                                                </>
                                            ) : (
                                                'Aggiungi Cliente'
                                            )}
                                        </button>
                                    </motion.form>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </motion.div>

                {/* Show Clients Button */}
                <motion.div
                    className="w-full max-w-2xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="flex gap-3">
                        <button
                            onClick={toggleClients}
                            className="flex-1 bg-white border border-gray-200 text-gray-700 font-medium py-4 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 group"
                        >
                            {showClients ? (
                                <>Nascondi Clienti <ChevronUp className="w-5 h-5 text-red-500" /></>
                            ) : (
                                <>Mostra Tutti i Clienti <ChevronDown className="w-5 h-5 text-red-500 group-hover:translate-y-1 transition-transform" /></>
                            )}
                        </button>

                        {showClients && (
                            <button
                                onClick={() => setShowUnverifiedModal(true)}
                                className="bg-red-50 border border-red-100 text-red-600 font-medium px-6 rounded-xl shadow-sm hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                                title="Gestisci Utenti Non Verificati"
                            >
                                <Users className="w-5 h-5" />
                                <span className="hidden sm:inline">Non Verificati</span>
                            </button>
                        )}
                    </div>

                    <AnimatePresence>
                        {showClients && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden mt-4"
                            >
                                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                                    {loadingClients ? (
                                        <div className="p-8 text-center text-gray-500">
                                            <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                                            Caricamento clienti...
                                        </div>
                                    ) : clients.length === 0 ? (
                                        <div className="p-8 text-center text-gray-500">
                                            Nessun cliente trovato.
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-gray-100">
                                            <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between text-sm text-gray-600">
                                                <span className="font-semibold text-gray-800">Totale Clienti: {totalClients}</span>
                                                <div className="flex gap-4">
                                                    {/* Note: Counts here are only for loaded clients now, or we'd need separate API for totals */}
                                                    <span>Visualizzati: {clients.length}</span>
                                                </div>
                                            </div>
                                            <AnimatePresence>
                                                {clients.map((client) => (
                                                    <motion.div
                                                        key={client.id}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: 20, height: 0, padding: 0 }}
                                                        className="p-4 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                                    >
                                                        <div className="flex items-start gap-4">
                                                            <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center text-red-600 font-bold shrink-0 overflow-hidden border border-red-100">
                                                                <img
                                                                    src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${client.first_name}`}
                                                                    alt={client.first_name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                            <div className="flex-grow">
                                                                <h4 className="font-semibold text-gray-800">{client.first_name} {client.last_name}</h4>
                                                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm text-gray-500">
                                                                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {client.email}</span>
                                                                    <span className="hidden sm:inline text-gray-300">|</span>
                                                                    <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {client.phone_number}</span>
                                                                </div>

                                                                {(client.country_of_origin || client.residence) && (
                                                                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-sm text-gray-600">
                                                                        {client.country_of_origin && (
                                                                            <span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-md">
                                                                                {countries.find(c => c.name === client.country_of_origin)?.flag || '🌍'}
                                                                                {client.country_of_origin}
                                                                            </span>
                                                                        )}
                                                                        {client.residence && (
                                                                            <span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-md">
                                                                                <MapPin className="w-3 h-3 text-gray-500" />
                                                                                {client.residence}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pl-14 sm:pl-0">
                                                            <div className="flex flex-col items-end gap-1">
                                                                {client.is_verified ? (
                                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                        <CheckCircle className="w-3 h-3" /> Verificato
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                                        <XCircle className="w-3 h-3" /> Non Verificato
                                                                    </span>
                                                                )}
                                                                <span className="text-xs text-gray-400">{new Date(client.created_at).toLocaleDateString()}</span>
                                                            </div>
                                                            <button
                                                                onClick={() => confirmDelete(client)}
                                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                                title="Elimina Cliente"
                                                            >
                                                                <Trash2 className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>

                                            {hasMore && (
                                                <div className="p-4 text-center border-t border-gray-100 bg-gray-50">
                                                    <button
                                                        onClick={() => fetchClients(page + 1, true)}
                                                        disabled={loadingMore}
                                                        className="px-6 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg shadow-sm hover:bg-gray-50 hover:text-red-600 transition-colors flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
                                                    >
                                                        {loadingMore ? (
                                                            <>
                                                                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                                                                Caricamento...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <ChevronDown className="w-4 h-4" />
                                                                Carica Altri
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </main>

            <footer className="p-6 text-center text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} Sistemi di Fedeltà Baraka
            </footer>
        </div>
    );
}
