"use client";

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
    CheckCircle2,
    XCircle,
    Clock,
    Search,
    MessageSquare,
    User
} from 'lucide-react';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import GlassCard from '../ui/GlassCard';

export default function CampaignHistory() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const response = await fetch('/api/admin/campaigns/history');
            if (response.ok) {
                const data = await response.json();
                setMessages(data.messages || []);
            }
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredMessages = messages.filter(msg =>
        msg.message_content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.customers?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.customers?.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Recent Messages</h3>
                <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search messages..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            <div className="space-y-3">
                {filteredMessages.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                        No messages found
                    </div>
                ) : (
                    filteredMessages.map((msg) => (
                        <GlassCard key={msg.id} className="p-4 hover:bg-white/5 transition-colors">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Badge variant="outline" className={
                                            msg.status === 'sent'
                                                ? 'bg-green-500/10 text-green-600 border-green-200'
                                                : 'bg-red-500/10 text-red-600 border-red-200'
                                        }>
                                            {msg.status === 'sent' ? (
                                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                            ) : (
                                                <XCircle className="h-3 w-3 mr-1" />
                                            )}
                                            {msg.status}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {format(new Date(msg.created_at), 'MMM d, yyyy HH:mm')}
                                        </span>
                                    </div>

                                    <p className="text-sm text-gray-800 dark:text-gray-200 line-clamp-2 mb-2">
                                        {msg.message_content}
                                    </p>

                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <User className="h-3 w-3" />
                                        <span>
                                            {msg.customers?.first_name} {msg.customers?.last_name}
                                            ({msg.customers?.phone_number})
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </GlassCard>
                    ))
                )}
            </div>
        </div>
    );
}
