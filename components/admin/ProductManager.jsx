// components/admin/ProductManager.jsx
"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Package,
    Plus,
    Search,
    Edit,
    Trash2,
    Calendar,
    AlertTriangle,
    CheckCircle,
    Filter
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import GlassCard from '../ui/GlassCard';
import { CardHeader, CardTitle, CardContent } from '../ui/card';
import { useTranslations } from 'next-intl';
import MultiStepProductForm from './MultiStepProductForm';

export default function ProductManager({ onProductChange }) {
    const t = useTranslations('Admin.Inventory');
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category_id: '',
        quantity: 0,
        unit: 'pcs',
        minimum_stock_level: 0,
        purchase_price: '',
        selling_price: '',
        currency: 'EUR',
        supplier_name: '',
        supplier_contact: '',
        sku: '',
        barcode: '',
        location_in_shop: '',
        expiration_date: '',
        batch_number: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, [categoryFilter]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            let url = '/api/admin/inventory/products?limit=100';
            if (categoryFilter) {
                url += `&category_id=${categoryFilter}`;
            }

            const response = await fetch(url);
            const data = await response.json();

            if (response.ok) {
                setProducts(data.products || []);
            } else {
                console.error('Failed to fetch products:', data.error);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/admin/inventory/categories');
            const data = await response.json();

            if (response.ok) {
                setCategories(data.categories || []);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleOpenModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name,
                description: product.description || '',
                category_id: product.category_id || '',
                quantity: product.quantity,
                unit: product.unit || 'pcs',
                minimum_stock_level: product.minimum_stock_level || 0,
                purchase_price: product.purchase_price || '',
                selling_price: product.selling_price || '',
                currency: product.currency || 'EUR',
                supplier_name: product.supplier_name || '',
                supplier_contact: product.supplier_contact || '',
                sku: product.sku || '',
                barcode: product.barcode || '',
                location_in_shop: product.location_in_shop || '',
                expiration_date: product.expiration_date || '',
                batch_number: product.batch_number || ''
            });
        } else {
            setEditingProduct(null);
            setFormData({
                name: '',
                description: '',
                category_id: '',
                quantity: 0,
                unit: 'pcs',
                minimum_stock_level: 0,
                purchase_price: '',
                selling_price: '',
                currency: 'EUR',
                supplier_name: '',
                supplier_contact: '',
                sku: '',
                barcode: '',
                location_in_shop: '',
                expiration_date: '',
                batch_number: ''
            });
        }
        setShowModal(true);
        setError('');
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingProduct(null);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.name.trim()) {
            setError(t('nameRequired'));
            return;
        }

        if (!formData.expiration_date) {
            setError(t('expirationRequired'));
            return;
        }

        setSubmitting(true);

        try {
            const url = editingProduct
                ? `/api/admin/inventory/products/${editingProduct.id}`
                : '/api/admin/inventory/products';

            const method = editingProduct ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                await fetchProducts();
                if (onProductChange) onProductChange();
                handleCloseModal();
            } else {
                setError(data.error || 'Failed to save product');
            }
        } catch (error) {
            console.error('Error saving product:', error);
            setError('An error occurred while saving');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (product) => {
        if (!confirm(`${t('confirmDelete')} "${product.name}"? ${t('confirmDeleteMessage')}`)) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/inventory/products/${product.id}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (response.ok) {
                await fetchProducts();
                if (onProductChange) onProductChange();
            } else {
                alert(data.error || 'Failed to delete product');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('An error occurred while deleting');
        }
    };

    const getExpirationStatus = (expirationDate) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const expDate = new Date(expirationDate);
        expDate.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return { label: t('expired'), color: 'bg-red-500/10 text-red-600 border-red-500/30', icon: AlertTriangle };
        } else if (diffDays === 0) {
            return { label: t('expiringToday'), color: 'bg-orange-500/10 text-orange-600 border-orange-500/30', icon: AlertTriangle };
        } else if (diffDays <= 7) {
            return { label: t('expiringSoon'), color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30', icon: Calendar };
        } else {
            return { label: t('active'), color: 'bg-green-500/10 text-green-600 border-green-500/30', icon: CheckCircle };
        }
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const units = ['pcs', 'kg', 'g', 'l', 'ml', 'box', 'bottle', 'pack'];

    return (
        <div className="space-y-6">
            {/* Header */}
            <GlassCard>
                <CardHeader>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="h-5 w-5 text-red-500" />
                                    {t('products')}
                                </CardTitle>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {filteredProducts.length} {t('total').toLowerCase()}
                                </p>
                            </div>

                            <Button
                                onClick={() => handleOpenModal()}
                                className="bg-red-600 hover:bg-red-700 text-white shadow-lg"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                {t('addProduct')}
                            </Button>
                        </div>

                        {/* Filters */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                <Input
                                    placeholder={t('searchProducts')}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4"
                                />
                            </div>

                            <div className="relative min-w-[200px]">
                                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                <select
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                >
                                    <option value="">{t('allCategories')}</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </CardHeader>
            </GlassCard>

            {/* Products Table */}
            <GlassCard className="overflow-hidden">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        {t('productName')}
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        {t('category')}
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        {t('quantity')}
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        {t('location')}
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        {t('expirationDate')}
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        {t('actions')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center">
                                            <div className="flex justify-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" />
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredProducts.length > 0 ? (
                                    filteredProducts.map((product) => {
                                        const expirationStatus = getExpirationStatus(product.expiration_date);
                                        const StatusIcon = expirationStatus.icon;

                                        return (
                                            <motion.tr
                                                key={product.id}
                                                className="hover:bg-accent/50 transition-colors"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                            >
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <div className="font-medium">{product.name}</div>
                                                        {product.sku && (
                                                            <div className="text-xs text-muted-foreground mt-1">
                                                                SKU: {product.sku}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {product.category ? (
                                                        <Badge
                                                            variant="outline"
                                                            className="border"
                                                            style={{
                                                                backgroundColor: product.category.color + '20',
                                                                borderColor: product.category.color + '40',
                                                                color: product.category.color
                                                            }}
                                                        >
                                                            {product.category.name}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-sm text-muted-foreground">{t('noCategory')}</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">{product.quantity}</span>
                                                        <span className="text-sm text-muted-foreground">{product.unit}</span>
                                                    </div>
                                                    {product.quantity <= product.minimum_stock_level && (
                                                        <Badge variant="outline" className="mt-1 bg-orange-500/10 text-orange-600 border-orange-500/30">
                                                            {t('lowStock')}
                                                        </Badge>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-muted-foreground">
                                                    {product.location_in_shop || '-'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className={`${expirationStatus.color} border flex items-center gap-1`}>
                                                            <StatusIcon className="h-3 w-3" />
                                                            {new Date(product.expiration_date).toLocaleDateString('it-IT')}
                                                        </Badge>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleOpenModal(product)}
                                                            className="p-1.5 hover:bg-accent rounded-lg transition-colors"
                                                        >
                                                            <Edit className="h-4 w-4 text-muted-foreground" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(product)}
                                                            className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors"
                                                        >
                                                            <Trash2 className="h-4 w-4 text-red-500" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center text-muted-foreground">
                                                <Package className="h-16 w-16 mb-4 opacity-20" />
                                                <p className="text-lg font-medium mb-2">{t('noProductsFound')}</p>
                                                <p className="text-sm">{t('createFirstProduct')}</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </GlassCard>


            {/* Product Modal - Multi-Step Form */}
            <MultiStepProductForm
                isOpen={showModal}
                onClose={handleCloseModal}
                onSubmit={handleSubmit}
                formData={formData}
                setFormData={setFormData}
                categories={categories}
                editingProduct={editingProduct}
                submitting={submitting}
                error={error}
            />
        </div>
    );
}
