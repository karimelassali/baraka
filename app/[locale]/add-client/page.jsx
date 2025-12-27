"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ChevronDown, ChevronUp, CheckCircle, XCircle, User, Phone, Mail, Trash2, AlertTriangle, Send, Users, MapPin, Globe, Search, Info, Edit, Hammer, Key, Lock, ShieldCheck, ShieldAlert, Loader2, CheckCircle2 } from 'lucide-react';
import { countries } from '@/lib/constants/countries';
import { getAvatarUrl } from '@/lib/avatar';
import CountdownTimer from '@/components/CountdownTimer';

// Bulk Reset Animation Component
function BulkResetAnimation({ newPassword, accessPassword, onComplete, onCancel }) {
    const [users, setUsers] = useState([]);
    const [currentIdx, setCurrentIdx] = useState(-1);
    const [completed, setCompleted] = useState(false);
    const [error, setError] = useState(null);
    const scrollRef = useRef(null);
    const [isResetting, setIsResetting] = useState(false);
    const [resetStats, setResetStats] = useState(null);

    useEffect(() => {
        if (isResetting) return;

        const startReset = async () => {
            const passwordToUse = accessPassword || process.env.NEXT_PUBLIC_ADD_CLIENT_PASSWORD;
            console.log("Starting reset with accessPassword:", passwordToUse ? "***" : "MISSING");

            setIsResetting(true);
            try {
                // 1. Fetch all users first to populate the list
                // Restore limit to 1000 and skip_auth for performance
                // Pass accessPassword via Header for better security/reliability
                const res = await fetch(`/api/admin/customers?limit=1000&skip_auth=true`, {
                    headers: {
                        'x-access-password': passwordToUse
                    }
                });
                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || "Errore nel recupero dei clienti.");
                }

                if (!data.customers || data.customers.length === 0) {
                    console.error("No customers found:", data);
                    throw new Error("Nessun cliente trovato.");
                }

                setUsers(data.customers);

                // 2. Start the actual reset process in background
                const resetRes = await fetch('/api/admin/bulk-reset-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-access-password': passwordToUse
                    },
                    body: JSON.stringify({
                        newPassword: newPassword, // Ensure key matches API expectation (newPassword vs password)
                        accessPassword: passwordToUse
                    })
                });

                if (!resetRes.ok) {
                    const errorData = await resetRes.json();
                    throw new Error(errorData.error || "Errore durante il reset.");
                }

                const resultData = await resetRes.json();
                setResetStats(resultData);

            } catch (err) {
                console.error("Reset failed:", err);
                setError(err.message);
            }
        };

        startReset();
    }, [newPassword, accessPassword]);

    // Animation Loop
    useEffect(() => {
        if (users.length === 0 || completed || error) return;

        const interval = setInterval(() => {
            setCurrentIdx(prev => {
                const next = prev + 1;

                // If we reached the end
                if (next >= users.length) {
                    clearInterval(interval);
                    setCompleted(true);
                    return prev;
                }

                // Auto scroll
                if (scrollRef.current) {
                    const activeElement = scrollRef.current.children[next];
                    if (activeElement) {
                        activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }

                return next;
            });
        }, 50); // Fast animation

        return () => clearInterval(interval);
    }, [users, completed, error]);

    if (error) {
        return (
            <div className="p-6 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-red-800 mb-2">Errore Reset</h2>
                <p className="text-red-600 mb-6">{error}</p>
                <button onClick={onCancel} className="bg-red-600 text-white px-6 py-2 rounded-lg">Chiudi</button>
            </div>
        );
    }

    if (completed) {
        return (
            <div className="p-8 text-center space-y-6">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="h-12 w-12 text-green-600" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold mb-2 text-green-600">Reset Completato!</h2>
                    <p className="text-gray-500">
                        {resetStats?.stats
                            ? `Operazione completata su ${resetStats.stats.total} clienti (Aggiornati: ${resetStats.stats.updated}, Creati: ${resetStats.stats.created}).`
                            : (resetStats?.message || `Password aggiornata con successo per ${users.length} clienti.`)}
                    </p>
                </div>
                <button
                    onClick={onComplete}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl shadow-lg shadow-green-200 font-bold"
                >
                    Torna alla Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center p-12 space-y-8">
            <div className="relative w-24 h-24">
                <motion.div
                    className="w-full h-full border-4 border-indigo-100 border-t-indigo-600 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <Lock className="h-8 w-8 text-indigo-600" />
                </div>
            </div>

            <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-gray-800">Elaborazione in corso...</h3>
                <p className="text-gray-500">L'operazione potrebbe richiedere alcuni secondi.</p>
            </div>

            <div className="w-full max-w-xs bg-gray-100 rounded-full h-2 overflow-hidden">
                <motion.div
                    className="h-full bg-indigo-600"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 20, ease: "linear" }} // Fake progress since it's a batch request
                />
            </div>
        </div>
    );
}

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

    // Waitlist State
    const [showWaitlist, setShowWaitlist] = useState(false);
    const [waitlist, setWaitlist] = useState([]);
    const [loadingWaitlist, setLoadingWaitlist] = useState(false);

    // Delete State
    const [clientToDelete, setClientToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Country Selector State
    const [isCountryOpen, setIsCountryOpen] = useState(false);
    const [countrySearch, setCountrySearch] = useState('');
    const countryDropdownRef = useRef(null);

    // Search & Edit State
    const [searchQuery, setSearchQuery] = useState('');
    const [clientToEdit, setClientToEdit] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        countryOfOrigin: '',
        residence: ''
    });

    // Edit Modal Country State
    const [isEditCountryOpen, setIsEditCountryOpen] = useState(false);
    const [editCountrySearch, setEditCountrySearch] = useState('');
    const editCountryDropdownRef = useRef(null);

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

    const [showDomainAlert, setShowDomainAlert] = useState(false);
    const [showMaintenance, setShowMaintenance] = useState(true);

    // Set Password Modal State
    const [clientToSetPassword, setClientToSetPassword] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [isSettingPassword, setIsSettingPassword] = useState(false);

    // Bulk Reset State
    const [showBulkResetModal, setShowBulkResetModal] = useState(false);
    const [bulkResetPassword, setBulkResetPassword] = useState('');
    const [isBulkResetting, setIsBulkResetting] = useState(false);

    // Bulk Unverify State
    const [showBulkUnverifyModal, setShowBulkUnverifyModal] = useState(false);
    const [isBulkUnverifying, setIsBulkUnverifying] = useState(false);

    const handleVerificationClick = (client) => {
        let msg = "Stato Verifica: VERIFICATO ✅\n";

        if (client.email_confirmed_at) {
            msg += `\n📧 Metodo: Email`;
            msg += `\n📅 Data: ${new Date(client.email_confirmed_at).toLocaleString('it-IT')}`;
        } else if (client.phone_confirmed_at) {
            msg += `\n📱 Metodo: Telefono`;
            msg += `\n📅 Data: ${new Date(client.phone_confirmed_at).toLocaleString('it-IT')}`;
        } else {
            msg += `\n🛡️ Metodo: Admin / Manuale`;
            msg += `\n(Data specifica non disponibile)`;
        }

        alert(msg);
    };

    const initiateBulkReset = () => {
        setShowBulkResetModal(true);
    };

    const handleBulkUnverify = async () => {
        setIsBulkUnverifying(true);
        try {
            const res = await fetch('/api/admin/bulk-unverify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-password': process.env.NEXT_PUBLIC_ADD_CLIENT_PASSWORD
                },
                body: JSON.stringify({
                    accessPassword: process.env.NEXT_PUBLIC_ADD_CLIENT_PASSWORD
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Errore durante l\'operazione');

            alert(data.message);
            setShowBulkUnverifyModal(false);
            window.location.reload();
        } catch (err) {
            console.error('Unverify failed:', err);
            alert('Errore: ' + err.message);
        } finally {
            setIsBulkUnverifying(false);
        }
    };

    useEffect(() => {
        // Check domain
        if (typeof window !== 'undefined' && window.location.hostname === 'baraka-tst-2025.vercel.app') {
            setShowDomainAlert(true);
        }

        const session = localStorage.getItem('add_client_session');
        if (session) {
            const { timestamp } = JSON.parse(session);
            const now = new Date().getTime();
            // 5 hours in milliseconds
            if (now - timestamp < 5 * 60 * 60 * 1000) {
                setIsAuthenticated(true);
                // Fetch waitlist immediately if authenticated
                fetch(`/api/admin/waitlist?accessPassword=${process.env.NEXT_PUBLIC_ADD_CLIENT_PASSWORD}`, {
                    headers: { 'x-access-password': process.env.NEXT_PUBLIC_ADD_CLIENT_PASSWORD }
                })
                    .then(res => res.json())
                    .then(data => {
                        if (data.success) setWaitlist(data.data);
                    })
                    .catch(err => console.error('Error fetching waitlist:', err));
            } else {
                localStorage.removeItem('add_client_session');
            }
        }

        // Check for What's New Modal
        const hasSeenWhatsNew = localStorage.getItem('whats_new_modal_seen_v2');
        if (!hasSeenWhatsNew) {
            setShowWhatsNewModal(true);
        }

        // Close country dropdowns when clicking outside
        const handleClickOutside = (event) => {
            if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target)) {
                setIsCountryOpen(false);
            }
            if (editCountryDropdownRef.current && !editCountryDropdownRef.current.contains(event.target)) {
                setIsEditCountryOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const closeWhatsNew = () => {
        localStorage.setItem('whats_new_modal_seen_v2', 'true');
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
            // Fetch waitlist after login
            fetch(`/api/admin/waitlist?accessPassword=${process.env.NEXT_PUBLIC_ADD_CLIENT_PASSWORD}`, {
                headers: { 'x-access-password': process.env.NEXT_PUBLIC_ADD_CLIENT_PASSWORD }
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success) setWaitlist(data.data);
                })
                .catch(err => console.error('Error fetching waitlist:', err));
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

    const filteredEditCountries = countries.filter(country =>
        country.name.toLowerCase().includes(editCountrySearch.toLowerCase())
    );

    // Debounce Logic
    useEffect(() => {
        const timer = setTimeout(() => {
            if (showClients) {
                fetchClients(1, false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const fetchClients = async (pageNum = 1, isLoadMore = false) => {
        if (isLoadMore) {
            setLoadingMore(true);
        } else {
            setLoadingClients(true);
        }

        try {
            const query = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : '';
            const res = await fetch(`/api/admin/clients-status?page=${pageNum}&limit=10${query}`, {
                headers: { 'x-access-password': process.env.NEXT_PUBLIC_ADD_CLIENT_PASSWORD }
            });
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
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-password': process.env.NEXT_PUBLIC_ADD_CLIENT_PASSWORD
                },
                body: JSON.stringify({
                    authId: clientToDelete.auth_id,
                    accessPassword: process.env.NEXT_PUBLIC_ADD_CLIENT_PASSWORD
                }),
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

    const handleEditClick = (client) => {
        setClientToEdit(client);
        setEditFormData({
            firstName: client.first_name || '',
            lastName: client.last_name || '',
            email: client.email || '',
            phoneNumber: client.phone_number || '',
            countryOfOrigin: client.country_of_origin || '',
            residence: client.residence || ''
        });
    };

    const handleUpdateClient = async (e) => {
        e.preventDefault();
        setIsEditing(true);
        try {
            const res = await fetch('/api/admin/update-client', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-password': process.env.NEXT_PUBLIC_ADD_CLIENT_PASSWORD
                },
                body: JSON.stringify({
                    id: clientToEdit.id,
                    ...editFormData,
                    accessPassword: process.env.NEXT_PUBLIC_ADD_CLIENT_PASSWORD
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to update client');
            }

            // Update local state
            setClients(prev => prev.map(c =>
                c.id === clientToEdit.id ? { ...c, ...editFormData, first_name: editFormData.firstName, last_name: editFormData.lastName, phone_number: editFormData.phoneNumber, country_of_origin: editFormData.countryOfOrigin } : c
            ));

            setClientToEdit(null);
            alert('Cliente aggiornato con successo!');
        } catch (err) {
            console.error('Error updating client:', err);
            alert('Errore durante l\'aggiornamento: ' + err.message);
        } finally {
            setIsEditing(false);
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
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-password': process.env.NEXT_PUBLIC_ADD_CLIENT_PASSWORD
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: 'TempPassword123!', // Temporary default password
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    phoneNumber: formData.phoneNumber,
                    countryOfOrigin: formData.countryOfOrigin,
                    residence: formData.residence,
                    accessPassword: process.env.NEXT_PUBLIC_ADD_CLIENT_PASSWORD
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
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-password': process.env.NEXT_PUBLIC_ADD_CLIENT_PASSWORD
                },
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

    const fetchWaitlist = async () => {
        setLoadingWaitlist(true);
        try {
            const res = await fetch(`/api/admin/waitlist?accessPassword=${process.env.NEXT_PUBLIC_ADD_CLIENT_PASSWORD}`, {
                headers: { 'x-access-password': process.env.NEXT_PUBLIC_ADD_CLIENT_PASSWORD }
            });
            const data = await res.json();
            if (data.success) {
                setWaitlist(data.data);
            }
        } catch (err) {
            console.error('Error fetching waitlist:', err);
        } finally {
            setLoadingWaitlist(false);
        }
    };

    const toggleWaitlist = () => {
        if (!showWaitlist) {
            setShowClients(false); // Close clients list if open
            // fetchWaitlist(); // Already fetched on load/login, but can refresh
            fetchWaitlist();
        }
        setShowWaitlist(!showWaitlist);
    };

    const handleApproveWaitlist = async (id) => {
        try {
            const res = await fetch('/api/admin/waitlist/approve', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-password': process.env.NEXT_PUBLIC_ADD_CLIENT_PASSWORD
                },
                body: JSON.stringify({ id, accessPassword: process.env.NEXT_PUBLIC_ADD_CLIENT_PASSWORD })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to approve');
            }

            // Remove from list
            setWaitlist(prev => prev.filter(item => item.id !== id));
            alert('Utente approvato e aggiunto ai clienti!');
        } catch (err) {
            console.error('Error approving:', err);
            alert('Errore durante l\'approvazione: ' + err.message);
        }
    };

    const handleRejectWaitlist = async (id) => {
        if (!confirm('Sei sicuro di voler rifiutare questa richiesta?')) return;

        try {
            const res = await fetch('/api/admin/waitlist/reject', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-password': process.env.NEXT_PUBLIC_ADD_CLIENT_PASSWORD
                },
                body: JSON.stringify({ id, accessPassword: process.env.NEXT_PUBLIC_ADD_CLIENT_PASSWORD })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to reject');
            }

            // Update local state to show rejected status
            setWaitlist(prev => prev.map(item =>
                item.id === id ? { ...item, status: 'rejected' } : item
            ));
        } catch (err) {
            console.error('Error rejecting:', err);
            alert('Errore durante il rifiuto: ' + err.message);
        }
    };

    const handleDeleteWaitlist = async (id) => {
        if (!confirm('Sei sicuro di voler eliminare questa richiesta definitivamente?')) return;
        try {
            const res = await fetch('/api/admin/waitlist', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-password': process.env.NEXT_PUBLIC_ADD_CLIENT_PASSWORD
                },
                body: JSON.stringify({ id, accessPassword: process.env.NEXT_PUBLIC_ADD_CLIENT_PASSWORD })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to delete');
            }

            setWaitlist(prev => prev.filter(item => item.id !== id));
            alert('Richiesta eliminata!');
        } catch (err) {
            console.error('Error deleting:', err);
            alert('Errore durante l\'eliminazione: ' + err.message);
        }
    };

    const handleSetPasswordSubmit = async (e) => {
        e.preventDefault();
        if (newPassword.length < 6) {
            alert('La password deve essere di almeno 6 caratteri');
            return;
        }

        setIsSettingPassword(true);
        try {
            const res = await fetch('/api/admin/set-client-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-password': process.env.NEXT_PUBLIC_ADD_CLIENT_PASSWORD
                },
                body: JSON.stringify({
                    authId: clientToSetPassword.auth_id,
                    newPassword: newPassword,
                    accessPassword: process.env.NEXT_PUBLIC_ADD_CLIENT_PASSWORD
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to set password');
            }

            alert('Password aggiornata con successo!');
            setClientToSetPassword(null);
            setNewPassword('');
        } catch (err) {
            console.error('Error setting password:', err);
            alert('Errore durante l\'aggiornamento della password: ' + err.message);
        } finally {
            setIsSettingPassword(false);
        }
    };

    const handleBulkReset = async (e) => {
        e.preventDefault();
        if (bulkResetPassword.length < 6) {
            alert('La password deve essere di almeno 6 caratteri');
            return;
        }

        if (!confirm('SEI SICURO? Questa azione cambierà la password di TUTTI i clienti. Non può essere annullata.')) {
            return;
        }

        setIsBulkResetting(true);
        try {
            const res = await fetch('/api/admin/bulk-reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-password': process.env.NEXT_PUBLIC_ADD_CLIENT_PASSWORD
                },
                body: JSON.stringify({
                    newPassword: bulkResetPassword,
                    accessPassword: process.env.NEXT_PUBLIC_ADD_CLIENT_PASSWORD
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to bulk reset');
            }

            const result = await res.json();
            alert(`Operazione completata! ${result.message}`);
            setShowBulkResetModal(false);
            setBulkResetPassword('');
        } catch (err) {
            console.error('Error bulk resetting:', err);
            alert('Errore durante il reset massivo: ' + err.message);
        } finally {
            setIsBulkResetting(false);
        }
    };

    const getTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " anni fa";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " mesi fa";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " giorni fa";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " ore fa";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " min fa";
        return Math.floor(seconds) + " sec fa";
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

            {/* Edit Client Modal */}
            <AnimatePresence>
                {clientToEdit && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-[65] flex items-center justify-center p-4 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full relative flex flex-col max-h-[90vh]"
                        >
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <Edit className="w-5 h-5 text-red-600" />
                                    Modifica Cliente
                                </h3>
                                <button onClick={() => setClientToEdit(null)} className="text-gray-400 hover:text-gray-600">
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleUpdateClient} className="p-6 space-y-4 overflow-y-auto">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                                        <input
                                            type="text"
                                            value={editFormData.firstName}
                                            onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500 outline-none transition-all"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Cognome</label>
                                        <input
                                            type="text"
                                            value={editFormData.lastName}
                                            onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500 outline-none transition-all"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={editFormData.email}
                                        onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500 outline-none transition-all"
                                        placeholder="mario@esempio.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
                                    <input
                                        type="tel"
                                        value={editFormData.phoneNumber}
                                        onChange={(e) => setEditFormData({ ...editFormData, phoneNumber: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500 outline-none transition-all"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="relative" ref={editCountryDropdownRef}>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Paese Origine</label>
                                        <div
                                            className="relative cursor-pointer group"
                                            onClick={() => setIsEditCountryOpen(!isEditCountryOpen)}
                                        >
                                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-hover:text-red-500 transition-colors" />
                                            <div className={`w-full pl-10 pr-10 py-3 rounded-xl border ${isEditCountryOpen ? 'border-red-500 ring-2 ring-red-500' : 'border-gray-300 hover:border-red-300'} bg-white flex items-center justify-between transition-all`}>
                                                <span className={`truncate ${editFormData.countryOfOrigin ? 'text-gray-900' : 'text-gray-400'}`}>
                                                    {editFormData.countryOfOrigin || 'Seleziona'}
                                                </span>
                                                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isEditCountryOpen ? 'rotate-180' : ''}`} />
                                            </div>
                                        </div>

                                        <AnimatePresence>
                                            {isEditCountryOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    className="absolute z-[100] w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 max-h-64 overflow-hidden flex flex-col"
                                                >
                                                    <div className="p-3 border-b border-gray-100 sticky top-0 bg-white z-10">
                                                        <div className="relative">
                                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                                            <input
                                                                type="text"
                                                                value={editCountrySearch}
                                                                onChange={(e) => setEditCountrySearch(e.target.value)}
                                                                placeholder="Cerca paese..."
                                                                className="w-full pl-9 pr-4 py-2 rounded-lg bg-gray-50 border-none text-sm focus:ring-2 focus:ring-red-500 outline-none"
                                                                autoFocus
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="overflow-y-auto flex-grow p-1 custom-scrollbar">
                                                        {filteredEditCountries.length === 0 ? (
                                                            <div className="p-4 text-center text-gray-500 text-sm">Nessun paese trovato</div>
                                                        ) : (
                                                            filteredEditCountries.map((country) => (
                                                                <button
                                                                    key={country.code}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setEditFormData({ ...editFormData, countryOfOrigin: country.name });
                                                                        setIsEditCountryOpen(false);
                                                                        setEditCountrySearch('');
                                                                    }}
                                                                    className="w-full px-3 py-2.5 text-left hover:bg-red-50 rounded-lg flex items-center gap-3 transition-colors group"
                                                                >
                                                                    <span className="text-xl shadow-sm rounded-sm overflow-hidden">{country.flag}</span>
                                                                    <span className="text-gray-700 font-medium group-hover:text-red-700">{country.name}</span>
                                                                </button>
                                                            ))
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Residenza</label>
                                        <input
                                            type="text"
                                            value={editFormData.residence}
                                            onChange={(e) => setEditFormData({ ...editFormData, residence: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setClientToEdit(null)}
                                        className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                                    >
                                        Annulla
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isEditing}
                                        className="flex-1 px-4 py-2 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        {isEditing ? 'Salvataggio...' : 'Salva Modifiche'}
                                    </button>
                                </div>
                            </form>
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

            {/* Set Password Modal */}
            <AnimatePresence>
                {clientToSetPassword && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-[75] flex items-center justify-center p-4 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden"
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                        <Key className="w-5 h-5 text-yellow-600" />
                                        Imposta Password
                                    </h3>
                                    <button onClick={() => setClientToSetPassword(null)} className="text-gray-400 hover:text-gray-600">
                                        <XCircle className="w-6 h-6" />
                                    </button>
                                </div>
                                <p className="text-gray-500 mb-4 text-sm">
                                    Imposta una nuova password per <strong>{clientToSetPassword.first_name} {clientToSetPassword.last_name}</strong>.
                                </p>
                                <form onSubmit={handleSetPasswordSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nuova Password</label>
                                        <input
                                            type="text"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-yellow-500 outline-none transition-all"
                                            placeholder="Min. 6 caratteri"
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSettingPassword}
                                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 rounded-xl transition-colors shadow-lg flex items-center justify-center gap-2"
                                    >
                                        {isSettingPassword ? 'Salvataggio...' : 'Aggiorna Password'}
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bulk Reset Modal with Animation */}
            <AnimatePresence>
                {showBulkResetModal && (
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
                            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden"
                        >
                            {!isBulkResetting ? (
                                <>
                                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                            <Hammer className="w-5 h-5 text-red-600" />
                                            Reset Password Massivo
                                        </h3>
                                        <button onClick={() => setShowBulkResetModal(false)} className="text-gray-400 hover:text-gray-600">
                                            <XCircle className="w-6 h-6" />
                                        </button>
                                    </div>
                                    <div className="p-6 space-y-4">
                                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                                            <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                                            <div>
                                                <h4 className="font-bold text-amber-800">Attenzione</h4>
                                                <p className="text-sm text-amber-700 mt-1">
                                                    Questa azione resetterà la password per <strong>tutti i clienti</strong> che hanno ancora la password di default o non ne hanno una.
                                                    <br /><br />
                                                    I clienti che hanno già impostato una password personale <strong>NON</strong> verranno modificati.
                                                </p>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Nuova Password Per Tutti</label>
                                            <div className="relative">
                                                <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                                <input
                                                    type="text"
                                                    value={bulkResetPassword}
                                                    onChange={(e) => setBulkResetPassword(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                                                    placeholder="Es. Baraka2025!"
                                                />
                                            </div>
                                        </div>

                                        <p className="text-red-600 text-xs italic bg-red-50 p-2 rounded-lg border border-red-200">
                                            ⚠️ Attenzione: Questa operazione utilizza molte risorse del database. Usare con cautela e solo quando necessario.
                                        </p>
                                    </div>
                                    <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                                        <button
                                            onClick={() => setShowBulkResetModal(false)}
                                            className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                                        >
                                            Annulla
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (!bulkResetPassword || bulkResetPassword.length < 6) {
                                                    alert("La password deve essere di almeno 6 caratteri.");
                                                    return;
                                                }
                                                setIsBulkResetting(true);
                                            }}
                                            className="px-6 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                                        >
                                            Avvia Reset
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <BulkResetAnimation
                                    newPassword={bulkResetPassword}
                                    accessPassword={process.env.NEXT_PUBLIC_ADD_CLIENT_PASSWORD}
                                    onComplete={() => {
                                        setIsBulkResetting(false);
                                        setShowBulkResetModal(false);
                                        setBulkResetPassword('');
                                        // Refresh list logic here if needed, or just reload
                                        window.location.reload();
                                    }}
                                    onCancel={() => {
                                        setIsBulkResetting(false);
                                        setShowBulkResetModal(false);
                                    }}
                                />
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bulk Unverify Modal */}
            <AnimatePresence>
                {showBulkUnverifyModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-100">
                                <div className="flex items-center gap-3 text-amber-600 mb-2">
                                    <ShieldAlert className="w-8 h-8" />
                                    <h3 className="text-xl font-bold">Rimuovi Verifica a Tutti</h3>
                                </div>
                                <p className="text-gray-500 text-sm">
                                    Stai per rimuovere lo stato "Verificato" a <strong>TUTTI</strong> i clienti.
                                    Questa azione è irreversibile e richiederà una nuova verifica (email/telefono) per tutti gli utenti.
                                </p>
                                <p className="text-amber-600 text-xs mt-3 italic bg-amber-50 p-2 rounded-lg border border-amber-200">
                                    ⚠️ Attenzione: Questa operazione utilizza molte risorse del database. Usare con cautela e solo quando necessario.
                                </p>
                            </div>

                            <div className="p-6 bg-gray-50 flex justify-end gap-3">
                                <button
                                    onClick={() => setShowBulkUnverifyModal(false)}
                                    className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                                    disabled={isBulkUnverifying}
                                >
                                    Annulla
                                </button>
                                <button
                                    onClick={handleBulkUnverify}
                                    className="px-6 py-3 rounded-xl bg-amber-600 text-white font-bold hover:bg-amber-700 transition-colors shadow-lg shadow-amber-200 flex items-center gap-2"
                                    disabled={isBulkUnverifying}
                                >
                                    {isBulkUnverifying ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Elaborazione...
                                        </>
                                    ) : (
                                        <>Conferma Rimozione</>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Domain Alert Modal */}
            <AnimatePresence>
                {showDomainAlert && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.9, rotate: -5 }}
                            animate={{ scale: 1, rotate: 0 }}
                            className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden text-center p-8 border-4 border-yellow-400"
                        >
                            <div className="text-6xl mb-4">🚧 🏃‍♂️ 💨</div>
                            <h2 className="text-3xl font-black text-gray-900 mb-4 uppercase italic">Spostamento in corso!</h2>
                            <p className="text-lg text-gray-600 mb-8 font-medium">
                                Ehi! Stiamo correndo verso la nostra nuova casa ufficiale.
                                <br />
                                <span className="text-red-600 font-bold">baraka-tst-2025.vercel.app</span> è roba vecchia!
                            </p>
                            <a
                                href="https://www.barakasrl.it/add-client"
                                className="block w-full bg-yellow-400 hover:bg-yellow-500 text-black font-black text-xl py-4 rounded-xl transition-transform transform hover:scale-105 shadow-lg border-b-4 border-yellow-600 active:border-b-0 active:translate-y-1"
                            >
                                VAI SU BARAKASRL.IT 🚀
                            </a>
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
                                    <h3 className="text-xl font-bold">Aggiornamento Importante!</h3>
                                </div>
                                <p className="text-red-100 opacity-90 text-sm">
                                    Nuove funzionalità per la gestione della Waitlist e Clienti.
                                </p>
                            </div>
                            <div className="p-6">
                                <ul className="space-y-4 mb-8">
                                    <li className="flex items-start gap-3">
                                        <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                            <Trash2 className="w-4 h-4 text-red-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-800">Eliminazione Definitiva</h4>
                                            <p className="text-sm text-gray-500">Ora puoi eliminare definitivamente le richieste rifiutate dalla waitlist.</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                            <Users className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-800">Nuova Interfaccia</h4>
                                            <p className="text-sm text-gray-500">Switch rapido tra Aggiungi Cliente e Waitlist, con notifiche in tempo reale.</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-800">Dettagli Temporali</h4>
                                            <p className="text-sm text-gray-500">Vedi esattamente quando una richiesta è arrivata o un cliente è stato aggiunto.</p>
                                        </div>
                                    </li>
                                </ul>
                                <button
                                    onClick={closeWhatsNew}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-colors shadow-lg"
                                >
                                    Ho capito, grazie!
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
            <header className="border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-md z-50">
                <div className="p-6 flex justify-between items-center">
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
                </div>
                {/* Countdown Timer */}
                <div className="px-4 pb-2 flex justify-center">
                    <CountdownTimer variant="compact" targetDate="2026-01-01T00:00:00" />
                </div>
            </header>

            {/* Toggle Navigation */}
            <div className="flex justify-center mt-8 mb-6">
                <div className="bg-gray-100 p-1.5 rounded-full inline-flex relative shadow-inner">
                    <motion.div
                        className="absolute top-1.5 bottom-1.5 bg-white rounded-full shadow-sm z-0"
                        initial={false}
                        animate={{
                            x: showWaitlist ? '100%' : '0%',
                            width: '50%'
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                    <button
                        onClick={() => { setShowWaitlist(false); setShowClients(true); }}
                        className={`relative z-10 px-8 py-2.5 rounded-full font-bold text-sm transition-colors flex items-center gap-2 ${!showWaitlist ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <User className="w-4 h-4" />
                        Aggiungi Cliente
                    </button>
                    <button
                        onClick={() => { setShowWaitlist(true); setShowClients(false); }}
                        className={`relative z-10 px-8 py-2.5 rounded-full font-bold text-sm transition-colors flex items-center gap-2 ${showWaitlist ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Users className="w-4 h-4" />
                        Waitlist
                        {waitlist.filter(w => w.status === 'pending').length > 0 && (
                            <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                                {waitlist.filter(w => w.status === 'pending').length}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Waitlist View */}
            <AnimatePresence>
                {showWaitlist && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="w-full max-w-4xl mx-auto px-4 overflow-hidden"
                    >
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mt-6">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <Users className="w-5 h-5 text-red-600" />
                                    Richieste di Accesso ({waitlist.length})
                                </h3>
                                <button onClick={() => fetchWaitlist()} className="text-sm text-red-600 font-medium hover:underline">
                                    Aggiorna
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 text-gray-500 text-sm uppercase">
                                        <tr>
                                            <th className="p-4 font-medium">Nome</th>
                                            <th className="p-4 font-medium">Contatti</th>
                                            <th className="p-4 font-medium">Luogo</th>
                                            <th className="p-4 font-medium">Stato</th>
                                            <th className="p-4 font-medium text-right">Azioni</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {loadingWaitlist ? (
                                            <tr>
                                                <td colSpan="5" className="p-8 text-center text-gray-500">
                                                    Caricamento...
                                                </td>
                                            </tr>
                                        ) : waitlist.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="p-8 text-center text-gray-500">
                                                    Nessuna richiesta in attesa.
                                                </td>
                                            </tr>
                                        ) : (
                                            waitlist.map((item) => (
                                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-gray-100 overflow-visible shrink-0 border border-gray-200 relative">
                                                                <img
                                                                    src={getAvatarUrl(item.email || item.first_name)}
                                                                    alt="Avatar"
                                                                    className="w-full h-full object-cover rounded-full overflow-hidden"
                                                                />
                                                                {(() => {
                                                                    const countryCode = countries.find(c => c.name === item.country)?.code?.toLowerCase();
                                                                    return countryCode ? (
                                                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border border-white overflow-hidden z-20 shadow-sm bg-white">
                                                                            <img
                                                                                src={`https://flagcdn.com/w40/${countryCode}.png`}
                                                                                alt={item.country}
                                                                                className="w-full h-full object-cover"
                                                                            />
                                                                        </div>
                                                                    ) : null;
                                                                })()}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-gray-800">{item.first_name} {item.last_name}</p>
                                                                <p className="text-xs text-gray-400 font-mono mt-1">
                                                                    {new Date(item.created_at).toLocaleString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <p className="text-sm text-gray-600 flex items-center gap-1"><Phone className="w-3 h-3" /> {item.phone_number}</p>
                                                        {item.email && <p className="text-sm text-gray-500 flex items-center gap-1"><Mail className="w-3 h-3" /> {item.email}</p>}
                                                    </td>
                                                    <td className="p-4">
                                                        <p className="text-sm text-gray-600">{item.country}</p>
                                                        {item.city && <p className="text-xs text-gray-400">{item.city}</p>}
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                            item.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                                'bg-yellow-100 text-yellow-700'
                                                            }`}>
                                                            {item.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        {item.status === 'pending' && (
                                                            <div className="flex gap-2 justify-end">
                                                                <button
                                                                    onClick={() => handleRejectWaitlist(item.id)}
                                                                    className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                                                                >
                                                                    Rifiuta
                                                                </button>
                                                                <button
                                                                    onClick={() => handleApproveWaitlist(item.id)}
                                                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                                                                >
                                                                    Approva
                                                                </button>
                                                            </div>
                                                        )}
                                                        {item.status === 'rejected' && (
                                                            <button
                                                                onClick={() => handleDeleteWaitlist(item.id)}
                                                                className="text-gray-400 hover:text-red-600 p-2 rounded-lg transition-colors"
                                                                title="Elimina definitivamente"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <main className="flex-grow flex flex-col items-center p-4 md:p-8 gap-8">
                {!showWaitlist && (<>
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
                                                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-red-200 flex items-center justify-center gap-2 group"
                                            >
                                                {loading ? (
                                                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <>
                                                        <span className="text-lg">Aggiungi Cliente</span>
                                                        <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                                    </>
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
                                <>
                                    <button
                                        onClick={() => setShowUnverifiedModal(true)}
                                        className="bg-red-50 border border-red-100 text-red-600 font-medium px-6 rounded-xl shadow-sm hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                                        title="Gestisci Utenti Non Verificati"
                                    >
                                        <Users className="w-5 h-5" />
                                        <span className="hidden sm:inline">Non Verificati</span>
                                    </button>
                                    <button
                                        onClick={initiateBulkReset}
                                        className="bg-gray-900 text-white font-medium px-6 rounded-xl shadow-sm hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                                        title="Reset Password Massivo (Solo Default/No Password)"
                                    >
                                        <Hammer className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => setShowBulkUnverifyModal(true)}
                                        className="bg-amber-100 text-amber-700 border border-amber-200 font-medium px-6 rounded-xl shadow-sm hover:bg-amber-200 transition-all flex items-center justify-center gap-2"
                                        title="Rimuovi Verifica a Tutti"
                                    >
                                        <ShieldAlert className="w-5 h-5" />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Legend for Key Icons */}
                        <div className="mt-6 bg-white p-4 rounded-xl border border-gray-100 flex flex-wrap gap-6 items-center text-sm text-gray-600">
                            <span className="font-medium text-gray-900">Legenda Password:</span>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                <span>Password Personale (Sicuro)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                                <span>Password Default (Da Cambiare)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <span>Nessuna Password / Errore</span>
                            </div>
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
                                        {/* Search Bar */}
                                        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                                <input
                                                    type="text"
                                                    value={searchQuery}
                                                    onChange={(e) => {
                                                        setSearchQuery(e.target.value);
                                                        // Debounce or just trigger fetch on enter/button could be better, but for now direct update
                                                        // Ideally we should debounce this call
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            // fetchClients(1, false); // Removed direct call, handled by effect
                                                        }
                                                    }}
                                                    placeholder="Cerca per nome, telefono o email..."
                                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                                                />
                                                {/* Removed manual search button as it's now automatic/debounced, or keep as visual indicator */}
                                                <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-red-50 text-red-600 p-1.5 rounded-lg">
                                                    <Search className="w-4 h-4" />
                                                </div>
                                            </div>
                                        </div>
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
                                                                <div className="w-10 h-10 rounded-full bg-gray-100 overflow-visible shrink-0 border border-gray-200 relative">
                                                                    <img
                                                                        src={getAvatarUrl(client.email || client.first_name)}
                                                                        alt="Avatar"
                                                                        className="w-full h-full object-cover rounded-full overflow-hidden"
                                                                    />
                                                                    {(() => {
                                                                        const countryCode = countries.find(c => c.name === client.country_of_origin)?.code?.toLowerCase();
                                                                        return countryCode ? (
                                                                            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border border-white overflow-hidden z-20 shadow-sm bg-white">
                                                                                <img
                                                                                    src={`https://flagcdn.com/w40/${countryCode}.png`}
                                                                                    alt={client.country_of_origin}
                                                                                    className="w-full h-full object-cover"
                                                                                />
                                                                            </div>
                                                                        ) : null;
                                                                    })()}
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
                                                                        <button
                                                                            onClick={() => handleVerificationClick(client)}
                                                                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 transition-colors cursor-pointer"
                                                                            title="Clicca per dettagli verifica"
                                                                        >
                                                                            <CheckCircle className="w-3 h-3" /> Verificato
                                                                        </button>
                                                                    ) : (
                                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                                            <XCircle className="w-3 h-3" /> Non Verificato
                                                                        </span>
                                                                    )}
                                                                    <span className="text-xs text-gray-400 font-mono">{getTimeAgo(client.created_at)}</span>
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        onClick={() => {
                                                                            setClientToSetPassword(client);
                                                                            setNewPassword('');
                                                                        }}
                                                                        className={`p-2 rounded-lg transition-colors ${!client.auth_id
                                                                            ? 'text-red-600 hover:bg-red-50' // No auth (Red)
                                                                            : (client.user_metadata?.force_password_change === false || client.user_metadata?.force_password_change === 'false')
                                                                                ? 'text-green-600 hover:bg-green-50' // Explicitly false -> Custom password (Green)
                                                                                : 'text-amber-600 hover:bg-amber-50' // True or Missing -> Default/Unknown (Yellow)
                                                                            }`}
                                                                        title="Imposta Password"
                                                                    >
                                                                        <Key className="w-5 h-5" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleEditClick(client)}
                                                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                                        title="Modifica Cliente"
                                                                    >
                                                                        <Edit className="w-5 h-5" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => confirmDelete(client)}
                                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                                        title="Elimina Cliente"
                                                                    >
                                                                        <Trash2 className="w-5 h-5" />
                                                                    </button>
                                                                </div>
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
                </>)}
            </main>

            <footer className="p-6 text-center text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} Sistemi di Fedeltà Baraka
            </footer>

            {/* Maintenance Modal */}
            {/* <AnimatePresence>
                {showMaintenance && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center p-4 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden text-center p-8 border-t-4 border-blue-500"
                        >
                            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Hammer className="w-10 h-10 text-blue-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Manutenzione in Corso</h3>
                            <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                                Stiamo effettuando aggiornamenti importanti. <br />
                                Questa pagina non sarà disponibile per la prossima ora (1-2 ore massimo).
                            </p>
                            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-blue-800 text-sm">
                                Ci scusiamo per il disagio. Riprova più tardi.
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence> */}

            {/* Floating Download Button */}
            <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={async () => {
                    try {
                        const res = await fetch('/api/admin/clients-status?limit=1000');
                        const data = await res.json();
                        const jsonString = JSON.stringify(data.clients, null, 2);
                        const blob = new Blob([jsonString], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `baraka_clients_backup_${new Date().toISOString().split('T')[0]}.json`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    } catch (err) {
                        console.error('Download failed:', err);
                        alert('Impossibile scaricare i dati al momento.');
                    }
                }}
                className="fixed bottom-6 right-6 bg-gray-900 text-white p-3 rounded-full shadow-xl hover:bg-black transition-all z-50 group flex items-center gap-0 hover:gap-2 hover:pr-5"
                title="Scarica Backup JSON"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                <span className="w-0 overflow-hidden group-hover:w-auto transition-all duration-300 whitespace-nowrap text-sm font-medium">Backup</span>
            </motion.button>
        </div >
    );
}
