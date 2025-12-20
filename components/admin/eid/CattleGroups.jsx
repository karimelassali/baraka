"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Users, Check, Trash2, ChevronLeft, ChevronRight, Loader2, Search, Download, Edit, Eye, CheckCircle, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import GlassCard from '@/components/ui/GlassCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import CustomerSearch from './CustomerSearch';
import { toast } from 'sonner';
import { generateEidPdf } from '@/lib/eidPdfUtils';
import { useTranslations } from 'next-intl';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function CattleGroups() {
    const t = useTranslations('Admin.Eid.CattleGroups');
    const [groups, setGroups] = useState([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupWeight, setNewGroupWeight] = useState('');
    const [newGroupPrice, setNewGroupPrice] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState(null);
    const [statusFilters, setStatusFilters] = useState(['ALL']);
    const [loading, setLoading] = useState(true);
    const [cleanView, setCleanView] = useState(false);
    const currentYear = new Date().getFullYear();

    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit] = useState(10);
    const [stats, setStats] = useState({
        total_cattle: 0
    });

    useEffect(() => {
        fetchGroups();
        fetchStats();
    }, [page, statusFilters]);

    const fetchGroups = async () => {
        setLoading(true);
        try {
            let url = `/api/admin/eid/cattle?page=${page}&limit=${limit}`;
            if (!statusFilters.includes('ALL')) url += `&status=${statusFilters.join(',')}`;

            const response = await fetch(url);
            if (response.ok) {
                const result = await response.json();
                setGroups(result.data || []);
                setTotalPages(result.metadata?.totalPages || 1);
            }
        } catch (error) {
            console.error('Error fetching groups:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/admin/eid/stats');
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleCreateGroup = async () => {
        if (!newGroupName) return;
        try {
            const response = await fetch('/api/admin/eid/cattle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    group_name: newGroupName,
                    cattle_weight: newGroupWeight,
                    price: newGroupPrice
                })
            });
            if (response.ok) {
                toast.success(t('toast.created'));
                setIsCreateModalOpen(false);
                setIsCreateModalOpen(false);
                setNewGroupName('');
                setNewGroupWeight('');
                setNewGroupPrice('');
                fetchGroups();
            }
        } catch (error) {
            toast.error(t('toast.error_create'));
        }
    };

    const handleAddMember = async (groupId, customer, slotNumber) => {
        try {
            const response = await fetch('/api/admin/eid/cattle/members', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    group_id: groupId,
                    customer_id: customer.id,
                    member_number: slotNumber
                })
            });
            if (response.ok) {
                toast.success(t('toast.member_added'));
                fetchGroups();
            }
        } catch (error) {
            toast.error(t('toast.error_add_member'));
        }
    };

    const handleRemoveMember = async (memberId) => {
        try {
            const response = await fetch(`/api/admin/eid/cattle/members?id=${memberId}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                toast.success(t('toast.member_removed'));
                fetchGroups();
            }
        } catch (error) {
            toast.error(t('toast.error_remove_member'));
        }
    };

    const handleEditGroup = (group) => {
        setEditingGroup(group);
        setNewGroupName(group.group_name);
        setNewGroupWeight(group.cattle_weight || '');
        setNewGroupPrice(group.price || '');
        setIsEditModalOpen(true);
    };

    const handleUpdateGroup = async () => {
        if (!editingGroup) return;
        try {
            const response = await fetch('/api/admin/eid/cattle', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: editingGroup.id,
                    group_name: newGroupName,
                    cattle_weight: newGroupWeight,
                    price: newGroupPrice
                })
            });
            if (response.ok) {
                toast.success(t('toast.updated'));
                setIsEditModalOpen(false);
                setEditingGroup(null);
                setNewGroupName('');
                setNewGroupWeight('');
                setNewGroupPrice('');
                fetchGroups();
            }
        } catch (error) {
            toast.error(t('toast.error_update'));
        }
    };

    const handleTogglePaid = async (member) => {
        try {
            const response = await fetch('/api/admin/eid/cattle/members', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: member.id,
                    is_paid: !member.is_paid
                })
            });
            if (response.ok) {
                toast.success(t('toast.updated'));
                fetchGroups();
            }
        } catch (error) {
            toast.error(t('toast.error_update'));
        }
    };

    const handleDeleteGroup = async (groupId) => {
        if (!confirm(t('confirm_delete'))) return;
        try {
            const response = await fetch(`/api/admin/eid/cattle/${groupId}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                toast.success(t('toast.deleted'));
                fetchGroups();
            } else {
                toast.error(t('toast.error_delete'));
            }
        } catch (error) {
            toast.error(t('toast.error_delete'));
        }
    };

    const getGroupColor = (str) => {
        const colors = [
            'bg-gradient-to-r from-red-50 to-red-100 border-red-200 text-red-900',
            'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 text-blue-900',
            'bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-900',
            'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200 text-amber-900',
            'bg-gradient-to-r from-violet-50 to-violet-100 border-violet-200 text-violet-900',
            'bg-gradient-to-r from-cyan-50 to-cyan-100 border-cyan-200 text-cyan-900',
            'bg-gradient-to-r from-indigo-50 to-indigo-100 border-indigo-200 text-indigo-900',
            'bg-gradient-to-r from-rose-50 to-rose-100 border-rose-200 text-rose-900',
            'bg-gradient-to-r from-fuchsia-50 to-fuchsia-100 border-fuchsia-200 text-fuchsia-900',
            'bg-gradient-to-r from-lime-50 to-lime-100 border-lime-200 text-lime-900',
        ];
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    const handleDownloadPdf = () => {
        const columns = [t('pdf.slot'), t('pdf.customer'), t('pdf.phone'), t('pdf.status')];
        const multiData = groups.map(group => {
            const members = group.eid_cattle_members?.sort((a, b) => a.member_number - b.member_number) || [];
            const rows = members.map(member => [
                member.member_number,
                `${member.customers?.first_name} ${member.customers?.last_name}`,
                member.customers?.phone_number || '-',
                member.is_paid ? 'PAID' : 'PENDING'
            ]);

            return {
                title: group.group_name,
                details: {
                    [t('pdf.weight')]: `${group.cattle_weight || '-'} kg`,
                    [t('pdf.members')]: members.length,
                    [t('pdf.status')]: group.status
                },
                rows
            };
        });

        generateEidPdf({
            title: t('pdf.title'),
            columns,
            data: multiData,
            filename: `cattle_groups_all_${new Date().toISOString().split('T')[0]}`,
            multiTable: true,
            details: {
                [t('pdf.total_groups')]: groups.length
            }
        });
    };

    const handleDownloadGroupPdf = (group) => {
        const columns = [t('pdf.slot'), t('pdf.customer'), t('pdf.phone'), t('pdf.status')];
        const members = group.eid_cattle_members?.sort((a, b) => a.member_number - b.member_number) || [];
        const rows = members.map(member => [
            member.member_number,
            `${member.customers?.first_name} ${member.customers?.last_name}`,
            member.customers?.phone_number || '-',
            member.is_paid ? 'PAID' : 'PENDING'
        ]);

        generateEidPdf({
            title: `${t('pdf.group_report')}: ${group.group_name}`,
            columns,
            data: rows,
            filename: `group_${group.group_name}_${new Date().toISOString().split('T')[0]}`,
            details: {
                [t('pdf.group_name')]: group.group_name,
                [t('pdf.weight')]: `${group.cattle_weight || '-'} kg`,
                [t('pdf.status')]: group.status
            }
        });
    };



    // Filter by status locally if needed, but we are doing it via API now. 
    // However, search is local for now based on fetched data? 
    // The current search implementation filters the *fetched* groups. 
    // Ideally search should be API based too, but for now let's keep it consistent.
    // If status filter is applied via API, we just filter by search term here.

    const filteredGroups = groups.filter(g =>
        g.group_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.eid_cattle_members?.some(m =>
            m.customers?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.customers?.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-4 items-center mb-6">
                <div className="xl:col-span-2">
                    <h2 className="text-xl font-semibold text-red-700 whitespace-nowrap">{t('title')} {currentYear}</h2>
                </div>

                <div className="xl:col-span-2 flex items-center space-x-2">
                    <input
                        type="checkbox"
                        id="cleanView"
                        checked={cleanView}
                        onChange={(e) => setCleanView(e.target.checked)}
                        className="w-4 h-4 text-red-600 rounded focus:ring-red-500 border-gray-300"
                    />
                    <label htmlFor="cleanView" className="text-sm font-medium text-gray-700 cursor-pointer select-none whitespace-nowrap">
                        {t('clean_view')}
                    </label>
                </div>

                {!cleanView && (
                    <>
                        <div className="xl:col-span-2 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder={t('search_placeholder')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 w-full"
                            />
                        </div>

                        <div className="xl:col-span-4">
                            <div className="flex flex-wrap gap-1">
                                {['ALL', 'PENDING', 'PAID', 'COMPLETED'].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => {
                                            if (status === 'ALL') {
                                                setStatusFilters(['ALL']);
                                            } else {
                                                setStatusFilters(prev => {
                                                    if (prev.includes('ALL')) return [status];
                                                    if (prev.includes(status)) {
                                                        const newFilters = prev.filter(s => s !== status);
                                                        return newFilters.length === 0 ? ['ALL'] : newFilters;
                                                    }
                                                    return [...prev, status];
                                                });
                                            }
                                        }}
                                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${statusFilters.includes(status)
                                            ? 'bg-red-100 text-red-700 shadow-sm ring-1 ring-red-200 font-bold'
                                            : 'bg-muted/20 text-muted-foreground hover:bg-muted/30'
                                            }`}
                                    >
                                        {t(`status.${status.toLowerCase()}`)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="md:col-span-2 xl:col-span-2 flex justify-end gap-2">
                            <Button variant="outline" onClick={handleDownloadPdf} className="border-red-200 text-red-700 hover:bg-red-50">
                                <Download className="w-4 h-4 mr-2" />
                                PDF
                            </Button>
                            <Button onClick={() => {
                                setEditingGroup(null);
                                setNewGroupName('');
                                setNewGroupWeight('');
                                setNewGroupPrice('');
                                setIsCreateModalOpen(true);
                            }} className="bg-red-600 hover:bg-red-700 text-white whitespace-nowrap">
                                <Plus className="w-4 h-4 mr-2" />
                                {t('new_group')}
                            </Button>
                        </div>
                    </>
                )}
            </div>

            {/* Active Groups Stats Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <GlassCard className="p-6 border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">{t('stats.cattle_groups')}</p>
                            <h3 className="text-3xl font-bold text-green-900 mt-2">{stats.total_cattle}</h3>
                            <p className="text-xs text-muted-foreground mt-1">{t('stats.active_groups')}</p>
                        </div>
                        <div className="p-2 bg-green-100 rounded-full">
                            <Users className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                </GlassCard>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-red-500" />
                </div>
            ) : (
                <>
                    <div className={`grid grid-cols-1 ${cleanView ? 'md:grid-cols-2 lg:grid-cols-3' : 'lg:grid-cols-2'} gap-6`}>
                        {filteredGroups.map((group) => {
                            // Determine slots: at least 7, or more if there are more members
                            const maxMemberNum = group.eid_cattle_members?.reduce((max, m) => Math.max(max, m.member_number), 0) || 0;
                            const totalSlots = Math.max(7, maxMemberNum + 1);
                            const slots = Array.from({ length: totalSlots }, (_, i) => i + 1);

                            const headerStyle = getGroupColor(group.group_name);

                            return (
                                <Card key={group.id} className={`shadow-lg hover:shadow-xl transition-all duration-300 border-0 overflow-hidden ring-1 ring-black/5`}>
                                    <div className={`${headerStyle} p-4 border-b flex justify-between items-center`}>
                                        <div>
                                            <h3 className="text-lg font-bold flex items-center gap-2">
                                                {group.group_name}
                                                {!cleanView && (
                                                    <Badge variant={group.status === 'PAID' ? 'success' : 'secondary'} className={`text-xs font-normal ${group.status === 'PAID' ? 'bg-green-500/20 text-green-900' : 'bg-white/30 text-inherit'}`}>
                                                        {group.status}
                                                    </Badge>
                                                )}
                                            </h3>
                                            {!cleanView && <p className="text-xs opacity-80 font-medium mt-0.5">{t('card.weight')}: {group.cattle_weight || '-'} kg</p>}
                                        </div>
                                        {!cleanView && (
                                            <div className="flex gap-1">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-black/10 rounded-full text-inherit" onClick={() => handleEditGroup(group)} title={t('card.edit')}>
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-black/10 rounded-full text-inherit" onClick={() => handleDownloadGroupPdf(group)} title={t('card.download')}>
                                                    <Download className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-black/10 rounded-full text-inherit" onClick={() => handleDeleteGroup(group.id)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                    <CardContent className="p-0 bg-white">
                                        {!cleanView && (
                                            <div className="px-4 py-2 bg-gray-50 border-b flex justify-between items-center text-xs text-muted-foreground">
                                                <div className="flex gap-4">
                                                    <span>{t('card.price')}: <span className="font-semibold text-gray-900">{group.price ? `${group.price}€` : '-'}</span></span>
                                                </div>
                                            </div>
                                        )}
                                        <div className="divide-y divide-gray-100">
                                            {slots.map((slot) => {
                                                const member = group.eid_cattle_members?.find(m => m.member_number === slot);

                                                // In clean view, hide empty slots if desired, OR just show minimal info
                                                // User said "Just them - Nothing else", implying only filled slots or minimal UI
                                                // Let's hide empty slots in clean view to make it compact? 
                                                // Or keep structure but remove buttons/search?
                                                // "Just them" implies showing the people.
                                                if (cleanView && !member) return null;

                                                return (
                                                    <div key={slot} className={`p-3 flex items-center justify-between transition-colors ${member?.is_paid ? 'bg-green-50/30' : 'hover:bg-gray-50'} relative`} style={{ zIndex: totalSlots - slot }}>
                                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-sm ${member ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400 border border-gray-200'}`}>
                                                                {slot}
                                                            </div>
                                                            {member ? (
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="font-semibold text-sm text-gray-900 truncate">
                                                                        {member.customers?.first_name} {member.customers?.last_name}
                                                                    </div>
                                                                    {!cleanView && (
                                                                        <div className="text-xs text-gray-500 truncate">
                                                                            {member.customers?.phone_number}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                !cleanView && (
                                                                    <div className="flex-1 relative z-10">
                                                                        <CustomerSearch
                                                                            onSelect={(c) => c && handleAddMember(group.id, c, slot)}
                                                                            selectedCustomer={null}
                                                                        />
                                                                    </div>
                                                                )
                                                            )}
                                                        </div>

                                                        {member && !cleanView && (
                                                            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                                                                <Badge
                                                                    variant="outline"
                                                                    className={`cursor-pointer select-none transition-colors ${member.is_paid ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100'}`}
                                                                    onClick={() => handleTogglePaid(member)}
                                                                >
                                                                    {member.is_paid ? 'PAID' : 'PENDING'}
                                                                </Badge>
                                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-full" onClick={() => handleRemoveMember(member.id)}>
                                                                    <Trash2 className="w-3 h-3" />
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        {!cleanView && (
                                            <div className="p-2 bg-gray-50/50 text-center border-t border-gray-100">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-gray-500 hover:text-gray-900 hover:bg-gray-100 w-full font-medium"
                                                    onClick={() => {
                                                        toast.info(t('toast.add_slot_info'));
                                                    }}
                                                >
                                                    <Plus className="w-4 h-4 mr-2" />
                                                    {t('card.add_slot')}
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {!cleanView && (
                        <div className="flex items-center justify-between bg-muted/20 p-4 rounded-lg">
                            <div className="text-sm text-muted-foreground">
                                {t('page')} {page} {t('of')} {totalPages}
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            )
            }

            {/* Create Modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-red-700">{t('modal.create_title')}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t('modal.group_name')}</label>
                            <Input
                                value={newGroupName}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setNewGroupName(val.charAt(0).toUpperCase() + val.slice(1));
                                }}
                                placeholder={t('modal.group_placeholder')}
                                className="focus-visible:ring-red-500"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t('modal.weight')}</label>
                                <Input type="number" value={newGroupWeight} onChange={(e) => setNewGroupWeight(e.target.value)} className="focus-visible:ring-red-500" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t('modal.price')}</label>
                                <Input type="number" value={newGroupPrice} onChange={(e) => setNewGroupPrice(e.target.value)} className="focus-visible:ring-red-500" />
                            </div>
                        </div>
                        <Button onClick={handleCreateGroup} className="w-full bg-red-600 hover:bg-red-700">{t('modal.create_btn')}</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-red-700">{t('modal.edit_title')}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t('modal.group_name')}</label>
                            <Input
                                value={newGroupName}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setNewGroupName(val.charAt(0).toUpperCase() + val.slice(1));
                                }}
                                className="focus-visible:ring-red-500"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t('modal.weight')}</label>
                                <Input type="number" value={newGroupWeight} onChange={(e) => setNewGroupWeight(e.target.value)} className="focus-visible:ring-red-500" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t('modal.price')}</label>
                                <Input type="number" value={newGroupPrice} onChange={(e) => setNewGroupPrice(e.target.value)} className="focus-visible:ring-red-500" />
                            </div>
                        </div>
                        <Button onClick={handleUpdateGroup} className="w-full bg-red-600 hover:bg-red-700">{t('modal.update_btn')}</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div >
    );
}
