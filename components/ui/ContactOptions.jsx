import { useTranslations } from 'next-intl';

export default function ContactOptions() {
  const t = useTranslations('Contact');

  return (
    <div className="text-lg text-gray-700 space-y-4">
      <p>
        <strong>{t('email')}:</strong> <a href="mailto:contact@baraka.com" className="text-red-600 hover:underline">contact@baraka.com</a>
      </p>
      <p>
        <strong>{t('phone')}:</strong> <a href="tel:+1234567890" className="text-red-600 hover:underline">+1234567890</a>
      </p>
    </div>
  );
}
