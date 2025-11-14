// app/page.js
import { redirect } from 'next/navigation';
import { defaultLocale } from './i18n.config.js';

export default function RootPage() {
  redirect(`/${defaultLocale}`);
}
