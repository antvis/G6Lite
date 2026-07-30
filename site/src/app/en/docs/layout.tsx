import { getDocsNavigationTree } from '@/lib/docs-tree';
import { baseOptions } from '@/lib/layout.shared';
import { source } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import type { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  const tree = getDocsNavigationTree(source.getPageTree('en'), 'en');

  return (
    <HomeLayout {...baseOptions('en')}>
      <DocsLayout
        tree={tree}
        nav={{ enabled: false }}
        searchToggle={{ enabled: false }}
        themeSwitch={{ enabled: false }}
      >
        {children}
      </DocsLayout>
    </HomeLayout>
  );
}
