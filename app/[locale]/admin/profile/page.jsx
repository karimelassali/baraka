"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    User,
    Mail,
    Shield,
    Calendar,
    Key,
    Activity,
    Clock,
    LayoutTemplate,
    Edit3,
    Loader2,
    CheckCircle,
    Bell
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { getAvatarUrl } from '@/lib/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import GlassCard from '@/components/ui/GlassCard';
import SidebarCustomizer from '@/components/admin/SidebarCustomizer';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NotificationList from '@/components/admin/NotificationList';

export default function AdminProfilePage() {
    const t = useTranslations('Admin.Profile');
    const [user, setUser] = useState(null);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);

    // Password Reset State
    const [passwordData, setPasswordData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [passLoading, setPassLoading] = useState(false);

    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient();

            const { data: { user: authUser } } = await supabase.auth.getUser();

            if (authUser) {
                const { data: adminData } = await supabase
                    .from('admin_users')
                    .select('*')
                    .eq('auth_id', authUser.id)
                    .single();

                if (adminData) {
                    setUser({ ...adminData, last_sign_in_at: authUser.last_sign_in_at });

                    const { data: logsData } = await supabase
                        .from('admin_logs')
                        .select('*')
                        .eq('admin_id', adminData.id)
                        .order('created_at', { ascending: false })
                        .limit(10);

                    setLogs(logsData || []);
                }
            }
            setLoading(false);
        };

        fetchData();
    }, []);

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error(t('passwords_mismatch'));
            return;
        }

        if (passwordData.newPassword.length < 6) {
            toast.error(t('password_too_short'));
            return;
        }

        setPassLoading(true);
        const supabase = createClient();
        const { error } = await supabase.auth.updateUser({ password: passwordData.newPassword });

        if (error) {
            toast.error(error.message);
        } else {
            toast.success(t('password_updated'));
            setPasswordData({ newPassword: '', confirmPassword: '' });
        }
        setPassLoading(false);
    };

    const handleSidebarSave = (newCategories) => {
        localStorage.setItem('admin_sidebar_config', JSON.stringify(newCategories));
        window.location.reload();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="space-y-6 pb-10 max-w-7xl mx-auto">
            {/* Simplified Header - Cleaner Look */}
            <div className="bg-card border border-border rounded-3xl p-8 shadow-sm flex flex-col md:flex-row items-center gap-8">
                <div className="w-32 h-32 rounded-full border-4 border-background shadow-xl overflow-hidden shrink-0">
                    <img
                        src={getAvatarUrl(user.full_name)}
                        alt={user.full_name}
                        className="w-full h-full object-cover"
                    />
                </div>

                <div className="flex-1 text-center md:text-left space-y-2">
                    <h1 className="text-3xl font-bold">{user.full_name}</h1>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-muted-foreground">
                        <span className="flex items-center gap-1.5 bg-muted/50 px-3 py-1 rounded-full text-sm">
                            <Mail className="w-4 h-4" /> {user.email}
                        </span>
                        <span className="flex items-center gap-1.5 bg-muted/50 px-3 py-1 rounded-full text-sm capitalize">
                            <Shield className="w-4 h-4" /> {user.role.replace('_', ' ')}
                        </span>
                        <span className="flex items-center gap-1.5 bg-muted/50 px-3 py-1 rounded-full text-sm">
                            <Clock className="w-4 h-4" /> {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'N/A'}
                        </span>
                    </div>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex justify-center md:justify-start mb-6">
                    <TabsList className="bg-muted/50 p-1 rounded-full">
                        <TabsTrigger
                            value="overview"
                            className="rounded-full px-6 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
                        >
                            <User className="w-4 h-4 mr-2" />
                            Overview
                        </TabsTrigger>
                        <TabsTrigger
                            value="notifications"
                            className="rounded-full px-6 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
                        >
                            <Bell className="w-4 h-4 mr-2" />
                            Notifications
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="overview" className="mt-0 space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Left Column: Customization & Security (4 cols) */}
                        <div className="lg:col-span-4 space-y-6">
                            {/* Sidebar Customization Card */}
                            <GlassCard className="p-6 flex flex-col items-center text-center space-y-4 border-primary/20 shadow-lg shadow-primary/5 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <LayoutTemplate className="w-24 h-24" />
                                </div>

                                <div className="relative z-10 w-full flex flex-col items-center">
                                    <div className="mb-4">
                                        <img
                                            src="/illus/undraw_product-demo_9d4i.svg"
                                            alt="Customize"
                                            className="h-32 w-auto drop-shadow-md"
                                        />
                                    </div>

                                    <h3 className="font-bold text-lg">{t('customize_sidebar')}</h3>
                                    <p className="text-sm text-muted-foreground mt-1 mb-4 max-w-xs">
                                        {t('customize_desc')}
                                    </p>

                                    <Button
                                        onClick={() => setIsCustomizerOpen(true)}
                                        className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/20"
                                        size="lg"
                                    >
                                        <Edit3 className="w-4 h-4 mr-2" />
                                        {t('customize_sidebar')}
                                    </Button>
                                </div>
                            </GlassCard>

                            {/* Security Card */}
                            <GlassCard className="p-6">
                                <h3 className="font-semibold flex items-center gap-2 mb-4">
                                    <Key className="w-4 h-4 text-primary" />
                                    {t('security')}
                                </h3>

                                <div className="flex justify-center py-4 mb-2">
                                    <img
                                        src="/illus/undraw_forgot-password_nttj.svg"
                                        alt="Security"
                                        className="h-24 w-auto opacity-90"
                                    />
                                </div>

                                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium ml-1">{t('new_password')}</label>
                                        <Input
                                            type="password"
                                            value={passwordData.newPassword}
                                            onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium ml-1">{t('confirm_password')}</label>
                                        <Input
                                            type="password"
                                            value={passwordData.confirmPassword}
                                            onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <Button type="submit" className="w-full" variant="secondary" disabled={passLoading}>
                                        {passLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('update_password')}
                                    </Button>
                                </form>
                            </GlassCard>
                        </div>

                        {/* Right Column: Activity Log (8 cols) */}
                        <div className="lg:col-span-8">
                            <GlassCard className="p-6 h-full">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-semibold text-lg flex items-center gap-2">
                                        <Activity className="w-5 h-5 text-primary" />
                                        {t('recent_activity')}
                                    </h3>
                                    <Badge variant="secondary">
                                        {logs.length} {t('total_actions')}
                                    </Badge>
                                </div>

                                <div className="space-y-4">
                                    {logs.length === 0 ? (
                                        <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-xl">
                                            <Clock className="w-10 h-10 mx-auto mb-3 opacity-20" />
                                            {t('no_activity')}
                                        </div>
                                    ) : (
                                        logs.map((log) => (
                                            <div
                                                key={log.id}
                                                className="flex gap-4 p-4 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors"
                                            >
                                                <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${log.action === 'DELETE' ? 'bg-red-500' :
                                                    log.action === 'UPDATE' ? 'bg-orange-500' :
                                                        'bg-green-500'
                                                    }`} />

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-wrap justify-between gap-2 mb-1">
                                                        <span className="font-medium text-sm">
                                                            {log.action}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground font-mono">
                                                            {new Date(log.created_at).toLocaleString()}
                                                        </span>
                                                    </div>

                                                    <p className="text-sm text-muted-foreground mb-2">
                                                        {t('action_on', { resource: log.resource })}
                                                    </p>

                                                    {log.details && (
                                                        <div className="bg-background rounded-lg p-2 text-xs font-mono text-muted-foreground overflow-x-auto border border-border/50">
                                                            {JSON.stringify(log.details).slice(0, 200)}
                                                            {JSON.stringify(log.details).length > 200 && '...'}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </GlassCard>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="notifications" className="mt-0">
                    <GlassCard className="p-6 min-h-[600px] flex flex-col">
                        <div className="flex items-center gap-2 mb-6">
                            <Bell className="w-5 h-5 text-primary" />
                            <h3 className="font-semibold text-lg">Notifications</h3>
                        </div>
                        <NotificationList />
                    </GlassCard>
                </TabsContent>
            </Tabs>

            <SidebarCustomizer
                isOpen={isCustomizerOpen}
                onClose={() => setIsCustomizerOpen(false)}
                onSave={handleSidebarSave}
            />
        </div>
    );
}
