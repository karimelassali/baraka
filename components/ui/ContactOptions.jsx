import { useTranslations } from 'next-intl';

export default function ContactOptions() {
  const t = useTranslations('Contact');

  return (
    <div className="text-lg text-gray-700 space-y-4">
      <p>
        <strong>{t('email')}:</strong> <a href="mailto:baraka.csg@gmail.com" className="text-red-600 hover:underline">baraka.csg@gmail.com</a>
      </p>
      <p>
        <strong>{t('phone')}:</strong> <a href="tel:+393245668944" className="text-red-600 hover:underline">+39 324 566 8944</a>
      </p>
    </div>
  );
}
