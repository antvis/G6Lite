import { codeToHtml } from 'shiki';

import type { Locale } from '@/lib/i18n';
import { ExampleShowcase } from './example-showcase';
import { showcaseIds, showcaseSource } from './showcase-examples';

/** Highlight the same options used by each live example, for both themes. */
export async function FeaturedExamples({ locale }: { locale: Locale }) {
  const examples = await Promise.all(
    showcaseIds.map(async (id) => {
      const light = showcaseSource(id, locale);
      const dark = showcaseSource(id, locale, true);
      return {
        id,
        light,
        dark,
        lightHtml: await codeToHtml(light, { lang: 'ts', theme: 'github-dark' }),
        darkHtml: await codeToHtml(dark, { lang: 'ts', theme: 'github-dark' }),
      };
    }),
  );
  return <ExampleShowcase locale={locale} examples={examples} />;
}
