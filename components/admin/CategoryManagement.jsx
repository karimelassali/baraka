"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Tag, Globe, Loader2, Save, X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import GlassCard from '../../components/ui/GlassCard';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../components/ui/table";

export default function CategoryManagement() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newCategory, setNewCategory] = useState({
        en: '',
        it: '',
        ar: '',
        slug: ''
    });
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/admin/categories');
            if (response.ok) {
                const data = await response.json();
                setCategories(data);
            }
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newCategory.en || !newCategory.slug) return;

        setIsCreating(true);
        try {
            const response = await fetch('/api/admin/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: {
                        en: newCategory.en,
                        it: newCategory.it || newCategory.en,
                        ar: newCategory.ar || newCategory.en
                    },
                    slug: newCategory.slug
                }),
            });

            if (response.ok) {
                setNewCategory({ en: '', it: '', ar: '', slug: '' });
                setIsAdding(false);
                fetchCategories();
            }
        } catch (error) {
            console.error('Failed to create category:', error);
        } finally {
            setIsCreating(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure? This will remove the category from all associated offers.')) return;

        try {
            const response = await fetch(`/api/admin/categories?id=${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setCategories(categories.filter(c => c.id !== id));
            }
        } catch (error) {
            console.error('Failed to delete category:', error);
        }
    };

    return (
        <GlassCard className="mb-8">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    Category Management
                </CardTitle>
                <Button
                    onClick={() => setIsAdding(!isAdding)}
                    variant={isAdding ? "secondary" : "default"}
                    size="sm"
                >
                    {isAdding ? <X className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                    {isAdding ? 'Cancel' : 'Add Category'}
                </Button>
            </CardHeader>
            <CardContent>
                <AnimatePresence>
                    {isAdding && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden mb-6"
                        >
                            <div className="bg-muted/30 p-4 rounded-lg border border-border">
                                <form onSubmit={handleCreate} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div>
                                            <label className="text-xs font-medium mb-1.5 block text-muted-foreground">Slug (ID)</label>
                                            <Input
                                                placeholder="e.g. electronics"
                                                value={newCategory.slug}
                                                onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                                className="bg-background"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium mb-1.5 block text-muted-foreground">English Name</label>
                                            <Input
                                                placeholder="e.g. Electronics"
                                                value={newCategory.en}
                                                onChange={(e) => setNewCategory({ ...newCategory, en: e.target.value })}
                                                className="bg-background"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium mb-1.5 block text-muted-foreground">Italian Name</label>
                                            <Input
                                                placeholder="e.g. Elettronica"
                                                value={newCategory.it}
                                                onChange={(e) => setNewCategory({ ...newCategory, it: e.target.value })}
                                                className="bg-background"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium mb-1.5 block text-muted-foreground">Arabic Name</label>
                                            <Input
                                                placeholder="e.g. إلكترونيات"
                                                value={newCategory.ar}
                                                onChange={(e) => setNewCategory({ ...newCategory, ar: e.target.value })}
                                                className="bg-background text-right"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <Button type="submit" disabled={isCreating || !newCategory.slug || !newCategory.en}>
                                            {isCreating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                            Save Category
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="rounded-md border border-border overflow-hidden">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead>Slug</TableHead>
                                <TableHead>English</TableHead>
                                <TableHead>Italian</TableHead>
                                <TableHead className="text-right">Arabic</TableHead>
                                <TableHead className="w-[100px] text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                                    </TableCell>
                                </TableRow>
                            ) : categories.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                        No categories found. Add one to get started.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                categories.map((category) => (
                                    <TableRow key={category.id} className="hover:bg-muted/30">
                                        <TableCell className="font-mono text-xs text-muted-foreground">
                                            {category.slug}
                                        </TableCell>
                                        <TableCell className="font-medium">{category.name?.en}</TableCell>
                                        <TableCell>{category.name?.it || '-'}</TableCell>
                                        <TableCell className="text-right font-arabic">{category.name?.ar || '-'}</TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(category.id)}
                                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </GlassCard>
    );
}
