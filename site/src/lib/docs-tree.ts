import type * as PageTree from 'fumadocs-core/page-tree';
import { findNeighbour, flattenTree } from 'fumadocs-core/page-tree';
import type { Locale } from './i18n';
import { getManifestTree } from './docs-navigation-manifest';

// Ordering, grouping and page ownership come only from docs-navigation.json.
export function getDocsNavigationTree(tree: PageTree.Root, locale: Locale): PageTree.Root {
  return getManifestTree(tree, locale);
}

export function getDocsFooterItems(tree: PageTree.Root, locale: Locale, url: string) {
  const navigation = getDocsNavigationTree(tree, locale);
  const pages = flattenTree(navigation.children).filter((page) => !page.external && !page.url.includes('#'));
  return findNeighbour({ ...navigation, children: pages }, url, { separateRoot: false });
}
