"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import BarcodeScanner from "@/components/admin/BarcodeScanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2, QrCode, Search, Gift, MinusCircle, PlusCircle, AlertCircle, Ticket, Lock, Unlock } from "lucide-react";
import { toast } from "sonner";

export default function ScanPage() {
    const [scannedId, setScannedId] = useState(null);
    const [customer, setCustomer] = useState(null);
    const [voucher, setVoucher] = useState(null);
    const [offers, setOffers] = useState([]); // New Offers State

    // Action States
    const [pointsToAdd, setPointsToAdd] = useState("");
    const [pointsToDeduct, setPointsToDeduct] = useState("");

    const [loading, setLoading] = useState(false);
    const [scanning, setScanning] = useState(true);
    const [scanMode, setScanMode] = useState("customer");
    const [updateStatus, setUpdateStatus] = useState("idle");

    const [tabValue, setTabValue] = useState("add");

    const supabase = createClient();

    // Fetch Offers on Load
    useEffect(() => {
        const fetchOffers = async () => {
            try {
                const response = await fetch('/api/admin/offers');
                if (response.ok) {
                    const data = await response.json();
                    setOffers(data.filter(o => o.is_active));
                }
            } catch (err) {
                console.error("Failed to fetch offers", err);
            }
        };
        fetchOffers();
    }, []);

    // Realtime Points Update
    useEffect(() => {
        if (!customer) return;

        console.log("Setting up Realtime for Customer:", customer.id);
        const channel = supabase
            .channel(`points-${customer.id}`)
            .on(
                'postgres_changes',
                {
                    event: '*', // Listen to INSERT/UPDATE/DELETE
                    schema: 'public',
                    table: 'loyalty_points',
                    filter: `customer_id=eq.${customer.id}`
                },
                async (payload) => {
                    console.log("Realtime Event:", payload);
                    // Fetch new total points
                    const { data: pointsData } = await supabase
                        .from("customer_points_balance")
                        .select("total_points")
                        .eq("customer_id", customer.id)
                        .single();

                    if (pointsData) {
                        setCustomer(prev => ({
                            ...prev,
                            total_points: pointsData.total_points
                        }));
                        toast.info("Saldo Punti Aggiornato in Tempo Reale!");
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [customer?.id, supabase]);


    // Auto-reset after success
    useEffect(() => {
        if (updateStatus === "success") {
            const timer = setTimeout(() => {
                resetScanner();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [updateStatus]);

    // Data Quality Checks
    const getWarnings = (c) => {
        const warnings = [];
        const isPlaceholderEmail = c.email && c.email.includes('noemail.baraka');

        if (isPlaceholderEmail) warnings.push("Email mancante");
        if (!c.last_name || c.last_name.trim() === '.' || c.last_name.trim().length === 0) warnings.push("Cognome mancante");
        if (!c.phone_number) warnings.push("Telefono mancante");

        return warnings;
    };

    const warnings = customer ? getWarnings(customer) : [];

    const handleScanSuccess = async (decodedText) => {
        if (loading || !scanning) return;

        console.log("Scanned:", decodedText);
        setScannedId(decodedText);
        setScanning(false);
        setLoading(true);

        try {
            if (scanMode === 'voucher') {
                const response = await fetch('/api/admin/voucher/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code: decodedText })
                });

                const data = await response.json();

                if (!response.ok) {
                    toast.error(data.error || "Voucher non valido");
                    setScanning(true);
                    setLoading(false);
                    return;
                }

                setVoucher(data.voucher);
                setCustomer(data.voucher.customer);
                setLoading(false);
                return;
            }

            // 1. Fetch Customer Details
            let customerData = null;
            let customerError = null;

            // Check if it's a full UUID
            if (decodedText.includes('-') || decodedText.length >= 32) {
                const result = await supabase
                    .from("customers")
                    .select("id, first_name, last_name, email, phone_number")
                    .eq("id", decodedText)
                    .single();
                customerData = result.data;
                customerError = result.error;
            }

            // If not found, use indexed barcode_value
            if (!customerData) {
                const barcodeValue = decodedText.toUpperCase().replace(/-/g, '').substring(0, 12);
                const result = await supabase
                    .from("customers")
                    .select("id, first_name, last_name, email, phone_number")
                    .eq("barcode_value", barcodeValue)
                    .single();
                customerData = result.data;
                customerError = result.error;
            }

            if (customerError || !customerData) {
                toast.error(`Utente non trovato!`, { description: decodedText });
                setScanning(true);
                setLoading(false);
                return;
            }

            // 2. Fetch Points
            const { data: pointsData } = await supabase
                .from("customer_points_balance")
                .select("total_points")
                .eq("customer_id", customerData.id)
                .single();

            setCustomer({
                ...customerData,
                total_points: pointsData?.total_points || 0,
            });

        } catch (err) {
            console.error(err);
            toast.error("Errore durante la ricerca.");
            setScanning(true);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePoints = async (actionType) => {
        setUpdateStatus("updating");
        let pointsValue = 0;
        let description = "";

        if (actionType === 'add') {
            if (!pointsToAdd || isNaN(pointsToAdd)) {
                toast.error("Valore non valido");
                setUpdateStatus("idle");
                return;
            }
            pointsValue = parseInt(pointsToAdd, 10);
            description = "Scanned at location (Admin)";
        } else if (actionType === 'deduct') {
            if (!pointsToDeduct || isNaN(pointsToDeduct)) {
                toast.error("Valore non valido");
                setUpdateStatus("idle");
                return;
            }
            // Negative for deduction
            pointsValue = -Math.abs(parseInt(pointsToDeduct, 10));
            description = "Points redeemed/deducted (Admin)";
        }

        try {
            const response = await fetch(`/api/admin/customers/${customer.id}/points`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    points: pointsValue,
                    description: description,
                }),
            });

            if (!response.ok) throw new Error("Failed");

            setUpdateStatus("success");
            const msg = actionType === 'add' ? `Aggiunti ${pointsValue} punti` : `Dedotti ${Math.abs(pointsValue)} punti`;
            toast.success("Aggiornamento riuscito!", { description: msg });

            // Optimistic Update
            setCustomer(prev => ({
                ...prev,
                total_points: (prev.total_points || 0) + pointsValue
            }));

        } catch (error) {
            console.error(error);
            toast.error("Errore aggiornamento.");
            setUpdateStatus("idle");
        }
    };

    const handleCreateVoucher = async (offer, cost) => {
        if (!offer || !cost) {
            toast.info("Seleziona un'offerta valida");
            return;
        }
        if (customer.total_points < cost) {
            toast.error("Punti insufficienti");
            return;
        }

        setUpdateStatus("updating");
        try {
            const response = await fetch('/api/admin/vouchers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customer_id: customer.id,
                    points_to_convert: cost,
                    description: `Voucher: ${typeof offer.title === 'string' ? offer.title : (offer.title.it || offer.title.en || 'Offerta')}`
                })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Failed");
            }

            setUpdateStatus("success");
            toast.success("Voucher Creato con Successo!", { description: `Codice: ${data.voucher.code}` });

            // Optimistically update points immediately (Realtime will also trigger)
            setCustomer(prev => ({
                ...prev,
                total_points: prev.total_points - cost
            }));

        } catch (error) {
            console.error(error);
            toast.error(error.message || "Errore creazione voucher");
            setUpdateStatus("idle");
        }
    };

    const handleRedeemVoucher = async () => {
        if (!voucher) return;
        setUpdateStatus("updating");

        try {
            const response = await fetch('/api/admin/voucher/redeem', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ voucher_id: voucher.id })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Redeem failed");
            }

            setUpdateStatus("success");
            toast.success("Voucher Riscattato con successo!");
        } catch (error) {
            console.error(error);
            toast.error(error.message || "Errore durante il riscatto.");
            setUpdateStatus("idle");
        }
    };


    const resetScanner = () => {
        setScannedId(null);
        setCustomer(null);
        setVoucher(null);
        setPointsToAdd("");
        setPointsToDeduct("");
        setUpdateStatus("idle");
        setScanning(true);
    };

    // DiceBear Avatar URL
    const getAvatarUrl = (email) => {
        return `https://api.dicebear.com/9.x/avataaars/svg?seed=${email || 'user'}&backgroundColor=c0aede,b6e3f4`;
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 md:p-6 pb-20">
            <div className="max-w-xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex justify-between items-center px-2">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Baraka Scan</h1>
                        <p className="text-sm text-gray-500">Punti & Voucher</p>
                    </div>
                    {/* Scan Mode Toggle */}
                    <div className="flex bg-gray-200/50 p-1 rounded-lg">
                        <button
                            onClick={() => setScanMode('customer')}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${scanMode === 'customer' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Cliente
                        </button>
                        <button
                            onClick={() => setScanMode('voucher')}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${scanMode === 'voucher' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Voucher
                        </button>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {/* 1. Scanner View */}
                    {scanning && (
                        <motion.div
                            key="scanner"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"
                        >
                            <div className="p-4 bg-gray-900 text-white text-center pb-8 pt-6">
                                <QrCode className="w-8 h-8 mx-auto mb-2 text-primary" />
                                <h3 className="font-bold text-lg">
                                    {scanMode === 'customer' ? 'Inquadra Carta Cliente' : 'Inquadra Voucher QR'}
                                </h3>
                                <p className="text-white/60 text-sm">Posiziona il codice al centro</p>
                            </div>
                            <div className="p-4 -mt-4">
                                <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                                    <BarcodeScanner
                                        onScanSuccess={handleScanSuccess}
                                        onScanFailure={(err) => console.log(err)}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* 2. Loading State */}
                    {loading && (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center p-12 space-y-4 bg-white rounded-3xl shadow-sm border border-gray-100"
                        >
                            <div className="w-16 h-16 border-4 border-gray-200 border-t-primary rounded-full animate-spin" />
                            <p className="text-gray-500 font-medium animate-pulse">Ricerca in corso...</p>
                        </motion.div>
                    )}

                    {/* 3A. VOUCHER FOUND STATE */}
                    {!scanning && !loading && voucher && updateStatus !== "success" && (
                        <motion.div
                            key="voucher"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100"
                        >
                            <div className="p-8 pb-0 text-center">
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-100 text-purple-600 mb-6 shadow-sm">
                                    <Ticket className="w-10 h-10" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Voucher Valido</h2>
                                <div className="text-xs font-mono bg-gray-100 px-3 py-1 rounded-full inline-block text-gray-500 mb-6 tracking-widest">{voucher.code}</div>

                                <div className="bg-purple-50 rounded-2xl p-6 border border-purple-100 mb-6">
                                    <div className="text-sm text-purple-600 uppercase font-bold tracking-wider mb-2">Valore</div>
                                    <div className="text-4xl font-black text-purple-900">€{Number(voucher.value).toFixed(2)}</div>
                                    {voucher.description && <p className="text-purple-700/60 mt-2 text-sm">{voucher.description}</p>}
                                </div>

                                <div className="flex items-center justify-center gap-3 mb-8 bg-gray-50 p-3 rounded-xl">
                                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm">
                                        <img src={getAvatarUrl(customer?.email)} alt="User" />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-sm font-bold text-gray-900">{customer?.first_name} {customer?.last_name}</div>
                                        <div className="text-xs text-gray-500">{customer?.email}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 pt-0">
                                <Button
                                    size="lg"
                                    className="w-full h-14 rounded-xl font-bold bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-600/20"
                                    onClick={handleRedeemVoucher}
                                    disabled={updateStatus === 'updating'}
                                >
                                    {updateStatus === 'updating' ? <Loader2 className="animate-spin" /> : "Riscatta Ora"}
                                </Button>
                                <Button variant="ghost" className="w-full mt-4 h-12 rounded-xl text-gray-400 hover:text-gray-600" onClick={resetScanner}>
                                    Annulla
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* 3B. Customer Profile & Actions (Only if NOT a voucher scan result) */}
                    {!scanning && !loading && customer && !voucher && updateStatus !== "success" && (
                        <motion.div
                            key="profile"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100"
                        >
                            {/* Improved Profile Header */}
                            <div className="relative bg-gradient-to-b from-primary/10 to-transparent p-6 pb-0 flex flex-col items-center">
                                {/* Avatar */}
                                <div className="relative">
                                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg bg-white">
                                        <img
                                            src={getAvatarUrl(customer.email)}
                                            alt="Avatar"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                                        <CheckCircle2 className="w-4 h-4 text-white" />
                                    </div>
                                </div>

                                <div className="text-center mt-3 mb-4">
                                    <h2 className="text-2xl font-extrabold text-gray-900 leading-tight">
                                        {customer.first_name} {customer.last_name}
                                    </h2>
                                    <p className="text-gray-500 text-sm">{customer.email}</p>
                                </div>

                                {/* WARNINGS SECTION */}
                                {warnings.length > 0 && (
                                    <div className="flex flex-wrap gap-2 justify-center mb-6">
                                        {warnings.map((w, i) => (
                                            <div key={i} className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs font-bold text-amber-700">
                                                <AlertCircle className="w-3.5 h-3.5" />
                                                {w}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Points Badge */}
                                <div className="flex gap-4 w-full justify-center">
                                    <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 text-center min-w-[120px]">
                                        <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">SALDO</div>
                                        <div className="text-3xl font-black text-primary">{customer.total_points}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Tabbed Actions */}
                            <div className="p-6">
                                <Tabs value={tabValue} onValueChange={setTabValue} className="w-full">
                                    <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 mb-6 rounded-xl h-auto">
                                        <TabsTrigger value="add" className="rounded-lg py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">Aggiungi</TabsTrigger>
                                        <TabsTrigger value="redeem" className="rounded-lg py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-sm">Riscatta</TabsTrigger>
                                        <TabsTrigger value="voucher" className="rounded-lg py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-sm">Voucher</TabsTrigger>
                                    </TabsList>

                                    {/* ADD POINTS TAB */}
                                    <TabsContent value="add" className="space-y-4 focus:outline-none">
                                        <div className="text-center mb-4">
                                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-2">
                                                <PlusCircle className="w-6 h-6" />
                                            </div>
                                            <h3 className="font-bold text-gray-900">Aggiungi Punti</h3>
                                            <p className="text-xs text-gray-500">Per acquisti in negozio</p>
                                        </div>

                                        <div className="flex gap-2">
                                            <Input
                                                type="number"
                                                placeholder="Quantità"
                                                className="h-14 text-lg text-center font-bold tracking-widest rounded-xl border-gray-200 focus:border-primary focus:ring-primary/20"
                                                value={pointsToAdd}
                                                onChange={(e) => setPointsToAdd(e.target.value)}
                                                autoFocus
                                            />
                                        </div>
                                        <div className="grid grid-cols-4 gap-2">
                                            {[10, 20, 50, 100].map((val) => (
                                                <button key={val} onClick={() => setPointsToAdd(val.toString())} className="py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-xs font-bold text-gray-600 border border-transparent hover:border-gray-200 transition-all">+{val}</button>
                                            ))}
                                        </div>
                                        <Button
                                            size="lg"
                                            className="w-full h-14 rounded-xl font-bold bg-primary hover:bg-primary/90 mt-2 shadow-lg shadow-primary/25"
                                            onClick={() => handleUpdatePoints('add')}
                                            disabled={updateStatus === 'updating'}
                                        >
                                            {updateStatus === 'updating' ? <Loader2 className="animate-spin" /> : "Conferma Aggiunta"}
                                        </Button>
                                    </TabsContent>

                                    {/* REDEEM / DEDUCT TAB */}
                                    <TabsContent value="redeem" className="space-y-4 focus:outline-none">
                                        <div className="text-center mb-4">
                                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-600 mb-2">
                                                <MinusCircle className="w-6 h-6" />
                                            </div>
                                            <h3 className="font-bold text-gray-900">Riscatta Punti</h3>
                                            <p className="text-xs text-gray-500">Scala punti dal saldo</p>
                                        </div>

                                        <Input
                                            type="number"
                                            placeholder="Quantità da scalare"
                                            className="h-14 text-lg text-center font-bold tracking-widest rounded-xl border-red-200 focus:border-red-500 focus:ring-red-500/20 text-red-600 placeholder:text-red-200"
                                            value={pointsToDeduct}
                                            onChange={(e) => setPointsToDeduct(e.target.value)}
                                        />
                                        <Button
                                            size="lg"
                                            className="w-full h-14 rounded-xl font-bold bg-red-600 hover:bg-red-700 mt-2 shadow-lg shadow-red-600/20"
                                            onClick={() => handleUpdatePoints('deduct')}
                                            disabled={updateStatus === 'updating'}
                                        >
                                            {updateStatus === 'updating' ? <Loader2 className="animate-spin" /> : "Conferma Riscatto"}
                                        </Button>
                                    </TabsContent>

                                    {/* CREATE VOUCHER TAB */}
                                    <TabsContent value="voucher" className="space-y-4 focus:outline-none">
                                        <div className="text-center mb-4">
                                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 text-purple-600 mb-2">
                                                <Gift className="w-6 h-6" />
                                            </div>
                                            <h3 className="font-bold text-gray-900">Crea Voucher</h3>
                                            <p className="text-xs text-gray-500">Converti punti in premio</p>
                                        </div>

                                        <div className="p-4 bg-purple-50 rounded-xl border border-purple-100 text-center">
                                            <p className="text-sm text-purple-800 mb-4 font-medium">Seleziona un'offerta:</p>

                                            <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                                {/* Hardcoded defaults if no offers fetched */}
                                                {!offers.length && (
                                                    <>
                                                        <Button variant="outline" className={`w-full justify-between h-auto py-3 border-purple-200 hover:bg-purple-100 hover:text-purple-900 ${customer.total_points < 500 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                            onClick={() => handleCreateVoucher({ title: 'Sconto €5' }, 500)}
                                                            disabled={customer.total_points < 500 || updateStatus === 'updating'}
                                                        >
                                                            <span>Sconto €5</span>
                                                            <div className="flex items-center gap-1">
                                                                <span className="font-bold text-purple-600">500 Pt</span>
                                                                {customer.total_points < 500 && <Lock className="w-4 h-4 text-gray-400" />}
                                                            </div>
                                                        </Button>
                                                        <Button variant="outline" className={`w-full justify-between h-auto py-3 border-purple-200 hover:bg-purple-100 hover:text-purple-900 ${customer.total_points < 1000 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                            onClick={() => handleCreateVoucher({ title: 'Sconto €10' }, 1000)}
                                                            disabled={customer.total_points < 1000 || updateStatus === 'updating'}
                                                        >
                                                            <span>Sconto €10</span>
                                                            <div className="flex items-center gap-1">
                                                                <span className="font-bold text-purple-600">1000 Pt</span>
                                                                {customer.total_points < 1000 && <Lock className="w-4 h-4 text-gray-400" />}
                                                            </div>
                                                        </Button>
                                                    </>
                                                )}

                                                {/* Dynamic Offers from API (Assuming fetched offers don't match hardcoded placeholders, or purely dynamic) */}
                                                {offers.map(offer => {
                                                    // Determine cost. If not present, fallback to 500 for demo, or don't show.
                                                    // Since we don't know the schema, we assume offer.points_cost or fallback to 500
                                                    const cost = offer.points_cost || 500;
                                                    const title = typeof offer.title === 'string' ? offer.title : (offer.title.it || offer.title.en || 'Offerta Speciale');

                                                    return (
                                                        <Button
                                                            key={offer.id}
                                                            variant="outline"
                                                            className={`w-full justify-between h-auto py-3 border-purple-200 hover:bg-purple-100 hover:text-purple-900 ${customer.total_points < cost ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                            onClick={() => handleCreateVoucher(offer, cost)}
                                                            disabled={customer.total_points < cost || updateStatus === 'updating'}
                                                        >
                                                            <span className="truncate max-w-[150px]">{title}</span>
                                                            <div className="flex items-center gap-1">
                                                                <span className="font-bold text-purple-600">{cost} Pt</span>
                                                                {customer.total_points < cost && <Lock className="w-4 h-4 text-gray-400" />}
                                                            </div>
                                                        </Button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </TabsContent>
                                </Tabs>

                                <Button variant="ghost" className="w-full mt-6 h-12 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-50" onClick={resetScanner}>
                                    Annulla Operazione
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* 4. Success State */}
                    {updateStatus === "success" && (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-green-100 p-8 text-center space-y-6"
                        >
                            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                                <CheckCircle2 className="w-12 h-12 text-green-600" />
                            </div>

                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">Operazione Completata!</h2>
                                <p className="text-gray-500">
                                    {voucher ? "Il voucher è stato riscattato con successo." : "Voucher creato o saldo aggiornato."}
                                </p>
                            </div>

                            {customer && !voucher && (
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mt-4">
                                    <div className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Nuovo Saldo</div>
                                    <div className="text-2xl font-black text-gray-900">
                                        {/* This is a visual estimate, real data comes from DB next fetch */}
                                        {customer.total_points}
                                    </div>
                                </div>
                            )}

                            <Button
                                size="lg"
                                className="w-full h-14 text-lg font-bold rounded-xl bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/20 mt-4"
                                onClick={resetScanner}
                            >
                                Prossimo
                            </Button>
                            <p className="text-xs text-center text-gray-400">Chiusura automatica in 5s...</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
