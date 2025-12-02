import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, X, Save, Phone, Mail, MapPin, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from '@/lib/actions/suppliers';
import GlassCard from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export default function SupplierManager() {
    const t = useTranslations('Suppliers');
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [visibleCount, setVisibleCount] = useState(10);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        email: '',
        phone: '',
        vat_number: ''
    });

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        try {
            setLoading(true);
            const data = await getSuppliers();
            setSuppliers(data || []);
        } catch (error) {
            console.error('Failed to fetch suppliers', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (supplier = null) => {
        if (supplier) {
            setEditingSupplier(supplier);
            setFormData({
                name: supplier.name,
                address: supplier.address || '',
                email: supplier.email || '',
                phone: supplier.phone || '',
                vat_number: supplier.vat_number || ''
            });
        } else {
            setEditingSupplier(null);
            setFormData({
                name: '',
                address: '',
                email: '',
                phone: '',
                vat_number: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingSupplier(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingSupplier) {
                await updateSupplier(editingSupplier.id, formData);
            } else {
                await createSupplier(formData);
            }
            fetchSuppliers();
            handleCloseModal();
        } catch (error) {
            console.error('Failed to save supplier', error);
            alert(t('save_error'));
        }
    };

    const handleDelete = async (id) => {
        if (confirm(t('delete_confirm'))) {
            try {
                await deleteSupplier(id);
                fetchSuppliers();
            } catch (error) {
                console.error('Failed to delete supplier', error);
                alert(t('delete_error'));
            }
        }
    };

    const filteredSuppliers = suppliers.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const visibleSuppliers = filteredSuppliers.slice(0, visibleCount);

    const handleLoadMore = () => {
        setVisibleCount(prev => prev + 10);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{t('title')}</h2>
                    <p className="text-muted-foreground">{t('subtitle')}</p>
                </div>
                <Button
                    onClick={() => handleOpenModal()}
                    className="bg-black text-white hover:bg-gray-800 shadow-lg shadow-black/20 transition-all hover:scale-105"
                >
                    <Plus size={18} className="mr-2" />
                    {t('add_supplier')}
                </Button>
            </div>

            <GlassCard className="p-0 overflow-hidden border-0 shadow-xl bg-white/50 backdrop-blur-xl">
                <div className="p-6 border-b border-gray-100 bg-white/50">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder={t('search_placeholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-gray-500">
                        <Loader2 className="animate-spin h-8 w-8 mx-auto mb-4 text-gray-400" />
                        {t('loading')}
                    </div>
                ) : (
                    <>
                        <div className="relative w-full overflow-auto">
                            <Table>
                                <TableHeader className="bg-gray-50/50">
                                    <TableRow>
                                        <TableHead className="font-semibold">{t('table_name')}</TableHead>
                                        <TableHead className="font-semibold">{t('table_contact')}</TableHead>
                                        <TableHead className="font-semibold">{t('table_address')}</TableHead>
                                        <TableHead className="text-right font-semibold">{t('table_actions')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {visibleSuppliers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-32 text-center text-gray-400">
                                                {t('no_suppliers')}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        visibleSuppliers.map((supplier) => (
                                            <TableRow key={supplier.id} className="hover:bg-gray-50/80 transition-colors group">
                                                <TableCell className="font-medium text-gray-900">
                                                    {supplier.name}
                                                    {supplier.vat_number && (
                                                        <div className="text-xs text-muted-foreground mt-0.5">VAT: {supplier.vat_number}</div>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1 text-sm text-gray-600">
                                                        {supplier.email && (
                                                            <div className="flex items-center gap-2">
                                                                <Mail size={14} className="text-gray-400" />
                                                                {supplier.email}
                                                            </div>
                                                        )}
                                                        {supplier.phone && (
                                                            <div className="flex items-center gap-2">
                                                                <Phone size={14} className="text-gray-400" />
                                                                {supplier.phone}
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="max-w-xs truncate text-muted-foreground">
                                                    {supplier.address && (
                                                        <div className="flex items-center gap-2">
                                                            <MapPin size={14} className="text-gray-400" />
                                                            {supplier.address}
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            onClick={() => handleOpenModal(supplier)}
                                                            className="h-10 w-10 p-0 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                                                        >
                                                            <Edit size={18} />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            onClick={() => handleDelete(supplier.id)}
                                                            className="h-10 w-10 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50"
                                                        >
                                                            <Trash2 size={18} />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                        {visibleCount < filteredSuppliers.length && (
                            <div className="p-4 border-t border-gray-100 bg-gray-50/30 flex justify-center">
                                <Button variant="outline" onClick={handleLoadMore}>
                                    {t('load_more')}
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </GlassCard>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100"
                        >
                            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                                <h3 className="font-bold text-xl text-gray-900">
                                    {editingSupplier ? t('modal_edit_title') : t('modal_add_title')}
                                </h3>
                                <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-200 rounded-full">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('form_name')}</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black/20 transition-all"
                                        placeholder="e.g. Al-Baraka Foods"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('form_email')}</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black/20 transition-all"
                                            placeholder="contact@example.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('form_phone')}</label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black/20 transition-all"
                                            placeholder="+1 234 567 890"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('form_address')}</label>
                                    <textarea
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black/20 transition-all min-h-[80px]"
                                        rows="2"
                                        placeholder="Full address..."
                                    ></textarea>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('form_vat')}</label>
                                    <input
                                        type="text"
                                        value={formData.vat_number}
                                        onChange={(e) => setFormData({ ...formData, vat_number: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black/20 transition-all"
                                        placeholder="VAT123456"
                                    />
                                </div>

                                <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleCloseModal}
                                        className="rounded-xl"
                                    >
                                        {t('cancel')}
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="bg-black text-white hover:bg-gray-800 rounded-xl"
                                    >
                                        <Save size={18} className="mr-2" />
                                        {t('save')}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
