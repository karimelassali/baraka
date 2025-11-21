"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    User,
    Mail,
    Shield,
    Calendar,
    Save,
    Loader2,
    CheckCircle,
    Key
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import GlassCard from '../ui/GlassCard';
import { Badge } from '../ui/badge';
import { createClient } from '../../lib/supabase/client';

export default function AdminProfileModal({ isOpen, onClose, user, onUpdate }) {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        role: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [permissions, setPermissions] = useState([]);

    useEffect(() => {
        if (user) {
            setFormData({
                full_name: user.full_name || '',
                email: user.email || '',
                role: user.role || 'admin'
            });

            // Define permissions based on role
            const rolePermissions = {
                'super_admin': ['all_access', 'manage_admins', 'system_settings', 'delete_records'],
                'admin': ['view_dashboard', 'manage_customers', 'manage_inventory', 'manage_orders', 'view_reports'],
                'editor': ['view_dashboard', 'manage_inventory', 'manage_content'],
                'viewer': ['view_dashboard', 'view_reports']
            };

            setPermissions(rolePermissions[user.role] || rolePermissions['admin']);
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(false);

        try {
            const supabase = createClient();

            const { error } = await supabase
                .from('admin_users')
                .update({ full_name: formData.full_name })
                .eq('id', user.id);

            if (error) throw error;

            setSuccess(true);
            if (onUpdate) onUpdate({ ...user, full_name: formData.full_name });

            setTimeout(() => {
                setSuccess(false);
                onClose();
            }, 1500);
        } catch (error) {
            console.error('Error updating profile:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg"
            >
                <GlassCard className="overflow-hidden border-0 shadow-2xl">
                    <div className="relative h-32 bg-gradient-to-r from-red-600 to-red-800">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                        <div className="absolute -bottom-12 left-8">
                            <div className="w-24 h-24 rounded-full bg-background border-4 border-background flex items-center justify-center shadow-lg">
                                <span className="text-3xl font-bold text-red-600">
                                    {formData.full_name.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-16 px-8 pb-8">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-bold">{formData.full_name}</h2>
                                <p className="text-muted-foreground flex items-center gap-2">
                                    <Mail className="h-4 w-4" /> {formData.email}
                                </p>
                            </div>
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 px-3 py-1">
                                {formData.role.toUpperCase()}
                            </Badge>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium mb-1.5 block">Nome Completo</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            value={formData.full_name}
                                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                            className="pl-10"
                                            placeholder="Il tuo nome"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-1.5 block">Email (Sola lettura)</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            value={formData.email}
                                            disabled
                                            className="pl-10 bg-muted/50"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
                                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                    <Shield className="h-4 w-4 text-red-600" />
                                    Permessi e Accessi
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {permissions.map((perm) => (
                                        <Badge key={perm} variant="secondary" className="text-xs bg-background/80 hover:bg-background">
                                            <Key className="h-3 w-3 mr-1 text-muted-foreground" />
                                            {perm.replace(/_/g, ' ')}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    Membro dal {new Date(user?.created_at || Date.now()).toLocaleDateString('it-IT')}
                                </div>
                                <Button
                                    type="submit"
                                    disabled={loading || success}
                                    className="bg-red-600 hover:bg-red-700 text-white min-w-[120px]"
                                >
                                    {loading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : success ? (
                                        <>
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Salvato
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4 mr-2" />
                                            Salva Modifiche
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </GlassCard>
            </motion.div>
        </div>
    );
}
