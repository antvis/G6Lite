import type * as PageTree from 'fumadocs-core/page-tree';
import manifest from '../../docs-navigation.json';
import { localizedPath, type Locale } from './i18n';

type Entry = string | { id?: string; page?: string; title?: { zh: string; en: string }; children: Entry[] };
type Section = { id: string; title: { zh: string; en: string }; children: Entry[] };

function page(tree: PageTree.Root, ref: string, locale: Locale): PageTree.Item {
  const slug = ref === 'index' ? '' : ref.replace(/\\/index$/, '');
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
