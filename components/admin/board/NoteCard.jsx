import Link from 'next/link';
import { motion } from 'framer-motion';
import { Pin, Trash2, Edit2, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

export default function NoteCard({ note, currentUser, onEdit, onDelete, onPin, dragConstraints }) {
    const t = useTranslations('Admin.Board');
    const isAuthor = currentUser?.id === note.author_id;
    const isSuperAdmin = currentUser?.role === 'super_admin'; // Assuming role check
    const canEdit = isAuthor; // Only author can edit
    const canDelete = isAuthor || isSuperAdmin;

    const hasRichContent = (note.images && note.images.length > 0) ||
        note.drawing ||
        (note.links && note.links.length > 0);
    const isLongMessage = note.message.length > 150;
    const showDetails = hasRichContent || isLongMessage;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            drag
            dragConstraints={dragConstraints}
            dragElastic={0.2}
            dragMomentum={false}
            whileDrag={{ scale: 1.05, zIndex: 50, cursor: 'grabbing' }}
            className={cn(
                "group relative flex flex-col bg-card rounded-xl border shadow-sm transition-all hover:shadow-md overflow-hidden cursor-grab active:cursor-grabbing",
                note.is_pinned && "border-primary/50 bg-primary/5"
            )}
        >
            <div className="p-5 flex-1 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-lg leading-tight line-clamp-2">
                        {note.title || <span className="text-muted-foreground italic">No Title</span>}
                    </h3>
                    {note.is_pinned && (
                        <Pin className="h-4 w-4 text-primary fill-primary flex-shrink-0" />
                    )}
                </div>

                <p className="text-muted-foreground text-sm whitespace-pre-wrap line-clamp-6 flex-1">
                    {note.message}
                </p>

                {showDetails && (
                    <Link
                        href={`/admin/board/${note.id}`}
                        className="mt-2 text-xs font-medium text-primary flex items-center gap-1 hover:underline w-fit"
                        onClick={(e) => e.stopPropagation()} // Prevent drag? No, drag is on parent. But maybe prevent other clicks.
                    >
                        {t('view_details')} <ExternalLink className="h-3 w-3" />
                    </Link>
                )}

                <div className="mt-auto pt-4 flex items-center justify-between text-xs text-muted-foreground border-t border-border/50">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center overflow-hidden border">
                            <img
                                src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${note.author?.full_name || 'User'}`}
                                alt={note.author?.full_name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <span className="font-medium text-foreground/80">{note.author?.full_name}</span>
                    </div>
                    <span title={format(new Date(note.updated_at), 'PPP p')}>
                        {format(new Date(note.updated_at), 'MMM d, yyyy')}
                    </span>
                </div>
            </div>

            {/* Actions Overlay */}
            <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-card/80 backdrop-blur-sm p-1 rounded-lg border shadow-sm">
                <button
                    onClick={() => onPin(note.id, !note.is_pinned)}
                    className={cn(
                        "p-1.5 rounded-md transition-colors hover:bg-muted",
                        note.is_pinned ? "text-primary" : "text-muted-foreground"
                    )}
                    title={note.is_pinned ? "Unpin" : "Pin"}
                >
                    <Pin className="h-4 w-4" />
                </button>

                {canEdit && (
                    <button
                        onClick={() => onEdit(note)}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        title="Edit"
                    >
                        <Edit2 className="h-4 w-4" />
                    </button>
                )}

                {canDelete && (
                    <button
                        onClick={() => {
                            if (confirm('Are you sure you want to delete this note?')) {
                                onDelete(note.id);
                            }
                        }}
                        className="p-1.5 rounded-md text-destructive/80 hover:text-destructive hover:bg-destructive/10 transition-colors"
                        title="Delete"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                )}
            </div>
        </motion.div>
    );
}
