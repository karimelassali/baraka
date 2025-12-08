"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, MapPin, Truck, Loader2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import GlassCard from '@/components/ui/GlassCard';
import { toast } from 'sonner';

export default function EidSettings() {
    const [suppliers, setSuppliers] = useState([]);
    const [destinations, setDestinations] = useState([]);
    const [loading, setLoading] = useState(true);

    const [newSupplier, setNewSupplier] = useState('');
    const [newSupplierContact, setNewSupplierContact] = useState('');

    const [newDestination, setNewDestination] = useState('');
    const [newDestinationLocation, setNewDestinationLocation] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [supRes, destRes] = await Promise.all([
                fetch('/api/admin/eid/settings?type=suppliers'),
                fetch('/api/admin/eid/settings?type=destinations')
            ]);

            if (supRes.ok) setSuppliers(await supRes.json());
            if (destRes.ok) setDestinations(await destRes.json());
        } catch (error) {
            console.error('Error fetching settings:', error);
            toast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleAddSupplier = async () => {
        if (!newSupplier) return;
        try {
            const res = await fetch('/api/admin/eid/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'suppliers',
                    name: newSupplier,
                    extra: newSupplierContact
                })
            });

            if (res.ok) {
                toast.success('Supplier added');
                setNewSupplier('');
                setNewSupplierContact('');
                fetchData();
            } else {
                toast.error('Failed to add supplier');
            }
        } catch (error) {
            toast.error('Error adding supplier');
        }
    };

    const handleAddDestination = async () => {
        if (!newDestination) return;
        try {
            const res = await fetch('/api/admin/eid/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'destinations',
                    name: newDestination,
                    extra: newDestinationLocation
                })
            });

            if (res.ok) {
                toast.success('Destination added');
                setNewDestination('');
                setNewDestinationLocation('');
                fetchData();
            } else {
                toast.error('Failed to add destination');
            }
        } catch (error) {
            toast.error('Error adding destination');
        }
    };

    const handleDelete = async (type, id) => {
        if (!confirm('Are you sure?')) return;
        try {
            const res = await fetch(`/api/admin/eid/settings?type=${type}&id=${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                toast.success('Item deleted');
                fetchData();
            } else {
                toast.error('Failed to delete');
            }
        } catch (error) {
            toast.error('Error deleting item');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-red-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
                <Settings className="h-6 w-6 text-red-700" />
                <h2 className="text-xl font-semibold text-red-700">Settings & Configuration</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Suppliers Section */}
                <GlassCard className="p-6 border-t-4 border-t-blue-500">
                    <div className="flex items-center gap-2 mb-4">
                        <Truck className="h-5 w-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-blue-900">Suppliers</h3>
                    </div>

                    <div className="space-y-4 mb-6">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Supplier Name"
                                value={newSupplier}
                                onChange={(e) => setNewSupplier(e.target.value)}
                            />
                            <Input
                                placeholder="Contact Info (Optional)"
                                value={newSupplierContact}
                                onChange={(e) => setNewSupplierContact(e.target.value)}
                            />
                            <Button onClick={handleAddSupplier} className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                        {suppliers.map(sup => (
                            <div key={sup.id} className="flex justify-between items-center p-3 bg-white rounded-lg border hover:shadow-sm transition-shadow">
                                <div>
                                    <div className="font-medium">{sup.name}</div>
                                    {sup.contact_info && <div className="text-xs text-muted-foreground">{sup.contact_info}</div>}
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => handleDelete('suppliers', sup.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        {suppliers.length === 0 && (
                            <div className="text-center text-muted-foreground text-sm py-4">No suppliers added yet</div>
                        )}
                    </div>
                </GlassCard>

                {/* Destinations Section */}
                <GlassCard className="p-6 border-t-4 border-t-purple-500">
                    <div className="flex items-center gap-2 mb-4">
                        <MapPin className="h-5 w-5 text-purple-600" />
                        <h3 className="text-lg font-semibold text-purple-900">Destinations</h3>
                    </div>

                    <div className="space-y-4 mb-6">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Destination Name"
                                value={newDestination}
                                onChange={(e) => setNewDestination(e.target.value)}
                            />
                            <Input
                                placeholder="Location/Details (Optional)"
                                value={newDestinationLocation}
                                onChange={(e) => setNewDestinationLocation(e.target.value)}
                            />
                            <Button onClick={handleAddDestination} className="bg-purple-600 hover:bg-purple-700">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                        {destinations.map(dest => (
                            <div key={dest.id} className="flex justify-between items-center p-3 bg-white rounded-lg border hover:shadow-sm transition-shadow">
                                <div>
                                    <div className="font-medium">{dest.name}</div>
                                    {dest.location && <div className="text-xs text-muted-foreground">{dest.location}</div>}
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => handleDelete('destinations', dest.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        {destinations.length === 0 && (
                            <div className="text-center text-muted-foreground text-sm py-4">No destinations added yet</div>
                        )}
                    </div>
                </GlassCard>
            </div>
        </div>
    );
}
