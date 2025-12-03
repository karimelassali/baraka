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

        // 5. Admin Knowledge Base (Dynamic)
        const { data: knowledgeBase } = await supabase
            .from('agent_knowledge')
            .select('title, content, type')
            .eq('is_active', true);

        contextString += `\n📚 **Admin Knowledge Base**:\n`;

        if (knowledgeBase && knowledgeBase.length > 0) {
            // Group by type for better organization
            const routes = knowledgeBase.filter(k => k.type === 'route');
            const instructions = knowledgeBase.filter(k => k.type === 'instruction');
            const general = knowledgeBase.filter(k => k.type === 'general');

            if (routes.length > 0) {
                contextString += `\n**System Routes & Capabilities**:\n`;
                routes.forEach(item => {
                    contextString += `- ${item.content}\n`;
                });
            }

            if (instructions.length > 0) {
                contextString += `\n**Operational Instructions**:\n`;
                instructions.forEach(item => {
                    contextString += `- ${item.content}\n`;
                });
            }

            if (general.length > 0) {
                contextString += `\n**General Knowledge**:\n`;
                general.forEach(item => {
                    contextString += `- ${item.title}: ${item.content}\n`;
                });
            }
        } else {
            contextString += `No custom knowledge found. Using default protocols.\n`;
        }

        return contextString;

    } catch (error) {
        console.error("Error fetching admin context:", error);
        return `Current Date: ${formattedDate}\nError fetching system data.`;
    }
}
