const baseUrl = 'https://www.barakasrl.it';

export default function sitemap() {
    const locales = ['it', 'en', 'fr', 'es', 'ar'];
    const routes = ['', '/login', '/register', '/how-to-use/user'];

    let sitemapEntries = [];

    // Add default locale (it)
    routes.forEach((route) => {
        sitemapEntries.push({
            url: `${baseUrl}${route}`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: route === '' ? 1 : 0.8,
        });
    });

    // Add other locales if needed, but typically standard sitemap includes canonicals.
    // For simplicity and common Next.js patterns, usually we list all localized variants.

    locales.forEach((locale) => {
        routes.forEach((route) => {
            // Avoid duplicating default locale if it is handled at root, but usually app/[locale] structure handles all.
            // Assuming 'it' is default and mapped to root or /it depending on config.
            // With next-intl middleware, usually urls are /it/..., /en/...

            sitemapEntries.push({
                url: `${baseUrl}/${locale}${route}`,
                lastModified: new Date(),
                changeFrequency: 'weekly',
                priority: route === '' ? 1 : 0.8,
            });
        });
    });

    return sitemapEntries;
}
