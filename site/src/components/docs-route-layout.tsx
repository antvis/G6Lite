'use client';

import type * as PageTree from 'fumadocs-core/page-tree';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { SidebarTrigger } from 'fumadocs-ui/components/sidebar/base';
import { ListTree } from 'lucide-react';
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
      sidebar={{ enabled: !isExamplesRoute, collapsible: false }}
      containerProps={{
        className: isExamplesRoute ? 'examples-route-layout' : 'docs-brand-layout',
      }}
    >
      {!isExamplesRoute && (
        <SidebarTrigger className="docs-mobile-directory" aria-label={locale === 'zh' ? '打开文档目录' : 'Open documentation navigation'}>
          <ListTree size={18} aria-hidden="true" />
          {locale === 'zh' ? '文档目录' : 'Docs navigation'}
        </SidebarTrigger>
      )}
      {children}
    </DocsLayout>
  );
}
