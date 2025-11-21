import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, User, Mail, Phone, Check, Key, AlertCircle, Gift, MessageCircle, Ticket, LayoutDashboard, FileText } from 'lucide-react';
import GlassCard from '../ui/GlassCard';

const ROLES = [
    {
        id: 'super_admin',
        name: 'Super Admin',
        description: 'Full access to all features and settings',
        color: 'from-red-500 to-pink-500',
        iconBg: 'bg-red-500/10',
        iconColor: 'text-red-500'
    },
    {
        id: 'manager',
        name: 'Manager',
        description: 'Can manage users, offers, and reviews',
        color: 'from-blue-500 to-cyan-500',
        iconBg: 'bg-blue-500/10',
        iconColor: 'text-blue-500'
    },
    {
        id: 'viewer',
        name: 'Viewer',
        description: 'Read-only access to dashboard and reports',
        color: 'from-green-500 to-emerald-500',
        iconBg: 'bg-green-500/10',
        iconColor: 'text-green-500'
    },
    {
        id: 'custom',
        name: 'Custom',
        description: 'Select specific permissions',
        color: 'from-purple-500 to-indigo-500',
        iconBg: 'bg-purple-500/10',
        iconColor: 'text-purple-500'
    }
];

const PERMISSIONS = [
    { id: 'manage_admins', label: 'Manage Admins' },
    { id: 'manage_users', label: 'Manage Users' },
    { id: 'manage_offers', label: 'Manage Offers' },
    { id: 'manage_reviews', label: 'Manage Reviews' },
    { id: 'manage_vouchers', label: 'Manage Vouchers' },
    { id: 'view_dashboard', label: 'View Dashboard' },
    { id: 'view_reports', label: 'View Reports' }
];

