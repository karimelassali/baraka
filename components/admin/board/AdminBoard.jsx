"use client";

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useTranslations } from 'next-intl';
import { Plus, Search, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NoteCard from './NoteCard';
import CreateNoteModal from './CreateNoteModal';
import { toast } from 'sonner';

export default function AdminBoard() {
    const t = useTranslations('Admin.Board'); // Force rebuild 2
    const [notes, setNotes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingNote, setEditingNote] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const containerRef = useRef(null);
    const [layoutKey, setLayoutKey] = useState(0);

    // Pagination state
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const NOTES_PER_PAGE = 20;

    const supabase = createClient();

    useEffect(() => {
        fetchUser();
        fetchNotes(0, true);
    }, []);

    const fetchUser = async () => {
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

    const fetchNotes = async (pageIndex = 0, isInitial = false) => {
        try {
            if (isInitial) {
                setIsLoading(true);
            } else {
                setIsLoadingMore(true);
            }

            const from = pageIndex * NOTES_PER_PAGE;
            const to = from + NOTES_PER_PAGE - 1;

            const { data, error, count } = await supabase
                .from('admin_notes')
                .select(`
                    *,
                    author:admin_users(full_name, email)
                `, { count: 'exact' })
                .order('is_pinned', { ascending: false })
                .order('created_at', { ascending: false })
                .range(from, to);

            if (error) throw error;

            if (isInitial) {
                setNotes(data || []);
            } else {
                setNotes(prev => [...prev, ...(data || [])]);
            }

            // Check if there are more notes to load
            if (count !== null) {
                setHasMore(from + (data?.length || 0) < count);
            } else {
                // Fallback if count is not available
                setHasMore((data?.length || 0) === NOTES_PER_PAGE);
            }

            setPage(pageIndex);

        } catch (error) {
            console.error('Error fetching notes:', error);
            toast.error(t('error_fetching'));
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    };

    const handleResetLayout = () => {
        setLayoutKey(prev => prev + 1);
    };

    const handleLoadMore = () => {
        fetchNotes(page + 1, false);
    };

    const handleCreateNote = async (noteData) => {
        try {
            const { error } = await supabase
                .from('admin_notes')
                .insert([{
                    ...noteData,
                    author_id: currentUser.id
                }]);

            if (error) throw error;

            toast.success(t('success_create'));
            // Refresh list from start
            fetchNotes(0, true);
            setIsCreateModalOpen(false);
        } catch (error) {
            console.error('Error creating note:', error);
            toast.error(t('error_create'));
        }
    };

    const handleUpdateNote = async (id, noteData) => {
        try {
            const { error } = await supabase
                .from('admin_notes')
                .update(noteData)
                .eq('id', id);

            if (error) throw error;

            toast.success(t('success_update'));
            // Refresh list from start to ensure order is correct
            fetchNotes(0, true);
            setEditingNote(null);
            setIsCreateModalOpen(false);
        } catch (error) {
            console.error('Error updating note:', error);
            toast.error(t('error_update'));
        }
    };

    const handleDeleteNote = async (id) => {
        try {
            const { error } = await supabase
                .from('admin_notes')
                .delete()
                .eq('id', id);

            if (error) throw error;

            toast.success(t('success_delete'));
            setNotes(notes.filter(note => note.id !== id));
        } catch (error) {
            console.error('Error deleting note:', error);
            toast.error(t('error_delete'));
        }
    };

    const handlePinNote = async (id, isPinned) => {
        try {
            const { error } = await supabase
                .from('admin_notes')
                .update({ is_pinned: isPinned })
                .eq('id', id);

            if (error) throw error;

            toast.success(isPinned ? t('success_pin') : t('success_unpin'));
            // Refresh list to update order
            fetchNotes(0, true);
        } catch (error) {
            console.error('Error pinning note:', error);
            toast.error(t('error_pin'));
        }
    };

    const filteredNotes = notes.filter(note =>
        note.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.author?.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div ref={containerRef} className="space-y-6 min-h-[80vh]">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border shadow-sm">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder={t('search_placeholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-lg border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                        onClick={handleResetLayout}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors font-medium shadow-sm active:scale-95"
                        title={t('reset_layout')}
                    >
                        {t('reset_layout')}
                    </button>
                    <button
                        onClick={() => {
                            setEditingNote(null);
                            setIsCreateModalOpen(true);
                        }}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium shadow-sm active:scale-95"
                    >
                        <Plus className="h-4 w-4" />
                        {t('create_note')}
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : filteredNotes.length === 0 ? (
                <div className="text-center py-12 bg-muted/10 rounded-xl border border-dashed">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground">{t('no_notes')}</h3>
                    <p className="text-muted-foreground mt-1">{t('no_notes_desc')}</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
                        <AnimatePresence mode="popLayout">
                            {filteredNotes.map((note) => (
                                <NoteCard
                                    key={`${note.id}-${layoutKey}`}
                                    note={note}
                                    currentUser={currentUser}
                                    onEdit={(note) => {
                                        setEditingNote(note);
                                        setIsCreateModalOpen(true);
                                    }}
                                    onDelete={handleDeleteNote}
                                    onPin={handlePinNote}
                                    dragConstraints={containerRef}
                                />
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Load More Button */}
                    {hasMore && !searchQuery && (
                        <div className="flex justify-center pt-6">
                            <button
                                onClick={handleLoadMore}
                                disabled={isLoadingMore}
                                className="flex items-center gap-2 px-6 py-2.5 bg-card hover:bg-muted border rounded-full shadow-sm transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoadingMore ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        {t('loading_more')}
                                    </>
                                ) : (
                                    t('load_more')
                                )}
                            </button>
                        </div>
                    )}
                </>
            )}

            <CreateNoteModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={editingNote ? (data) => handleUpdateNote(editingNote.id, data) : handleCreateNote}
                initialData={editingNote}
                t={t}
            />
        </div>
    );
}
