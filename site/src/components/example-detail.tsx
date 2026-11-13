import type { Locale } from '@/lib/i18n';
import { readSiteExampleHelper, readSiteExampleSource } from '@/lib/site-example-source';
import { ExampleDetailClient } from './example-detail-client';

// Preview, editor, copied code and Markdown all read the same executable file.
export function ExampleDetail({ id, locale }: { id: string; locale: Locale }) {
  return (
    <ExampleDetailClient
      id={id}
      locale={locale}
      initialSource={readSiteExampleSource(id)}
      helperFile={readSiteExampleHelper(id)}
    />
  );
}
