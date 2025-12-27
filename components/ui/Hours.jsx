import { useTranslations } from 'next-intl';

export default function Hours() {
  const t = useTranslations('Hours');

  return (
    <ul className="text-lg text-gray-700 space-y-4">
      <li className="flex justify-between border-b border-gray-200 pb-2">
        <span>{t('weekdays')}:</span>
        <span className="font-semibold">9am - 8pm</span>
      </li>
      <li className="flex justify-between border-b border-gray-200 pb-2">
        <span>{t('saturday')}:</span>
        <span className="font-semibold">9am - 8pm</span>
      </li>
      <li className="flex justify-between">
        <span>{t('sunday')}:</span>
        <span className="font-semibold">9am - 8pm</span>
      </li>
    </ul>
  );
}
