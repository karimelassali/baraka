import { notFound } from 'next/navigation';
import OfferDetailView from '@/components/offers/OfferDetailView';

// Function to generate metadata for rich link previews
export async function generateMetadata({ params }) {
    const { id, locale } = await params;

    try {
        // Fetch offer data internally
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/offers/${id}?locale=${locale}`);
        const data = await response.json();

        if (!data.offer) return { title: 'Offer Not Found' };

        const offer = data.offer;

        return {
            title: `${offer.title} | Baraka Store`,
            description: offer.description.substring(0, 160),
            openGraph: {
                title: offer.title,
                description: offer.description.substring(0, 160),
                images: [offer.image_url || '/illus/undraw_gift-joy_kqz4.svg'],
                type: 'website',
            },
            twitter: {
                card: 'summary_large_image',
                title: offer.title,
                description: offer.description.substring(0, 160),
                images: [offer.image_url || '/illus/undraw_gift-joy_kqz4.svg'],
            },
        };
    } catch (error) {
        return { title: 'Baraka Store Offer' };
    }
}

async function getOffer(id, locale) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/offers/${id}?locale=${locale}`, {
        cache: 'no-store' // Ensure fresh data
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.offer;
}

export default async function OfferPage({ params }) {
    const { id, locale } = await params;
    const offer = await getOffer(id, locale);

    if (!offer) {
        notFound();
    }

    return <OfferDetailView offer={offer} locale={locale} />;
}
