import { redirect } from 'next/navigation';
import { routing } from '@/i18n/routing';

// Root-level not-found page
// This handles cases where the URL doesn't have a locale prefix
// We redirect to the default locale's 404 page

export default function RootNotFound() {
  // Redirect to the default locale's not-found page
  redirect(`/${routing.defaultLocale}`);
}
