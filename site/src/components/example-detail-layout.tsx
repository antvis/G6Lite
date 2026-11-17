import type { ReactNode } from 'react';
import { DocsBody, DocsPage } from 'fumadocs-ui/layouts/docs/page';
import type { Locale } from '@/lib/i18n';
import { ExampleDirectory } from './example-directory';

export function ExampleDetailLayout({ children, locale }: { children: ReactNode; locale: Locale }) {
  return (
    <DocsPage toc={[]} full footer={{ enabled: false }}>
      <DocsBody className="examples-docs-body">
        <main className="example-detail-page not-prose">
          <ExampleDirectory locale={locale} />
          {children}
        </main>
      </DocsBody>
    </DocsPage>
  );
}
