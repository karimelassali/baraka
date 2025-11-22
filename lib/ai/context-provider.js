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
            .eq('is_verified', false); // Note: This depends on how is_verified is stored/calculated. 
        // If is_verified is not a column but calculated, we might need a different approach or just skip this detail for now.
        // Based on previous files, is_verified is calculated in the API. 
        // For simplicity in this context provider, we might just count total for now or check if there's a column.
        // Let's assume we just want total count for now to be safe, or check 'email_confirmed_at' on auth users which is harder from client.
        // Let's stick to total customers count from the 'customers' table.

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
        // contextString += `- Unverified: ${unverifiedClients || 0}\n`; // Commented out until we are sure about the column

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

        return contextString;

    } catch (error) {
        console.error("Error fetching admin context:", error);
        return `Current Date: ${formattedDate}\nError fetching system data.`;
    }
}
