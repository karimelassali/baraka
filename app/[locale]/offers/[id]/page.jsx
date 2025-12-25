import { notFound } from 'next/navigation';
import OfferDetailView from '@/components/offers/OfferDetailView';

// Helper to determine base URL
const getBaseUrl = () => {
    if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    return 'http://localhost:3000';
};

import { createAdminClient } from '@/lib/supabase/admin';

// Helper to fetch offer directly from DB
async function getOfferDirect(id, locale) {
    const supabase = createAdminClient();

    // Validate UUID format to prevent DB errors
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
        console.error("Invalid UUID format for offer:", id);
        return null;
    }

    try {
        const { data: offer, error } = await supabase
            .from('offers')
            .select(`
                *,
                category:offer_categories(*)
            `)
            .eq('id', id)
            .single();

        if (error || !offer) {
            console.error("Error fetching offer directly:", error || "No offer found");
            return null;
        }

        // Transform offer to use the requested locale (replicating API logic)
        return {
            id: offer.id,
            title: offer.title?.[locale] || offer.title?.en || 'Untitled Offer',
            description: offer.description?.[locale] || offer.description?.en || '',
            image_url: offer.image_url,
            offer_type: offer.offer_type,
            start_date: offer.start_date,
            end_date: offer.end_date,
            created_at: offer.created_at,
            is_popup: offer.is_popup,
            category_id: offer.category_id,
            category_name: offer.category?.name?.[locale] || offer.category?.name?.en,
            badge_text: offer.badge_text,
            is_active: offer.is_active
        };
    } catch (err) {
        console.error("Exception fetching offer:", err);
        return null;
    }
}

// Function to generate metadata for rich link previews
export async function generateMetadata({ params }) {
    const { id, locale } = await params;

    const offer = await getOfferDirect(id, locale);

    if (!offer) return { title: 'Offer Not Found' };

    return {
        title: `${offer.title} | Baraka Store`,
        description: offer.description.substring(0, 160),
        openGraph: {
            title: offer.title,
            description: offer.description.substring(0, 160),
            images: [new URL('/logo.jpeg', getBaseUrl()).toString()],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: offer.title,
            description: offer.description.substring(0, 160),
            images: [new URL('/logo.jpeg', getBaseUrl()).toString()],
        },
    };
}

export default async function OfferPage({ params }) {
    const { id, locale } = await params;
    const offer = await getOfferDirect(id, locale);

    if (!offer) {
        notFound();
    }

    return <OfferDetailView offer={offer} locale={locale} />;
}
