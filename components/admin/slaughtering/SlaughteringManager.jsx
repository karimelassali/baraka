'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SlaughteringForm from './SlaughteringForm';
import SlaughteringReports from './SlaughteringReports';
import { FileText, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function SlaughteringManager() {
    const t = useTranslations('Admin.Slaughtering');
    const tCommon = useTranslations('Common');
    const [activeTab, setActiveTab] = useState('entry');

    return (
        <div className="space-y-6">
            <Tabs defaultValue="entry" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2 mb-8 bg-red-50/50 p-1 border border-red-100/50 rounded-xl">
                    <TabsTrigger
                        value="entry"
                        className="flex items-center gap-2 data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg active:scale-95 transition-all rounded-lg"
                    >
                        <PlusCircle className="w-4 h-4" />
                        {t('tab_entry')}
                    </TabsTrigger>
                    <TabsTrigger
                        value="reports"
                        className="flex items-center gap-2 data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg active:scale-95 transition-all rounded-lg"
                    >
                        <FileText className="w-4 h-4" />
                        {t('tab_reports')}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="entry" className="mt-0">
                    <div className="max-w-4xl mx-auto">
                        <SlaughteringForm onSuccess={() => {
                            setActiveTab('reports');
                            toast.success(tCommon('save_success') || "Added successfully");
                        }} />
                    </div>
                </TabsContent>

                <TabsContent value="reports" className="mt-0">
                    <SlaughteringReports />
                </TabsContent>
            </Tabs>
        </div>
    );
}
