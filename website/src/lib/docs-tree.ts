import type * as PageTree from 'fumadocs-core/page-tree';

const guideFolders = ['getting-started', 'concepts', 'guides', 'layouts', 'interactions', 'advanced'];

export function getDocsNavigationTree(tree: PageTree.Root): PageTree.Root {
  const docsChildren = [
    findPageByUrl(tree, '/docs'),
    findPageByUrl(tree, '/docs/faq'),
    findPageByUrl(tree, '/docs/changelog'),
  ].filter((node): node is PageTree.Item => Boolean(node));

  const guideChildren = guideFolders
    .map((folder) => findFolderByPath(tree, folder))
    .filter((node): node is PageTree.Folder => Boolean(node))
    .map((node) => cloneNode(node));

  const examplesFolder = findFolderByPath(tree, 'examples');
  const metricsFolder = findFolderByPath(tree, 'metrics');
  const apiFolder = findFolderByPath(tree, 'api');

  const children: PageTree.Node[] = [
    createRootFolder('docs', '文档', docsChildren),
    createRootFolder('guide', '指南', guideChildren),
  ];

  if (examplesFolder) {
    children.push(createRootFolder('examples', '示例', examplesFolder.children.map((node) => cloneNode(node))));
  }

  if (metricsFolder) {
    children.push(createRootFolder('metrics', '指标', metricsFolder.children.map((node) => cloneNode(node))));
  }

  if (apiFolder) {
    children.push(createRootFolder('api', 'API 参考', apiFolder.children.map((node) => cloneNode(node))));
  }

  return {
    ...tree,
    $id: 'docs-navigation-root',
    children,
  };
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
  if (node.type !== 'folder') {
    return { ...node };
  }

  return {
    ...node,
    root: false,
    defaultOpen: node.defaultOpen ?? true,
    children: node.children.map((child) => cloneNode(child)),
    index: node.index ? { ...node.index } : undefined,
  };
}

function findPageByUrl(tree: PageTree.Root, url: string): PageTree.Item | undefined {
  return findNode(tree.children, (node): node is PageTree.Item => node.type === 'page' && node.url === url);
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
