import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, User, Mail, Phone, Check, Key, AlertCircle } from 'lucide-react';

const ROLES = [
    {
        id: 'super_admin',
        label: 'Super Admin',
        description: 'Full system access',
        icon: '👑',
        color: 'from-red-500 to-rose-600'
    },
    {
        id: 'manager',
        label: 'Manager',
        description: 'Manage content & users',
        icon: '⚡',
        color: 'from-blue-500 to-cyan-600'
    },
    {
        id: 'viewer',
        label: 'Viewer',
        description: 'Read-only access',
        icon: '👁️',
        color: 'from-green-500 to-emerald-600'
    },
    {
        id: 'custom',
        label: 'Custom',
        description: 'Choose permissions',
        icon: '⚙️',
        color: 'from-purple-500 to-indigo-600'
    }
];

const PERMISSIONS = [
    { id: 'view_dashboard', label: 'Dashboard' },
    { id: 'view_analytics', label: 'Analytics' },
    { id: 'view_revenue', label: 'Revenue' },
    { id: 'view_board', label: 'Board' },
    { id: 'manage_orders', label: 'Orders' },
    { id: 'manage_customers', label: 'Customers' },
    { id: 'manage_payments', label: 'Payments' },
    { id: 'manage_points', label: 'Points' },
    { id: 'manage_wishlist', label: 'Wishlist' },
    { id: 'manage_reviews', label: 'Reviews' },
    { id: 'manage_inventory', label: 'Inventory' },
    { id: 'manage_offers', label: 'Offers' },
    { id: 'manage_campaigns', label: 'Campaigns' },
    { id: 'manage_vouchers', label: 'Vouchers' },
    { id: 'manage_gallery', label: 'Gallery' },
    { id: 'manage_admins', label: 'Admins' },   
    { id: 'view_logs', label: 'Logs' },
    { id: 'manage_settings', label: 'Settings' }
];

