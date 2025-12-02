"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Calendar, User, Link as LinkIcon, Image as ImageIcon, PenTool, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';

export default function NoteDetailsPage() {
    const t = useTranslations('Admin.Board');
    const params = useParams();
    const router = useRouter();
    const [note, setNote] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchNote = async () => {
            try {
                const { data, error } = await supabase
                    .from('admin_notes')
                    .select(`
                        *,
                        author:admin_users(full_name, email)
                    `)
                    .eq('id', params.id)
                    .single();

                if (error) throw error;
                setNote(data);
            } catch (error) {
                console.error('Error fetching note:', error);
                // toast.error(t('error_fetching'));
            } finally {
                setIsLoading(false);
            }
        };

        if (params.id) {
            fetchNote();
        }
    }, [params.id]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!note) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
                <p className="text-muted-foreground">Note not found</p>
                <Link href="/admin/board" className="text-primary hover:underline">
                    Back to Board
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/board"
                    className="p-2 hover:bg-muted rounded-full transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <h1 className="text-2xl font-bold">Note Details</h1>
            </div>

            <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                <div className="p-6 md:p-8 space-y-6">
                    {/* Header */}
                    <div className="space-y-4 border-b pb-6">
                        <h2 className="text-3xl font-bold text-foreground">
                            {note.title || <span className="text-muted-foreground italic">No Title</span>}
                        </h2>

                        <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <span className="font-medium text-foreground">{note.author?.full_name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>{format(new Date(note.created_at), 'PPP p')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Message */}
                    <div className="prose prose-stone max-w-none">
                        <p className="whitespace-pre-wrap text-lg leading-relaxed text-foreground/90">
                            {note.message}
                        </p>
                    </div>

                    {/* Images */}
                    {note.images && note.images.length > 0 && (
                        <div className="space-y-3 pt-4 border-t">
                            <h3 className="flex items-center gap-2 font-semibold text-lg">
                                <ImageIcon className="h-5 w-5" /> Images
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {note.images.map((img, index) => (
                                    <div key={index} className="rounded-lg overflow-hidden border bg-muted">
                                        <img
                                            src={img}
                                            alt={`Attachment ${index + 1}`}
                                            className="w-full h-auto object-contain max-h-[500px]"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Drawing */}
                    {note.drawing && (
                        <div className="space-y-3 pt-4 border-t">
                            <h3 className="flex items-center gap-2 font-semibold text-lg">
                                <PenTool className="h-5 w-5" /> Drawing
                            </h3>
                            <div className="rounded-lg overflow-hidden border bg-white p-4">
                                <img
                                    src={note.drawing}
                                    alt="Drawing"
                                    className="w-full h-auto max-h-[500px] object-contain"
                                />
                            </div>
                        </div>
                    )}

                    {/* Links */}
                    {note.links && note.links.length > 0 && (
                        <div className="space-y-3 pt-4 border-t">
                            <h3 className="flex items-center gap-2 font-semibold text-lg">
                                <LinkIcon className="h-5 w-5" /> Links
                            </h3>
                            <div className="grid gap-2">
                                {note.links.map((link, index) => (
                                    <a
                                        key={index}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30 hover:bg-muted transition-colors group"
                                    >
                                        <div className="p-2 bg-background rounded-full border group-hover:border-primary/50 transition-colors">
                                            <LinkIcon className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-foreground">{link.title || link.url}</span>
                                            <span className="text-xs text-muted-foreground">{link.url}</span>
                                        </div>
                                        <ExternalLink className="h-4 w-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
