import type * as PageTree from 'fumadocs-core/page-tree';

import type { Locale } from './i18n';

const labels = {
  zh: {
    gettingStarted: '快速开始',
    concepts: '核心概念',
    guides: '配置指南',
    api: 'API',
    examples: '示例',
    metrics: '技术指标',
    compatibility: '兼容性',
  },
  en: {
    gettingStarted: 'Quick start',
    concepts: 'Core concepts',
    guides: 'Configuration',
    api: 'API',
    examples: 'Examples',
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
  const examples = findFolderByPath(tree, 'examples');
  const metrics = findFolderByPath(tree, 'metrics');
  const compatibility = findFolderByPath(tree, 'compatibility');

  const children: PageTree.Node[] = [
    createRootFolder(
      'getting-started',
      text.gettingStarted,
      compactNodes([docsOverview, gettingStarted ? cloneNode(gettingStarted) : undefined]),
    ),
    createRootFolder(
      'concepts',
      text.concepts,
      concepts ? concepts.children.map((node) => cloneNode(node)) : [],
    ),
    createRootFolder(
      'guides',
      text.guides,
      guides ? guides.children.map((node) => cloneNode(node)) : [],
    ),
    createRootFolder('api', text.api, api ? api.children.map((node) => cloneNode(node)) : []),
    createRootFolder(
      'examples',
      text.examples,
      examples ? examples.children.map((node) => cloneNode(node)) : [],
    ),
    createRootFolder(
      'metrics',
      text.metrics,
      metrics ? metrics.children.map((node) => cloneNode(node)) : [],
    ),
    createRootFolder(
      'compatibility',
      text.compatibility,
      compactNodes([
        ...(compatibility ? compatibility.children.map((node) => cloneNode(node)) : []),
        faq,
        changelog,
      ]),
    ),
  ];

  return { ...tree, $id: `docs-navigation-root-${locale}`, children };
}

function compactNodes<T extends PageTree.Node>(nodes: Array<T | undefined>): T[] {
  return nodes.filter((node): node is T => node !== undefined);
}

function createRootFolder(id: string, name: string, children: PageTree.Node[]): PageTree.Folder {
  return {
    type: 'folder',
    $id: `docs-navigation-${id}`,
    name,
    root: true,
    defaultOpen: true,
    collapsible: false,
    children,
    index: findFirstPage(children),
  };
}

function findFirstPage(nodes: PageTree.Node[]): PageTree.Item | undefined {
  for (const node of nodes) {
    if (node.type === 'page') return node;
    if (node.type === 'folder') {
      const child = node.index ?? findFirstPage(node.children);
      if (child) return child;
    }
  }
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
