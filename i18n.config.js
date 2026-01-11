// i18n.js or i18n.config.js
// Next.js internationalization configuration

/** @type {import('next-i18n').I18nConfig} */
const i18nConfig = {
  locales: ['en', 'it', 'fr', 'es', 'ar'],
  defaultLocale: 'it',
  localeDetection: false, // Prevent automatic detection to force default
  domains: [
    // Example configuration for different domains per language
    // {
    //   domain: 'example.fr',
    //   defaultLocale: 'fr',
    // },
    // {
    //   domain: 'example.it',
    //   defaultLocale: 'it',
    // },
  ],
};

module.exports = i18nConfig;