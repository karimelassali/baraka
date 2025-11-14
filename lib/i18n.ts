// lib/i18n.ts
import { createI18n } from 'next-international';

export const {
    useI18n,
    useScopedI18n,
    I18nProvider,
    getLocaleProps,
    useChangeLocale,
    useCurrentLocale
} = createI18n({
  'en': () => import('../locales/en.json'),
  'it': () => import('../locales/it.json'),
  'fr': () => import('../locales/fr.json'),
  'es': () => import('../locales/es.json'),
  'ar': () => import('../locales/ar.json'),
});
