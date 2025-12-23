"use client";

import { useState, useEffect, useRef } from 'react';
import {
    Bell,
    RefreshCw
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import NotificationList from './NotificationList';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { formatDistanceToNow } from 'date-fns';
import { it, enUS, ar } from 'date-fns/locale';

import {
    Dialog,
    DialogContent
} from "../ui/dialog";

import { createClient } from '@/lib/supabaseClient';

export default function NotificationCenter() {
    const t = useTranslations('Admin.Notifications');
    const [unreadCount, setUnreadCount] = useState(0);
    const [isMobile, setIsMobile] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);
    const supabase = createClient();

    const fetchUnreadCount = async () => {
        try {
            const response = await fetch('/api/admin/notifications?limit=1');
            const data = await response.json();
            if (response.ok) {
                setUnreadCount(data.unread);
            }
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    const audioRef = useRef(null);

    useEffect(() => {
        audioRef.current = new Audio('/sounds/new-notification-021-370045.mp3');
    }, []);

    const playNotificationSound = () => {
        if (audioRef.current) {
            audioRef.current.play().catch(e => console.error("Error playing sound:", e));
        }
    };

    useEffect(() => {
        fetchUnreadCount();

        const channel = supabase
            .channel('notifications_count')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'notifications'
                },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        playNotificationSound();
                    }
                    // Simple approach: Refetch count on any change
                    // Optimization: increment/decrement based on payload if needed, 
                    // but refetching is safer for consistency with server logic
                    fetchUnreadCount();
                }
            )
            .subscribe();

        const checkMobile = () => setIsMobile(window.innerWidth < 640);
        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => {
            supabase.removeChannel(channel);
            window.removeEventListener('resize', checkMobile);
        };
    }, []);

    const TriggerButton = (
        <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-accent/50 transition-colors"
            onClick={() => isMobile && setIsOpen(true)}
        >
            <Bell className="h-6 w-6 text-foreground/80" />
            {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 bg-red-600 rounded-full text-[10px] font-bold text-white flex items-center justify-center animate-in zoom-in">
                    {unreadCount > 9 ? '9+' : unreadCount}
                </span>
            )}
        </Button>
    );

    if (isMobile) {
        return (
            <>
                {TriggerButton}
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogContent className="w-[90vw] max-h-[80vh] p-0 overflow-hidden flex flex-col">
                        <div className="flex-1 overflow-y-auto">
                            <NotificationList
                                isCompact={true}
                                isMobile={isMobile}
                                onUnreadCountChange={setUnreadCount}
                                onItemClick={() => setIsOpen(false)}
                            />
                        </div>
                    </DialogContent>
                </Dialog>
            </>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {TriggerButton}
            </DropdownMenuTrigger>
            <DropdownMenuContent
                side="right"
                align="end"
                className="w-[420px] p-0 border-border/50 shadow-2xl bg-background/95 backdrop-blur-xl z-[100]"
                sideOffset={10}
            >
                <div className="h-[500px] flex flex-col">
                    <NotificationList
                        isCompact={true}
                        onUnreadCountChange={setUnreadCount}
                    />
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
