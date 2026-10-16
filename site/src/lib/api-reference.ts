import { statSync } from 'node:fs';
import path from 'node:path';
import Slugger from 'github-slugger';
import { toHtml } from 'hast-util-to-html';
import type { Element, Root as HastRoot } from 'hast';
import type { Code, Heading, Html, Parent, Root } from 'mdast';
import { toString } from 'mdast-util-to-string';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import { createHighlighter, type Highlighter } from 'shiki';
import { visit } from 'unist-util-visit';
import { readApiReferenceMarkdown } from './api-reference-source';

export type ApiReferenceTocItem = {
  title: string;
  url: string;
  depth: number;
};

const referencePath = path.join(process.cwd(), 'src/data/api-reference.md');

let highlighterPromise: Promise<Highlighter> | null = null;
let rendered: { mtimeMs: number; html: string; toc: ApiReferenceTocItem[] } | null = null;

function wrapTables(node: HastRoot | Element) {
  for (let index = 0; index < node.children.length; index += 1) {
    const child = node.children[index];
    if (!child || child.type !== 'element') continue;
    wrapTables(child);
    if (child.tagName !== 'table') continue;
    const wrapper: Element = {
      type: 'element',
      tagName: 'div',
      properties: { className: ['api-table'] },
      children: [child],
    };
    node.children[index] = wrapper;
  }
}

function getHighlighter() {
  highlighterPromise ??= createHighlighter({
    themes: ['github-light', 'github-dark'],
    langs: ['typescript'],
  });
  return highlighterPromise;
}

function escapeHtml(value: string) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

/**
 * The generated reference is one TypeDoc page. Compiling it as MDX makes the
 * dev server run out of memory, so this renders the original markdown directly.
 */
export async function renderApiReference(): Promise<{ html: string; toc: ApiReferenceTocItem[] }> {
  const mtimeMs = statSync(referencePath).mtimeMs;
  if (rendered?.mtimeMs === mtimeMs) return rendered;

  const markdown = readApiReferenceMarkdown();
  const tree: Root = remark().use(remarkGfm).parse(markdown);
  const slugger = new Slugger();
  const toc: ApiReferenceTocItem[] = [];
  const codeNodes: { node: Code; index: number; parent: Parent }[] = [];

  visit(tree, 'heading', (node: Heading) => {
    const title = toString(node);
    const id = slugger.slug(title);
    node.data ??= {};
    node.data.hProperties = { ...node.data.hProperties, id };
    if (node.depth <= 3) {
      toc.push({
        title: title.replace(/([a-z0-9])([A-Z])/g, '$1\u200b$2'),
        url: `#${id}`,
        depth: node.depth,
      });
    }
  });
  visit(tree, 'code', (node: Code, index, parent) => {
    if (!parent || typeof index !== 'number') return;
    codeNodes.push({ node, index, parent });
  });

  const highlighter = await getHighlighter();
  for (let index = 0; index < codeNodes.length; index += 40) {
    const slice = codeNodes.slice(index, index + 40);
    await Promise.all(
      slice.map(async ({ node, index: childIndex, parent }) => {
        const code = node.value;
        let value: string;
        try {
          const highlighted = highlighter.codeToHtml(code, {
            lang: 'typescript',
            themes: { light: 'github-light', dark: 'github-dark' },
          });
          value = `<figure class="shiki not-prose api-code"><div class="api-code-viewport">${highlighted}</div></figure>`;
        } catch {
          value = `<figure class="shiki not-prose api-code"><div class="api-code-viewport"><pre><code>${escapeHtml(code)}</code></pre></div></figure>`;
        }
        const replacement: Html = { type: 'html', value };
        parent.children[childIndex] = replacement;
      }),
    );
  }

  const hast = (await remark()
    .use(remarkRehype, { allowDangerousHtml: true })
    .run(tree)) as unknown as HastRoot;
  wrapTables(hast);
  const html = toHtml(hast, { allowDangerousHtml: true });
  rendered = { mtimeMs, html, toc };
  return rendered;
}
