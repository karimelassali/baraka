"use client";
import { useI18n } from '../../lib/i18n';

export default function CookiesPage() {
  const { t } = useI18n();
  return (
    <div>
      <h1>{t('cookies_title')}</h1>
      <p>{t('cookies_placeholder')}</p>
    </div>
  );
}