export default function CreateAdminModal({ isOpen, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        role: 'manager',
        permissions: []
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRoleChange = (roleId) => {
        let newPermissions = [];
        if (roleId === 'super_admin') {
            newPermissions = PERMISSIONS.map(p => p.id);
        } else if (roleId === 'manager') {
            newPermissions = ['manage_users', 'manage_offers', 'manage_reviews', 'manage_vouchers', 'view_dashboard'];
        } else if (roleId === 'viewer') {
            newPermissions = ['view_dashboard', 'view_reports'];
        }

        setFormData(prev => ({
            ...prev,
            role: roleId,
            permissions: roleId === 'custom' ? prev.permissions : newPermissions
        }));
    };

    const togglePermission = (permissionId) => {
        if (formData.role !== 'custom') return;

        setFormData(prev => {
            const permissions = prev.permissions.includes(permissionId)
                ? prev.permissions.filter(p => p !== permissionId)
                : [...prev.permissions, permissionId];
            return { ...prev, permissions };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/admin/admins', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create admin');
            }

            onSuccess(data);
            onClose();
            setFormData({
                fullName: '',
                email: '',
                phone: '',
                password: '',
                role: 'manager',
                permissions: []
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="w-full max-w-3xl max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    <GlassCard className="relative p-8">
                        {/* Close Button */}
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-xl transition-colors z-10"
                        >
                            <X className="h-5 w-5" />
                        </motion.button>

                        {/* Header */}
                        <div className="mb-8">
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <h2 className="text-3xl font-bold text-foreground mb-2">
                                    Create New Admin
                                </h2>
                                <p className="text-foreground/70">Add a new administrator and assign their role and permissions.</p>
                            </motion.div>
                        </div>

                        {/* Error Alert */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10, height: 0 }}
                                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                                    exit={{ opacity: 0, y: -10, height: 0 }}
                                    className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3"
                                >
                                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-red-500 font-medium text-sm">{error}</p>
                                    </div>
                                    <button onClick={() => setError(null)} className="text-red-500 hover:text-red-400">
                                        <X className="h-4 w-4" />
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Basic Information */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="space-y-6"
                            >
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <div className="h-8 w-1 bg-gradient-to-b from-primary to-purple-500 rounded-full" />
                                    Basic Information
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                            <User className="h-4 w-4 text-primary" />
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all placeholder:text-foreground/40"
                                            placeholder="John Doe"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-primary" />
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all placeholder:text-foreground/40"
                                            placeholder="john@example.com"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-primary" />
                                            Phone Number <span className="text-foreground/50 text-xs">(Optional)</span>
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all placeholder:text-foreground/40"
                                            placeholder="+1 234 567 890"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                            <Key className="h-4 w-4 text-primary" />
                                            Password
                                        </label>
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                            minLength={6}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all placeholder:text-foreground/40"
                                            placeholder="Min. 6 characters"
                                        />
                                    </div>
                                </div>
                            </motion.div>

                            {/* Role Selection */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="space-y-4"
                            >
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <div className="h-8 w-1 bg-gradient-to-b from-primary to-purple-500 rounded-full" />
                                    Role Assignment
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {ROLES.map((role, index) => (
                                        <motion.button
                                            key={role.id}
                                            type="button"
                                            onClick={() => handleRoleChange(role.id)}
                                            whileHover={{ scale: 1.02, y: -2 }}
                                            whileTap={{ scale: 0.98 }}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 + index * 0.05 }}
                                            className={`relative p-5 rounded-xl border text-left transition-all overflow-hidden ${formData.role === role.id
                                                ? 'border-primary shadow-lg shadow-primary/20'
                                                : 'border-white/10 hover:border-white/20'
                                                }`}
                                        >
                                            {formData.role === role.id && (
                                                <motion.div
                                                    layoutId="roleSelector"
                                                    className={`absolute inset-0 bg-gradient-to-br ${role.color} opacity-10`}
                                                    transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                                                />
                                            )}

                                            <div className="relative flex items-start gap-3">
                                                <div className={`p-2 rounded-lg ${role.iconBg} mt-0.5`}>
                                                    <Shield className={`h-4 w-4 ${role.iconColor}`} />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-bold text-foreground mb-1">{role.name}</div>
                                                    <div className="text-xs text-foreground/60 leading-relaxed">{role.description}</div>
                                                </div>
                                                {formData.role === role.id && (
                                                    <motion.div
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        className="absolute top-3 right-3"
                                                    >
                                                        <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                                                            <Check className="h-3 w-3 text-white" />
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </div>
                                        </motion.button>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Permissions */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="space-y-4"
                            >
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                                        <div className="h-8 w-1 bg-primary rounded-full" />
                                        Permissions
                                    </h3>
                                    <span className="text-xs font-medium text-foreground/60">
                                        {formData.role === 'custom' ? 'Click to toggle' : 'View only'}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {PERMISSIONS.map((permission, index) => (
                                        <motion.div
                                            key={permission.id}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.4 + index * 0.03 }}
                                            onClick={() => togglePermission(permission.id)}
                                            className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${formData.role === 'custom'
                                                ? 'cursor-pointer hover:border-primary/30 hover:bg-white/5'
                                                : 'opacity-60 cursor-not-allowed'
                                                } ${formData.permissions.includes(permission.id)
                                                    ? 'bg-primary/10 border-primary/40'
                                                    : 'bg-white/5 border-white/10'
                                                }`}
                                        >
                                            <div className={`flex-shrink-0 w-5 h-5 rounded-md border flex items-center justify-center transition-all ${formData.permissions.includes(permission.id)
                                                ? 'bg-primary border-primary'
                                                : 'border-white/30'
                                                }`}>
                                                {formData.permissions.includes(permission.id) && (
                                                    <motion.div
                                                        initial={{ scale: 0, rotate: -180 }}
                                                        animate={{ scale: 1, rotate: 0 }}
                                                        transition={{ type: 'spring', damping: 15 }}
                                                    >
                                                        <Check className="w-3 h-3 text-white" />
                                                    </motion.div>
                                                )}
                                            </div>
                                            <span className="text-sm font-semibold text-foreground">{permission.label}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Action Buttons */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="flex justify-end gap-4 pt-6 border-t border-white/10"
                            >
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="button"
                                    onClick={onClose}
                                    className="px-6 py-3 rounded-xl hover:bg-white/10 transition-colors font-medium"
                                >
                                    Cancel
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={loading}
                                    className="px-8 py-3 bg-gradient-to-r from-primary to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-primary/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <Shield className="h-4 w-4" />
                                            Create Admin
                                        </>
                                    )}
                                </motion.button>
                            </motion.div>
                        </form>
                    </GlassCard>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