export default function AdminModal({
    isOpen,
    onClose,
    onSuccess,
    admin = null, // If null, create mode; if set, edit mode
    currentUser = null,
    mode = admin ? 'edit' : 'create'
}) {
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

    const isEditMode = mode === 'edit' || admin !== null;
    const canManageAdmins = currentUser?.role === 'super_admin' ||
        (currentUser?.permissions && currentUser.permissions.includes('manage_admins'));

    // Populate form data when admin prop changes (edit mode)
    useEffect(() => {
        if (admin) {
            setFormData({
                fullName: admin.full_name || '',
                email: admin.email || '',
                phone: admin.phone || '',
                password: '',
                role: admin.role || 'manager',
                permissions: Array.isArray(admin.permissions) ? admin.permissions : []
            });
        } else {
            setFormData({
                fullName: '',
                email: '',
                phone: '',
                password: '',
                role: 'manager',
                permissions: []
            });
        }
    }, [admin]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRoleChange = (roleId) => {
        if (!canManageAdmins) return; // Prevent change if not allowed

        let newPermissions = [];
        if (roleId === 'super_admin') {
            newPermissions = PERMISSIONS.map(p => p.id);
        } else if (roleId === 'manager') {
            // Manager gets everything except managing admins and settings
            newPermissions = PERMISSIONS
                .filter(p => !['manage_admins', 'manage_settings'].includes(p.id))
                .map(p => p.id);
        } else if (roleId === 'viewer') {
            // Viewer gets all view_* permissions
            newPermissions = PERMISSIONS
                .filter(p => p.id.startsWith('view_'))
                .map(p => p.id);
        }

        setFormData(prev => ({
            ...prev,
            role: roleId,
            permissions: roleId === 'custom' ? prev.permissions : newPermissions
        }));
    };

    const togglePermission = (permissionId) => {
        if (!canManageAdmins) return; // Prevent change if not allowed
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
            const url = isEditMode ? `/api/admin/admins/${admin.id}` : '/api/admin/admins';
            const method = isEditMode ? 'PATCH' : 'POST';

            // Filter out role and permissions if user cannot manage admins
            const payload = { ...formData };
            if (!canManageAdmins) {
                delete payload.role;
                delete payload.permissions;
            }

            // Handle empty phone
            if (payload.phone === '') {
                payload.phone = null;
            }

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `Failed to ${isEditMode ? 'update' : 'create'} admin`);
            }

            onSuccess(data);
            onClose();

            // Reset form if creating
            if (!isEditMode) {
                setFormData({
                    fullName: '',
                    email: '',
                    phone: '',
                    password: '',
                    role: 'manager',
                    permissions: []
                });
            }
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
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                    className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="relative p-6">
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-gray-900"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        {/* Header */}
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-1">
                                {isEditMode ? 'Edit Admin User' : 'Create New Admin'}
                            </h2>
                            <p className="text-sm text-gray-600">
                                {isEditMode ? 'Update role and permissions' : 'Add a new administrator to the system'}
                            </p>
                        </div>

                        {/* Error Alert */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2"
                                >
                                    <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                                    <p className="text-sm text-red-700 flex-1">{error}</p>
                                    <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
                                        <X className="h-4 w-4" />
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Basic Info */}
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            <User className="inline h-4 w-4 mr-1 text-primary" />
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary focus:bg-white transition-all"
                                            placeholder="John Doe"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            <Mail className="inline h-4 w-4 mr-1 text-primary" />
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            disabled={isEditMode}
                                            required={!isEditMode}
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100"
                                            placeholder="john@example.com"
                                        />
                                        {isEditMode && <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            <Phone className="inline h-4 w-4 mr-1 text-primary" />
                                            Phone <span className="text-gray-500 text-xs">(Optional)</span>
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary focus:bg-white transition-all"
                                            placeholder="+1 234 567 890"
                                        />
                                    </div>

                                    {!isEditMode && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                                <Key className="inline h-4 w-4 mr-1 text-primary" />
                                                Password
                                            </label>
                                            <input
                                                type="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                required
                                                minLength={6}
                                                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary focus:bg-white transition-all"
                                                placeholder="Min. 6 characters"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Role Selection */}
                            <div className={`space-y-3 ${!canManageAdmins ? 'opacity-50 pointer-events-none' : ''}`}>
                                <div className="flex items-center justify-between">
                                    <label className="block text-sm font-medium text-gray-700">
                                        <Shield className="inline h-4 w-4 mr-1 text-primary" />
                                        Role
                                    </label>
                                    {!canManageAdmins && (
                                        <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-200">
                                            Only Super Admins can change roles
                                        </span>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {ROLES.map((role) => (
                                        <button
                                            key={role.id}
                                            type="button"
                                            onClick={() => handleRoleChange(role.id)}
                                            className={`relative p-3 rounded-lg border text-left transition-all ${formData.role === role.id
                                                ? 'border-primary bg-primary/5 shadow-sm'
                                                : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className="flex items-start gap-2">
                                                <span className="text-2xl">{role.icon}</span>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-semibold text-gray-900 text-sm mb-0.5">{role.label}</div>
                                                    <div className="text-xs text-gray-600 truncate">{role.description}</div>
                                                </div>
                                                {formData.role === role.id && (
                                                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Permissions */}
                            <div className={`space-y-3 ${!canManageAdmins ? 'opacity-50 pointer-events-none' : ''}`}>
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-gray-700">
                                        Permissions
                                    </label>
                                    <span className="text-xs text-gray-500">
                                        {formData.role === 'custom' ? 'Click to toggle' : 'Auto-assigned'}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {PERMISSIONS.map((permission) => (
                                        <button
                                            key={permission.id}
                                            type="button"
                                            onClick={() => togglePermission(permission.id)}
                                            disabled={formData.role !== 'custom'}
                                            className={`p-2.5 rounded-lg border text-left transition-all text-sm ${formData.role !== 'custom'
                                                ? 'opacity-50 cursor-not-allowed'
                                                : 'cursor-pointer hover:border-primary/50'
                                                } ${formData.permissions.includes(permission.id)
                                                    ? 'bg-primary/5 border-primary text-gray-900'
                                                    : 'bg-gray-50 border-gray-200 text-gray-600'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className={`w-4 h-4 rounded border flex items-center justify-center ${formData.permissions.includes(permission.id)
                                                    ? 'bg-primary border-primary'
                                                    : 'border-gray-300 bg-white'
                                                    }`}>
                                                    {formData.permissions.includes(permission.id) && (
                                                        <Check className="w-3 h-3 text-white" />
                                                    )}
                                                </div>
                                                <span className="font-medium">{permission.label}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2 bg-gradient-to-r from-primary to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-primary/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            {isEditMode ? 'Updating...' : 'Creating...'}
                                        </>
                                    ) : (
                                        <>
                                            <Shield className="h-4 w-4" />
                                            {isEditMode ? 'Update Admin' : 'Create Admin'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
