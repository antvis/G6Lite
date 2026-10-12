'use client';

import type * as PageTree from 'fumadocs-core/page-tree';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

import { localizedPath, type Locale } from '@/lib/i18n';

export function DocsRouteLayout({
  children,
  locale,
  tree,
}: {
  children: ReactNode;
  locale: Locale;
  tree: PageTree.Root;
}) {
  const pathname = usePathname();
  const examplesRoot = localizedPath('/docs/examples', locale);
  const isExamplesRoute = pathname === examplesRoot || pathname.startsWith(`${examplesRoot}/`);

  return (
    <DocsLayout
      tree={tree}
      nav={{ enabled: false }}
      searchToggle={{ enabled: false }}
      themeSwitch={{ enabled: false }}
      sidebar={{ enabled: !isExamplesRoute }}
      containerProps={{
        className: isExamplesRoute ? 'examples-route-layout' : 'docs-brand-layout',
      }}
    >
      {children}
    </DocsLayout>
  );
}
