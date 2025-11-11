/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n: {
    locales: ['en', 'it', 'fr', 'es', 'ar'],
    defaultLocale: 'en',
    localeDetection: true,
  },
};

export default nextConfig;
