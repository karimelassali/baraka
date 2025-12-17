import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Shield, Trash2, Edit2 } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import AdminModal from './AdminModal';

import { createClient } from '@/lib/supabase/client';
import { getAvatarUrl } from '@/lib/avatar';

export default function AdminManagement() {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentUser, setCurrentUser] = useState(null);

    const fetchAdmins = async () => {
        try {
            const response = await fetch('/api/admin/admins');
            if (response.ok) {
                const data = await response.json();
                setAdmins(data);
            }
        } catch (error) {
            console.error('Failed to fetch admins:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchCurrentUser = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: adminData } = await supabase
                    .from('admin_users')
                    .select('*')
                    .eq('auth_id', user.id)
                    .single();
                setCurrentUser(adminData);
            }
        };

        fetchAdmins();
        fetchCurrentUser();
    }, []);

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this admin? This action cannot be undone.')) return;

        try {
            const response = await fetch(`/api/admin/admins/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setAdmins(prev => prev.filter(admin => admin.id !== id));
            } else {
                alert('Failed to delete admin');
            }
        } catch (error) {
            console.error('Error deleting admin:', error);
        }
    };

    const handleEdit = (admin) => {
        setSelectedAdmin(admin);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedAdmin(null);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedAdmin(null);
    };

    const handleSuccess = (data) => {
        if (selectedAdmin) {
            // Update existing admin
            setAdmins(prev => prev.map(admin =>
                admin.id === data.id ? data : admin
            ));
        } else {
            // Add new admin
            setAdmins(prev => [data, ...prev]);
        }
        handleModalClose();
    };

    const filteredAdmins = admins.filter(admin =>
        admin.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        admin.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search admins..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    Add New Admin
                </button>
            </div>

            <GlassCard className="overflow-hidden p-0">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/5">
                                <th className="text-left py-4 px-6 font-medium text-muted-foreground">Admin</th>
                                <th className="text-left py-4 px-6 font-medium text-muted-foreground">Role</th>
                                <th className="text-left py-4 px-6 font-medium text-muted-foreground">Permissions</th>
                                <th className="text-left py-4 px-6 font-medium text-muted-foreground">Status</th>
                                <th className="text-left py-4 px-6 font-medium text-muted-foreground">Joined</th>
                                <th className="text-right py-4 px-6 font-medium text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [...Array(3)].map((_, i) => (
                                    <tr key={i} className="border-b border-white/5">
                                        <td className="py-4 px-6"><div className="h-10 w-32 bg-white/5 rounded animate-pulse" /></td>
                                        <td className="py-4 px-6"><div className="h-6 w-20 bg-white/5 rounded animate-pulse" /></td>
                                        <td className="py-4 px-6"><div className="h-6 w-24 bg-white/5 rounded animate-pulse" /></td>
                                        <td className="py-4 px-6"><div className="h-6 w-16 bg-white/5 rounded animate-pulse" /></td>
                                        <td className="py-4 px-6"><div className="h-6 w-24 bg-white/5 rounded animate-pulse" /></td>
                                        <td className="py-4 px-6"><div className="h-8 w-8 bg-white/5 rounded-full animate-pulse ml-auto" /></td>
                                    </tr>
                                ))
                            ) : filteredAdmins.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-12 text-center text-muted-foreground">
                                        No admins found matching your search.
                                    </td>
                                </tr>
                            ) : (
                                filteredAdmins.map((admin) => (
                                    <tr key={admin.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden border border-primary/20">
                                                    <img
                                                        src={getAvatarUrl(admin.full_name)}
                                                        alt={admin.full_name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div>
                                                    <div className="font-medium">{admin.full_name}</div>
                                                    <div className="text-sm text-muted-foreground">{admin.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2">
                                                <Shield className="h-4 w-4 text-primary" />
                                                <span className="capitalize">{admin.role?.replace('_', ' ')}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="text-sm text-muted-foreground">
                                                {Array.isArray(admin.permissions) ? admin.permissions.length : 0} permissions
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${admin.is_active
                                                ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                                                : 'bg-red-500/10 text-red-500 border border-red-500/20'
                                                }`}>
                                                {admin.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-muted-foreground">
                                            {new Date(admin.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(admin)}
                                                    className="p-2 hover:bg-primary/10 text-muted-foreground hover:text-primary rounded-lg transition-colors"
                                                    title="Edit Admin"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(admin.id)}
                                                    className="p-2 hover:bg-red-500/10 text-muted-foreground hover:text-red-500 rounded-lg transition-colors"
                                                    title="Delete Admin"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </GlassCard>

            <AdminModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                admin={selectedAdmin}
                currentUser={currentUser}
                onSuccess={handleSuccess}
            />
        </div>
    );
}
