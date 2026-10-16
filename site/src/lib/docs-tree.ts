import type * as PageTree from 'fumadocs-core/page-tree';

import type { Locale } from './i18n';

const labels = {
  zh: {
    gettingStarted: '快速开始',
    concepts: '核心概念',
    guides: '配置指南',
    api: 'API 参考',
    metrics: '技术指标',
    compatibility: '兼容性',
  },
  en: {
    gettingStarted: 'Quick start',
    concepts: 'Core concepts',
    guides: 'Configuration',
    api: 'API reference',
    metrics: 'Technical metrics',
    compatibility: 'Compatibility',
  },
} as const;

export function getDocsNavigationTree(tree: PageTree.Root, locale: Locale): PageTree.Root {
  const text = labels[locale];
  const docsOverview = findPageByUrl(tree, locale === 'en' ? '/en/docs' : '/docs');
  const faq = findPageByUrl(tree, locale === 'en' ? '/en/docs/faq' : '/docs/faq');
  const changelog = findPageByUrl(tree, locale === 'en' ? '/en/docs/changelog' : '/docs/changelog');

  const gettingStarted = findFolderByPath(tree, 'getting-started');
  const concepts = findFolderByPath(tree, 'concepts');
  const guides = findFolderByPath(tree, 'guides');
  const api = findFolderByPath(tree, 'api');
  const metrics = findFolderByPath(tree, 'metrics');
  const compatibility = findFolderByPath(tree, 'compatibility');

  const children: PageTree.Node[] = [
    createSection(
      'getting-started',
      text.gettingStarted,
      sectionPages(gettingStarted, [docsOverview]),
    ),
    createSection('concepts', text.concepts, sectionPages(concepts)),
    createSection('guides', text.guides, sectionPages(guides)),
    createSection('api', text.api, sectionPages(api)),
    createSection('metrics', text.metrics, sectionPages(metrics)),
    createSection('compatibility', text.compatibility, sectionPages(compatibility)),
    ...compactNodes([faq, changelog]),
  ];

  return { ...tree, $id: `docs-navigation-root-${locale}`, children };
}

function compactNodes<T extends PageTree.Node>(nodes: Array<T | undefined>): T[] {
  return nodes.filter((node): node is T => node !== undefined);
}

function sectionPages(
  folder: PageTree.Folder | undefined,
  leading: Array<PageTree.Node | undefined> = [],
): PageTree.Node[] {
  const children = folder ? folder.children.map((node) => cloneNode(node)) : [];
  const index = folder?.index;
  const indexListed =
    !index || children.some((node) => node.type === 'page' && node.url === index.url);
  return compactNodes([...leading, index && !indexListed ? { ...index } : undefined, ...children]);
}

/** A visible section. `root` stays off so the sidebar never swaps to a single chapter. */
function createSection(id: string, name: string, children: PageTree.Node[]): PageTree.Folder {
  return {
    type: 'folder',
    $id: `docs-navigation-${id}`,
    name,
    root: false,
    defaultOpen: true,
    collapsible: false,
    children,
  };
}

function cloneNode<T extends PageTree.Node>(node: T): T {
  if (node.type !== 'folder') return { ...node };

  return {
    ...node,
    root: false,
    defaultOpen: node.defaultOpen ?? true,
    children: node.children.map((child) => cloneNode(child)),
    index: node.index ? { ...node.index } : undefined,
  };
}

function findPageByUrl(tree: PageTree.Root, url: string): PageTree.Item | undefined {
  return findNode(
    tree.children,
    (node): node is PageTree.Item => node.type === 'page' && node.url === url,
  );
}

function findFolderByPath(tree: PageTree.Root, folder: string): PageTree.Folder | undefined {
  return findNode(
    tree.children,
    (node): node is PageTree.Folder => node.type === 'folder' && node.$ref?.folder === folder,
  );
}

function findNode<T extends PageTree.Node>(
  nodes: PageTree.Node[],
  predicate: (node: PageTree.Node) => node is T,
): T | undefined {
  for (const node of nodes) {
    if (predicate(node)) return node;
    if (node.type === 'folder') {
      const child = findNode(node.children, predicate);
      if (child) return child;
    }
  }
}
