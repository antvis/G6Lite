import type { Locale } from '@/lib/i18n';
import { ExampleShowcase } from './example-showcase';
import { createShowcaseCode } from './showcase-code.server';
import { homepageCopy } from './content';

/** Only the initially selected example is serialized into the homepage. */
export async function FeaturedExamples({ locale }: { locale: Locale }) {
  const initialCode = await createShowcaseCode('relationship', locale, 'light');
  return (
    <ExampleShowcase
      locale={locale}
      copy={homepageCopy[locale].examples}
      initialCode={initialCode}
    />
  );
}
