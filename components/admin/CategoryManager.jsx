// components/admin/CategoryManager.jsx
"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FolderTree,
    Plus,
    Search,
    Edit,
    Trash2,
    X,
    Package
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import GlassCard from '../ui/GlassCard';
import { CardHeader, CardTitle, CardContent } from '../ui/card';
import { useTranslations } from 'next-intl';

export default function CategoryManager() {
    const t = useTranslations('Admin.Inventory');
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        color: '#8B5CF6',
        icon: 'package'
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/inventory/categories');
            const data = await response.json();

            if (response.ok) {
                setCategories(data.categories || []);
            } else {
                console.error('Failed to fetch categories:', data.error);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (category = null) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                name: category.name,
                description: category.description || '',
                color: category.color || '#8B5CF6',
                icon: category.icon || 'package'
            });
        } else {
            setEditingCategory(null);
            setFormData({
                name: '',
                description: '',
                color: '#8B5CF6',
                icon: 'package'
            });
        }
        setShowModal(true);
        setError('');
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingCategory(null);
        setFormData({ name: '', description: '', color: '#8B5CF6', icon: 'package' });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.name.trim()) {
            setError(t('nameRequired'));
            return;
        }

        setSubmitting(true);

        try {
            const url = editingCategory
                ? `/api/admin/inventory/categories/${editingCategory.id}`
                : '/api/admin/inventory/categories';

            const method = editingCategory ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                await fetchCategories();
                handleCloseModal();
            } else {
                setError(data.error || 'Failed to save category');
            }
        } catch (error) {
            console.error('Error saving category:', error);
            setError('An error occurred while saving');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (category) => {
        if (!confirm(`${t('confirmDelete')} "${category.name}"? ${t('confirmDeleteMessage')}`)) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/inventory/categories/${category.id}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (response.ok) {
                await fetchCategories();
            } else {
                alert(data.error || 'Failed to delete category');
            }
        } catch (error) {
            console.error('Error deleting category:', error);
            alert('An error occurred while deleting');
        }
    };

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const colorOptions = [
        { value: '#8B5CF6', label: 'Viola' },
        { value: '#3B82F6', label: 'Blu' },
        { value: '#10B981', label: 'Verde' },
        { value: '#F59E0B', label: 'Arancione' },
        { value: '#EF4444', label: 'Rosso' },
        { value: '#EC4899', label: 'Rosa' },
        { value: '#6366F1', label: 'Indaco' }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <GlassCard>
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <FolderTree className="h-5 w-5 text-purple-500" />
                                {t('categories')}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                                {filteredCategories.length} {t('total').toLowerCase()}
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                <Input
                                    placeholder={t('searchCategories')}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 min-w-[250px]"
                                />
                            </div>

                            <Button
                                onClick={() => handleOpenModal()}
                                className="bg-red-600 hover:bg-red-700 text-white shadow-lg"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                {t('addCategory')}
                            </Button>
                        </div>
                    </div>
                </CardHeader>
            </GlassCard>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                    [...Array(6)].map((_, i) => (
                        <div key={i} className="h-32 bg-muted/50 rounded-xl animate-pulse" />
                    ))
                ) : filteredCategories.length > 0 ? (
                    filteredCategories.map((category, index) => (
                        <motion.div
                            key={category.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <GlassCard className="group hover:shadow-lg transition-all">
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div
                                            className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md"
                                            style={{ backgroundColor: category.color + '20', borderColor: category.color + '40' }}
                                        >
                                            <Package className="h-6 w-6" style={{ color: category.color }} />
                                        </div>

                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleOpenModal(category)}
                                                className="p-1.5 hover:bg-accent rounded-lg transition-colors"
                                            >
                                                <Edit className="h-4 w-4 text-muted-foreground" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(category)}
                                                className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </button>
                                        </div>
                                    </div>

                                    <h3 className="font-semibold text-lg mb-1">{category.name}</h3>
                                    {category.description && (
                                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                            {category.description}
                                        </p>
                                    )}

                                    <Badge variant="outline" className="bg-muted">
                                        {category.product_count || 0} {t('productCount').toLowerCase()}
                                    </Badge>
                                </CardContent>
                            </GlassCard>
                        </motion.div>
                    ))
                ) : (
                    <div className="col-span-full flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <FolderTree className="h-16 w-16 mb-4 opacity-20" />
                        <p className="text-lg font-medium mb-2">{t('noCategoriesFound')}</p>
                        <p className="text-sm">{t('createFirstCategory')}</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div
                            className="bg-card rounded-xl shadow-2xl w-full max-w-md"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                        >
                            <GlassCard className="border-0 shadow-none">
                                <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/50">
                                    <CardTitle>
                                        {editingCategory ? t('editCategory') : t('addCategory')}
                                    </CardTitle>
                                    <Button variant="ghost" size="icon" onClick={handleCloseModal}>
                                        <X className="h-5 w-5" />
                                    </Button>
                                </CardHeader>

                                <CardContent className="p-6">
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        {error && (
                                            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-600 text-sm">
                                                {error}
                                            </div>
                                        )}

                                        <div>
                                            <label className="block text-sm font-medium mb-2">{t('categoryName')}</label>
                                            <Input
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                placeholder={t('categoryName')}
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">{t('categoryDescription')}</label>
                                            <textarea
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                placeholder={t('categoryDescription')}
                                                className="w-full min-h-[80px] px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">{t('categoryColor')}</label>
                                            <div className="grid grid-cols-7 gap-2">
                                                {colorOptions.map((color) => (
                                                    <button
                                                        key={color.value}
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, color: color.value })}
                                                        className={`w-10 h-10 rounded-lg border-2 transition-all ${formData.color === color.value
                                                            ? 'border-white shadow-lg scale-110'
                                                            : 'border-transparent hover:scale-105'
                                                            }`}
                                                        style={{ backgroundColor: color.value }}
                                                        title={color.label}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex gap-3 pt-4">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={handleCloseModal}
                                                className="flex-1"
                                            >
                                                {t('cancel')}
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={submitting}
                                                className="flex-1 bg-red-600 hover:bg-red-700 text-white shadow-lg"
                                            >
                                                {submitting ? t('loading') : t('save')}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </GlassCard>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
