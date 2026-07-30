import { DocsRouteLayout } from '@/components/docs-route-layout';
import { getDocsNavigationTree } from '@/lib/docs-tree';
import { baseOptions } from '@/lib/layout.shared';
import { source } from '@/lib/source';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import type { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  const tree = getDocsNavigationTree(source.getPageTree('en'), 'en');

  return (
    <HomeLayout {...baseOptions('en')}>
      <DocsRouteLayout locale="en" tree={tree}>
        {children}
      </DocsRouteLayout>
    </HomeLayout>
  );
}
