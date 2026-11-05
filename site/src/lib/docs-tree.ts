import type * as PageTree from 'fumadocs-core/page-tree';
import type { Locale } from './i18n';
import { getManifestTree } from './docs-navigation-manifest';

// Ordering, grouping and page ownership come only from docs-navigation.json.
export function getDocsNavigationTree(tree: PageTree.Root, locale: Locale): PageTree.Root {
  return getManifestTree(tree, locale);
}
