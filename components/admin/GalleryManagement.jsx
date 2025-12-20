"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Image as ImageIcon,
    Plus,
    Trash2,
    X,
    Upload,
    Loader2,
    ExternalLink
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import GlassCard from '../../components/ui/GlassCard';
import { Input } from '../../components/ui/input';
import { createClient } from '../../lib/supabase/client';

function SkeletonCard() {
    return (
        <div className="bg-muted/20 rounded-xl h-64 animate-pulse" />
    );
}

export default function GalleryManagement() {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Form state
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('General');
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const fileInputRef = useRef(null);

    const supabase = createClient();

    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async () => {
        try {
            const response = await fetch('/api/admin/gallery');
            if (response.ok) {
                const data = await response.json();
                setImages(data);
            }
        } catch (error) {
            console.error('Failed to fetch images:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            setSelectedFile(file);
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);
        }
    };

    const resetForm = () => {
        setTitle('');
        setCategory('General');
        setSelectedFile(null);
        setPreviewUrl('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        setIsAddModalOpen(false);
    };

    const handleAddImage = async (e) => {
        e.preventDefault();
        if (!selectedFile || !title) return;

        setUploading(true);

        try {
            // 1. Upload image to Supabase Storage
            const fileExt = selectedFile.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('gallery')
                .upload(filePath, selectedFile);

            if (uploadError) {
                throw uploadError;
            }

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('gallery')
                .getPublicUrl(filePath);

            // 3. Save metadata to Database
            const response = await fetch('/api/admin/gallery', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    image_url: publicUrl,
                    category
                }),
            });

            if (response.ok) {
                fetchImages();
                resetForm();
            } else {
                console.error('Failed to save image metadata');
                alert('Failed to save image metadata');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Error uploading image: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteImage = async (id, imageUrl) => {
        if (!confirm('Are you sure you want to delete this image?')) return;

        try {
            // Optimistic update
            setImages(images.filter(img => img.id !== id));

            // Delete from DB
            const response = await fetch(`/api/admin/gallery?id=${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete from database');
            }

            // Try to delete from storage if it's a storage URL
            // Extract path from URL
            if (imageUrl && imageUrl.includes('/storage/v1/object/public/gallery/')) {
                const path = imageUrl.split('/storage/v1/object/public/gallery/')[1];
                if (path) {
                    await supabase.storage.from('gallery').remove([path]);
                }
            }

        } catch (error) {
            console.error('Error deleting image:', error);
            alert('Failed to delete image');
            fetchImages(); // Revert on error
        }
    };

    return (
        <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <GlassCard>
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <ImageIcon className="h-5 w-5" />
                                Gallery Management
                            </CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                                Manage images displayed in the "Our Gallery" section
                            </p>
                        </div>

                        <Button
                            onClick={() => setIsAddModalOpen(true)}
                            className="bg-primary hover:bg-red-700 text-white shadow-md"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Image
                        </Button>
                    </div>
                </CardHeader>
            </GlassCard>

            {/* Gallery Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {loading ? (
                    [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
                ) : images.length > 0 ? (
                    <AnimatePresence>
                        {images.map((image) => (
                            <motion.div
                                key={image.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="group relative aspect-square rounded-xl overflow-hidden bg-muted shadow-sm hover:shadow-md transition-all"
                            >
                                <img
                                    src={image.image_url}
                                    alt={image.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300" />

                                <div className="absolute inset-0 p-4 flex flex-col justify-between transition-opacity duration-300">
                                    <div className="flex justify-end">
                                        <Button
                                            size="icon"
                                            variant="destructive"
                                            className="h-8 w-8 rounded-full shadow-sm"
                                            onClick={() => handleDeleteImage(image.id, image.image_url)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="text-white">
                                        <p className="font-bold truncate">{image.title}</p>
                                        <p className="text-xs opacity-80">{image.category}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                ) : (
                    <div className="col-span-full py-12 text-center text-muted-foreground bg-muted/10 rounded-xl border border-dashed border-border">
                        <ImageIcon className="h-10 w-10 mx-auto mb-3 opacity-20" />
                        <p>No images in gallery yet</p>
                    </div>
                )}
            </div>

            {/* Add Image Modal */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-md"
                        >
                            <GlassCard>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle>Add New Image</CardTitle>
                                    <Button variant="ghost" size="icon" onClick={resetForm} className="h-8 w-8 rounded-full">
                                        <X className="h-4 w-4" />
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleAddImage} className="space-y-4">
                                        {/* Image Upload Area */}
                                        <div
                                            className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-colors ${previewUrl ? 'border-primary/50 bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
                                                }`}
                                            onDragOver={handleDragOver}
                                            onDrop={handleDrop}
                                        >
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleFileSelect}
                                                accept="image/*"
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />

                                            {previewUrl ? (
                                                <div className="relative aspect-video rounded-lg overflow-hidden bg-black/5">
                                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                                                    <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center">
                                                        <p className="text-white opacity-0 hover:opacity-100 font-medium drop-shadow-md">Click to change</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="py-4">
                                                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
                                                        <Upload className="h-6 w-6" />
                                                    </div>
                                                    <p className="text-sm font-medium">Click to upload or drag and drop</p>
                                                    <p className="text-xs text-muted-foreground mt-1">SVG, PNG, JPG or GIF</p>
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-1">Title</label>
                                            <Input
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                placeholder="Image title"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-1">Category</label>
                                            <select
                                                value={category}
                                                onChange={(e) => setCategory(e.target.value)}
                                                className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                            >
                                                <option value="General">General</option>
                                                <option value="Interior">Interior</option>
                                                <option value="Products">Products</option>
                                                <option value="Events">Events</option>
                                            </select>
                                        </div>

                                        <div className="pt-2 flex gap-3">
                                            <Button type="button" variant="outline" className="flex-1" onClick={resetForm}>
                                                Cancel
                                            </Button>
                                            <Button
                                                type="submit"
                                                className="flex-1 bg-primary hover:bg-red-700"
                                                disabled={!selectedFile || !title || uploading}
                                            >
                                                {uploading ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                        Uploading...
                                                    </>
                                                ) : (
                                                    'Add Image'
                                                )}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </GlassCard>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
