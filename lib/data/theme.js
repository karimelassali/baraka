import { unstable_cache } from 'next/cache';

export const getTheme = unstable_cache(
    async () => {
        try {
            // In a real scenario, you might fetch this from a database directly
            // to avoid an HTTP roundtrip to your own API.
            // For now, we'll simulate the fetch or use a direct DB call if possible.
            // Since we are server-side, we can't easily fetch our own API route with full URL unless we know the host.
            // A better pattern is to extract the logic from the API route into a shared function.

            // Assuming we want to default to 'default' if anything fails
            // You can replace this with your actual DB logic later
            return { theme: 'default' };
        } catch (error) {
            console.error('Error fetching theme:', error);
            return { theme: 'default' };
        }
    },
    ['site-theme'], // Cache key
    {
        revalidate: 3600, // Cache for 1 hour
        tags: ['theme'],
    }
);
