"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Loader2, FileText, Image as ImageIcon, PenTool, Link as LinkIcon, Plus, Trash2, Upload } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import CanvasDraw from './CanvasDraw';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function CreateNoteModal({ isOpen, onClose, onSubmit, initialData, t }) {
    const [activeTab, setActiveTab] = useState('message');
    const [formData, setFormData] = useState({
        title: '',
        message: ''
    });
    const [images, setImages] = useState([]); // { file, url, preview }
    const [drawing, setDrawing] = useState(null); // dataUrl
    const [links, setLinks] = useState([]); // { url, title }
    const [newLink, setNewLink] = useState({ url: '', title: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const supabase = createClient();

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || '',
                message: initialData.message || ''
            });
            setImages(initialData.images?.map(img => ({ url: img, preview: img })) || []);
            setDrawing(initialData.drawing || null);
            setLinks(initialData.links || []);
        } else {
            resetForm();
        }
    }, [initialData, isOpen]);

    const resetForm = () => {
        setFormData({ title: '', message: '' });
        setImages([]);
        setDrawing(null);
        setLinks([]);
        setActiveTab('message');
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const newImages = files.map(file => ({
            file,
            preview: URL.createObjectURL(file)
        }));
        setImages([...images, ...newImages]);
    };

    const removeImage = (index) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const addLink = () => {
        if (newLink.url) {
            setLinks([...links, newLink]);
            setNewLink({ url: '', title: '' });
        }
    };

    const removeLink = (index) => {
        setLinks(links.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.message.trim() && !drawing && images.length === 0) {
            toast.error("Please add some content (message, image, or drawing)");
            return;
        }

        setIsSubmitting(true);

        try {
            // Upload images
            const uploadedImageUrls = [];
            for (const img of images) {
                if (img.file) {
                    const fileName = `${Date.now()}-${img.file.name}`;
                    const { data, error } = await supabase.storage
                        .from('admin-attachments')
                        .upload(fileName, img.file);

                    if (error) throw error;

                    const { data: { publicUrl } } = supabase.storage
                        .from('admin-attachments')
                        .getPublicUrl(fileName);

                    uploadedImageUrls.push(publicUrl);
                } else {
                    uploadedImageUrls.push(img.url);
                }
            }

            await onSubmit({
                ...formData,
                images: uploadedImageUrls,
                drawing,
                links
            });

            onClose();
        } catch (error) {
            console.error('Error submitting note:', error);
            toast.error(t('error_create'));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const tabs = [
        { id: 'message', icon: FileText, label: t('note_message') },
        { id: 'image', icon: ImageIcon, label: t('tab_images') },
        { id: 'drawing', icon: PenTool, label: t('tab_drawing') },
        { id: 'links', icon: LinkIcon, label: t('tab_links') }
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-card w-full max-w-2xl rounded-xl shadow-xl border overflow-hidden flex flex-col max-h-[90vh]"
            >
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold">
                        {initialData ? t('edit_note') : t('create_note')}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="flex border-b overflow-x-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap",
                                activeTab === tab.id
                                    ? "border-primary text-primary bg-primary/5"
                                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            )}
                        >
                            <tab.icon className="h-4 w-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t('note_title')}</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder={t('title_placeholder')}
                                className="w-full px-3 py-2 rounded-lg border bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                            />
                        </div>

                        {activeTab === 'message' && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t('note_message')}</label>
                                <textarea
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    placeholder={t('message_placeholder')}
                                    rows={8}
                                    className="w-full px-3 py-2 rounded-lg border bg-background focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                                />
                            </div>
                        )}

                        {activeTab === 'image' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {images.map((img, index) => (
                                        <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border bg-muted">
                                            <img src={img.preview} alt="Preview" className="w-full h-full object-cover" />
                                            <button
                                                onClick={() => removeImage(index)}
                                                className="absolute top-1 right-1 p-1 bg-destructive text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                    <label className="flex flex-col items-center justify-center aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer">
                                        <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                                        <span className="text-xs text-muted-foreground">{t('upload_image')}</span>
                                        <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                                    </label>
                                </div>
                            </div>
                        )}

                        {activeTab === 'drawing' && (
                            <div className="space-y-2">
                                <CanvasDraw onSave={setDrawing} initialData={drawing} />
                            </div>
                        )}

                        {activeTab === 'links' && (
                            <div className="space-y-4">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newLink.title}
                                        onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                                        placeholder={t('link_title')}
                                        className="flex-1 px-3 py-2 rounded-lg border bg-background outline-none"
                                    />
                                    <input
                                        type="url"
                                        value={newLink.url}
                                        onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                                        placeholder={t('link_url')}
                                        className="flex-[2] px-3 py-2 rounded-lg border bg-background outline-none"
                                    />
                                    <button
                                        onClick={addLink}
                                        type="button"
                                        className="px-3 py-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {links.map((link, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-sm">{link.title || link.url}</span>
                                                <span className="text-xs text-muted-foreground truncate max-w-[200px]">{link.url}</span>
                                            </div>
                                            <button onClick={() => removeLink(index)} className="text-destructive hover:bg-destructive/10 p-1 rounded">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-4 border-t bg-muted/10 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg transition-colors"
                        disabled={isSubmitting}
                    >
                        {t('cancel')}
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                        {initialData ? t('save_changes') : t('create_note')}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
