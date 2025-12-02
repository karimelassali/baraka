import { createClient } from '@/lib/supabase/client';

export async function getAdminContext() {
    const supabase = createClient();
    const today = new Date();
    const formattedDate = today.toLocaleDateString('it-IT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    try {
        // 1. Fetch Clients Summary
        const { count: totalClients, error: clientsError } = await supabase
            .from('customers')
            .select('*', { count: 'exact', head: true });

        const { count: unverifiedClients } = await supabase
            .from('customers')
            .select('*', { count: 'exact', head: true })
            .eq('is_verified', false);

        // 2. Fetch Active Offers
        const { data: activeOffers } = await supabase
            .from('offers')
            .select('title, discount_value, type')
            .eq('is_active', true);

        // 3. Fetch Recent Campaigns (if table exists, otherwise skip)
        const { data: recentCampaigns } = await supabase
            .from('campaigns')
            .select('name, status, sent_at')
            .order('created_at', { ascending: false })
            .limit(3);

        // 4. Fetch Reviews Stats
        const { count: approvedReviews } = await supabase
            .from('reviews')
            .select('*', { count: 'exact', head: true })
            .eq('is_approved', true);

        const { count: pendingReviews } = await supabase
            .from('reviews')
            .select('*', { count: 'exact', head: true })
            .eq('is_approved', false);

        // Format Context String
        let contextString = `Current Date: ${formattedDate}\n\n`;

        contextString += `📊 **System Status**:\n`;
        contextString += `- Total Clients: ${totalClients || 0}\n`;

        if (activeOffers && activeOffers.length > 0) {
            contextString += `\n🏷️ **Active Offers**:\n`;
            activeOffers.forEach(offer => {
                contextString += `- ${offer.title} (${offer.discount_value}${offer.type === 'percentage' ? '%' : '€'})\n`;
            });
        } else {
            contextString += `\n🏷️ **Active Offers**: None\n`;
        }

        if (recentCampaigns && recentCampaigns.length > 0) {
            contextString += `\n📢 **Recent Campaigns**:\n`;
            recentCampaigns.forEach(camp => {
                contextString += `- ${camp.name} (${camp.status})\n`;
            });
        }

        contextString += `\n⭐ **Reviews Status**:\n`;
        contextString += `- Approved: ${approvedReviews || 0}\n`;
        contextString += `- Pending/Not Approved: ${pendingReviews || 0}\n`;

        // 5. Admin Sidebar Knowledge Base
        contextString += `\n📚 **Admin Knowledge Base (Sidebar Structure)**:\n`;
        contextString += `1. **Dashboard** (/admin): Overview of stats, revenue, and quick actions.\n`;
        contextString += `2. **Customers** (/admin/customers): List of all registered clients. You can search, view details, and manage points.\n`;
        contextString += `3. **Offers** (/admin/offers): Manage loyalty offers. You can create, edit, or delete offers (Percentage or Fixed amount).\n`;
        contextString += `4. **Campaigns** (/admin/campaigns): Create and manage WhatsApp/Email campaigns. Filter clients by criteria.\n`;
        contextString += `5. **Reviews** (/admin/reviews): Moderate user reviews. Approve or delete reviews.\n`;
        contextString += `6. **Analytics** (/admin/analytics): Detailed charts and reports on revenue and user growth.\n`;
        contextString += `7. **Settings** (/admin/settings): System configuration, profile settings, and business details.\n`;
        contextString += `8. **Board** (/admin/board): A kanban-style board for managing tasks and notes.\n`;

        return contextString;

    } catch (error) {
        console.error("Error fetching admin context:", error);
        return `Current Date: ${formattedDate}\nError fetching system data.`;
    }
}
