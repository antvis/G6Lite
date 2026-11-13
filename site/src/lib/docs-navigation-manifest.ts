import type * as PageTree from 'fumadocs-core/page-tree';
import manifest from '../../docs-navigation.json';
import { localizedPath, type Locale } from './i18n';

type LocalizedTitle = Record<Locale, string>;
type Entry = string
  | { page: string; title?: LocalizedTitle; anchor?: string }
  | { id?: string; page?: string; title?: LocalizedTitle; children: Entry[] };
type Section = { id: string; title: LocalizedTitle; children: Entry[] };

function page(tree: PageTree.Root, ref: string, locale: Locale): PageTree.Item {
  const slug = ref === 'index' ? '' : ref.endsWith('/index') ? ref.slice(0, -6) : ref;
  const url = localizedPath('/docs' + (slug ? '/' + slug : ''), locale);
  const visit = (nodes: PageTree.Node[]): PageTree.Item | undefined => {
    for (const node of nodes) {
      if (node.type === 'page' && node.url === url) return node;
      if (node.type === 'folder') {
        if (node.index?.url === url) return node.index;
        const found = visit(node.children);
        if (found) return found;
      }
    }
  };
  const found = visit(tree.children);
  if (!found) throw new Error('Missing navigation page: ' + ref + ' (' + locale + ')');
  return { ...found };
}
function entry(tree: PageTree.Root, item: Entry, locale: Locale): PageTree.Node {
  if (typeof item === 'string') return page(tree, item, locale);
  if (!('children' in item)) {
    const node = page(tree, item.page, locale);
    return {
      ...node,
      name: item.title?.[locale] ?? node.name,
      url: item.anchor ? `${node.url}#${item.anchor}` : node.url,
    };
  }
  const index = item.page ? page(tree, item.page, locale) : undefined;
  return {
    type: 'folder', $id: 'docs-group-' + (item.id ?? item.page),
    name: item.title?.[locale] ?? index?.name ?? '',
    root: false, collapsible: true, defaultOpen: false, index,
    children: item.children.map((child) => entry(tree, child, locale)),
  };
}
export function getManifestSection(id: string, tree: PageTree.Root, locale: Locale): PageTree.Folder {
  const sections: Record<string, Section> = manifest.sections;
  const section = sections[id];
  if (!section) throw new Error('Unknown docs section: ' + id);
  return {
    type: 'folder', $id: 'docs-navigation-' + id, name: section.title[locale],
    root: false, collapsible: false, defaultOpen: true,
    children: section.children.map((item) => entry(tree, item, locale)),
  };
}

export function getManifestTree(tree: PageTree.Root, locale: Locale): PageTree.Root {
  return {
    ...tree, $id: 'docs-navigation-root-' + locale,
    children: [
      page(tree, manifest.overview, locale),
      ...manifest.order.map((item) => typeof item === 'string'
        ? getManifestSection(item, tree, locale)
        : entry(tree, item, locale)),
    ],
  };
}
