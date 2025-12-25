import { notFound } from 'next/navigation';
import OfferDetailView from '@/components/offers/OfferDetailView';

// Helper to determine base URL
const getBaseUrl = () => {
    if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    return 'http://localhost:3000';
};

// Function to generate metadata for rich link previews
export async function generateMetadata({ params }) {
    const { id, locale } = await params;

    try {
        // Fetch offer data internally
        const response = await fetch(`${getBaseUrl()}/api/offers/${id}?locale=${locale}`);
        const data = await response.json();

        if (!data.offer) return { title: 'Offer Not Found' };

        const offer = data.offer;

        return {
            title: `${offer.title} | Baraka Store`,
            description: offer.description.substring(0, 160),
            openGraph: {
                title: offer.title,
                description: offer.description.substring(0, 160),
                images: [new URL('/logo.jpeg', getBaseUrl()).toString()], // Absolute URL for robust preview
                type: 'website',
            },
            twitter: {
                card: 'summary_large_image',
                title: offer.title,
                description: offer.description.substring(0, 160),
                images: [new URL('/logo.jpeg', getBaseUrl()).toString()],
            },
        };
    } catch (error) {
        return { title: 'Baraka Store Offer' };
    }
}

async function getOffer(id, locale) {
    const url = `${getBaseUrl()}/api/offers/${id}?locale=${locale}`;
    console.log("Fetching Offer from:", url);

    try {
        const res = await fetch(url, {
            cache: 'no-store' // Ensure fresh data
        });

        if (!res.ok) return null;

        const data = await res.json();
        return data.offer;
    } catch (error) {
        console.error("Error fetching offer:", error);
        return null;
    }
}

export default async function OfferPage({ params }) {
    const { id, locale } = await params;
    const offer = await getOffer(id, locale);

    if (!offer) {
        notFound();
    }

    return <OfferDetailView offer={offer} locale={locale} />;
}
