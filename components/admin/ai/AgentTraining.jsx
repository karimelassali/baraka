"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit, Save, X, Book, Map, FileText, Brain, Loader2, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AgentTraining() {
    const [knowledge, setKnowledge] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, route, instruction, general
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({ title: '', content: '', type: 'general' });
    const [isSaving, setIsSaving] = useState(false);

    const router = useRouter();

    const [error, setError] = useState(null);

    useEffect(() => {
        fetchKnowledge();
    }, []);

    const fetchKnowledge = async () => {
        try {
            const res = await fetch('/api/admin/agent-knowledge');
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.details || data.error || 'Failed to fetch knowledge');
            }

            if (data.knowledge) {
                setKnowledge(data.knowledge);
            }
        } catch (error) {
            console.error("Error fetching knowledge:", error);
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.title || !formData.content) return;
        setIsSaving(true);

        try {
            const url = editingItem
                ? `/api/admin/agent-knowledge/${editingItem.id}`
                : '/api/admin/agent-knowledge';

            const method = editingItem ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                fetchKnowledge();
                closeModal();
            }
        } catch (error) {
            console.error("Error saving knowledge:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this lesson?')) return;

        try {
            const res = await fetch(`/api/admin/agent-knowledge/${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                setKnowledge(prev => prev.filter(k => k.id !== id));
            }
        } catch (error) {
            console.error("Error deleting knowledge:", error);
        }
    };

    const openModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({ title: item.title, content: item.content, type: item.type });
        } else {
            setEditingItem(null);
            setFormData({ title: '', content: '', type: 'general' });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        setFormData({ title: '', content: '', type: 'general' });
    };

    const filteredKnowledge = filter === 'all'
        ? knowledge
        : knowledge.filter(k => k.type === filter);

    const getTypeIcon = (type) => {
        switch (type) {
            case 'route': return <Map size={18} className="text-blue-500" />;
            case 'instruction': return <FileText size={18} className="text-orange-500" />;
            default: return <Book size={18} className="text-purple-500" />;
        }
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'route': return 'Route & Navigation';
            case 'instruction': return 'Instruction';
            default: return 'General Knowledge';
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                        <Brain className="text-red-600" size={32} />
                        Agent Training Center
                    </h1>
                    <p className="text-slate-500 mt-1">Manage Baraka Core's knowledge base and capabilities.</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-500/20 font-medium"
                >
                    <Plus size={20} />
                    Add New Lesson
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-full">
                        <X size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold">Error Loading Knowledge</h3>
                        <p className="text-sm">{error}</p>
                        <p className="text-xs mt-1 text-red-500">Did you run the database migration?</p>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {['all', 'route', 'instruction', 'general'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${filter === f
                            ? 'bg-slate-800 text-white shadow-md'
                            : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                            }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Content Grid */}
            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 size={40} className="animate-spin text-red-600" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {filteredKnowledge.map((item) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
                            >
                                <div className="p-5 flex-1">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-50 rounded-md border border-slate-100">
                                            {getTypeIcon(item.type)}
                                            <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                                                {item.type}
                                            </span>
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => openModal(item)}
                                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-lg text-slate-800 mb-2 line-clamp-1">{item.title}</h3>
                                    <p className="text-slate-600 text-sm line-clamp-4 leading-relaxed">
                                        {item.content}
                                    </p>
                                </div>
                                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400">
                                    <span>Updated: {new Date(item.updated_at).toLocaleDateString()}</span>
                                    {item.is_active && (
                                        <span className="flex items-center gap-1 text-green-600 font-medium">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                            Active
                                        </span>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-slate-800">
                                    {editingItem ? 'Edit Lesson' : 'Add New Lesson'}
                                </h2>
                                <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['general', 'route', 'instruction'].map(t => (
                                            <button
                                                key={t}
                                                onClick={() => setFormData({ ...formData, type: t })}
                                                className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all ${formData.type === t
                                                    ? 'bg-slate-800 text-white border-slate-800'
                                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                                    }`}
                                            >
                                                {t.charAt(0).toUpperCase() + t.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="e.g., New Dashboard Feature"
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Content / Instruction
                                        {formData.type === 'route' && <span className="text-xs font-normal text-slate-400 ml-2">(Format: **Name** (/path): Description)</span>}
                                    </label>
                                    <textarea
                                        value={formData.content}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        placeholder={formData.type === 'route' ? "**Page Name** (/admin/page): Description of what this page does." : "Enter the knowledge or instruction here..."}
                                        rows={6}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all resize-none"
                                    />
                                </div>
                            </div>

                            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                                <button
                                    onClick={closeModal}
                                    className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving || !formData.title || !formData.content}
                                    className="px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:hover:bg-red-600 transition-colors font-medium flex items-center gap-2 shadow-lg shadow-red-500/20"
                                >
                                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                    Save Lesson
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
