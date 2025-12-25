"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import BarcodeScanner from "@/components/admin/BarcodeScanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner"; // Assuming you use sonner for toasts

export default function ScanPage() {
    const [scannedId, setScannedId] = useState(null);
    const [customer, setCustomer] = useState(null);
    const [pointsToAdd, setPointsToAdd] = useState("");
    const [loading, setLoading] = useState(false);
    const [scanning, setScanning] = useState(true);
    const [updateStatus, setUpdateStatus] = useState("idle"); // idle, updating, success

    const supabase = createClient();

    const handleScanSuccess = async (decodedText) => {
        console.log("Scanned ID:", decodedText);
        setScannedId(decodedText);
        setScanning(false); // Stop scanning UI
        setLoading(true);

        try {
            // 1. Fetch Customer Details
            // Handle BOTH old (full UUID) and new (12-char short) barcode formats
            let customerData = null;
            let customerError = null;

            console.log("Scanned value:", decodedText, "Length:", decodedText.length);

            // Check if it's a full UUID (contains dashes or is 36 chars)
            if (decodedText.includes('-') || decodedText.length >= 32) {
                // OLD FORMAT: Full UUID - exact match
                console.log("Trying exact UUID match...");
                const result = await supabase
                    .from("customers")
                    .select("id, first_name, last_name, email")
                    .eq("id", decodedText)
                    .single();
                customerData = result.data;
                customerError = result.error;
            }

            // If not found or it's the new short format, try prefix match
            if (!customerData) {
                // NEW FORMAT: First 12 chars without dashes, uppercase
                const scannedCode = decodedText.toLowerCase().replace(/-/g, '');

                // Construct UUID prefix: xxxxxxxx-xxxx
                const uuidPrefix = scannedCode.slice(0, 8) + '-' + scannedCode.slice(8, 12);

                console.log("Trying prefix match with:", uuidPrefix);

                // Use filter with text cast for UUID column
                const result = await supabase
                    .from("customers")
                    .select("id, first_name, last_name, email")
                    .filter('id', 'ilike', `${uuidPrefix}%`)
                    .limit(1);

                if (result.data && result.data.length > 0) {
                    customerData = result.data[0];
                } else {
                    customerError = result.error || { message: "No match found" };
                }
            }

            if (customerError || !customerData) {
                console.error("Customer fetch error:", customerError);
                toast.error(`Utente non trovato! (Scanned: ${decodedText})`);
                setScanning(true); // Restart scanning
                setLoading(false);
                return;
            }

            // 2. Fetch Current Points
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
            toast.error("Errore durante la ricerca utente.");
            setScanning(true);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePoints = async () => {
        if (!pointsToAdd || isNaN(pointsToAdd)) {
            toast.error("Inserisci un valore valido.");
            return;
        }

        setUpdateStatus("updating");
        const pointsValue = parseInt(pointsToAdd, 10);

        try {
            // Call existing Admin API
            // This handles DB update + Google Wallet Sync + Notification
            const response = await fetch(`/api/admin/customers/${customer.id}/points`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    points: pointsValue,
                    description: "Scanned at location", // Optional context
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to update points");
            }

            setUpdateStatus("success");
            toast.success(`Success! Added ${pointsValue} points.`);

        } catch (error) {
            console.error(error);
            toast.error("Errore durante l'aggiornamento.");
            setUpdateStatus("idle");
        }
    };

    const resetScanner = () => {
        setScannedId(null);
        setCustomer(null);
        setPointsToAdd("");
        setUpdateStatus("idle");
        setScanning(true);
    };

    return (
        <div className="p-6 max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold mb-4">Scanner Barcode</h1>

            {/* 1. Scanner View */}
            {scanning && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-center">Scannerizza Carta Fedeltà</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <BarcodeScanner
                            onScanSuccess={handleScanSuccess}
                            onScanFailure={(err) => console.log(err)}
                        />
                    </CardContent>
                </Card>
            )}

            {/* 2. Loading State */}
            {loading && (
                <div className="flex flex-col items-center justify-center p-12">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
                    <p className="mt-4 text-gray-500">Ricerca cliente in corso...</p>
                </div>
            )}

            {/* 3. Customer Found & Action */}
            {!scanning && !loading && customer && updateStatus !== "success" && (
                <Card className="border-blue-500 border-2 shadow-lg">
                    <CardHeader className="bg-blue-50">
                        <CardTitle className="text-blue-700">Cliente Trovato!</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        <div className="text-center space-y-2">
                            <h2 className="text-3xl font-bold">{customer.first_name} {customer.last_name}</h2>
                            <p className="text-gray-500">{customer.email}</p>
                            <div className="inline-block bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full font-bold text-lg mt-2">
                                Punti Attuali: {customer.total_points}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                            <label className="block text-sm font-medium mb-2">Aggiungi Punti</label>
                            <div className="flex gap-2">
                                <Input
                                    type="number"
                                    placeholder="Es: 50"
                                    className="text-lg"
                                    value={pointsToAdd}
                                    onChange={(e) => setPointsToAdd(e.target.value)}
                                />
                                <Button
                                    size="lg"
                                    onClick={handleUpdatePoints}
                                    disabled={updateStatus === "updating"}
                                >
                                    {updateStatus === "updating" ? <Loader2 className="animate-spin" /> : "Conferma"}
                                </Button>
                            </div>
                        </div>
                        <Button variant="ghost" onClick={resetScanner} className="w-full mt-2">
                            Annulla / Scansiona Altro
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* 4. Success State */}
            {updateStatus === "success" && (
                <Card className="bg-green-50 border-green-200">
                    <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                        <CheckCircle2 className="w-24 h-24 text-green-500 mb-4" />
                        <h2 className="text-3xl font-bold text-green-700">Fatto!</h2>
                        <p className="text-green-600 mt-2 text-lg">
                            Aggiornamento completato con successo.<br />
                            Il saldo punti e il Wallet del cliente sono stati aggiornati.
                        </p>
                        <Button
                            size="lg"
                            className="mt-8 bg-green-600 hover:bg-green-700 text-white w-full max-w-xs"
                            onClick={resetScanner}
                        >
                            Scansiona Prossimo Cliente
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
