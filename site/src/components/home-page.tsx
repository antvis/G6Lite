import type { Locale } from '@/lib/i18n';
import { Homepage } from './homepage/homepage';

/** One shared implementation for both public homepages and compatibility previews. */
export function HomePage({ locale = 'zh' }: { locale?: Locale }) {
  return <Homepage locale={locale} />;
}
