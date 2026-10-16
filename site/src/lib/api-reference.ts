import { statSync } from 'node:fs';
import path from 'node:path';
import Slugger from 'github-slugger';
import { toHtml } from 'hast-util-to-html';
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

type MarkdownNode = {
  type?: string;
  depth?: number;
  value?: string;
  children?: MarkdownNode[];
  data?: { hProperties?: Record<string, string> };
};

const referencePath = path.join(process.cwd(), 'src/data/api-reference.md');

let highlighterPromise: Promise<Highlighter> | null = null;
let rendered: { mtimeMs: number; html: string; toc: ApiReferenceTocItem[] } | null = null;

type HastNode = {
  type: string;
  tagName?: string;
  properties?: { className?: string[] };
  children?: HastNode[];
};

function wrapTables(node: HastNode) {
  if (!node.children) return;
  node.children = node.children.map((child) => {
    wrapTables(child);
    if (child.type !== 'element' || child.tagName !== 'table') return child;
    return {
      type: 'element',
      tagName: 'div',
      properties: { className: ['api-table'] },
      children: [child],
    };
  });
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
  const tree = remark().use(remarkGfm).parse(markdown) as MarkdownNode;
  const slugger = new Slugger();
  const toc: ApiReferenceTocItem[] = [];
  const codeNodes: MarkdownNode[] = [];

  visit(tree, (node: MarkdownNode) => {
    if (node.type === 'heading') {
      const title = toString(node);
      const id = slugger.slug(title);
      node.data ??= {};
      node.data.hProperties ??= {};
      node.data.hProperties.id = id;
      const depth = node.depth ?? 1;
      if (depth <= 3) {
        toc.push({
          title: title.replace(/([a-z0-9])([A-Z])/g, '$1\u200b$2'),
          url: `#${id}`,
          depth,
        });
      }
      return;
    }
    if (node.type === 'code') codeNodes.push(node);
  });

  const highlighter = await getHighlighter();
  for (let index = 0; index < codeNodes.length; index += 40) {
    const slice = codeNodes.slice(index, index + 40);
    await Promise.all(
      slice.map(async (node) => {
        const code = node.value ?? '';
        try {
          const highlighted = highlighter.codeToHtml(code, {
            lang: 'typescript',
            themes: { light: 'github-light', dark: 'github-dark' },
          });
          node.type = 'html';
          node.value = `<figure class="shiki not-prose api-code"><div class="api-code-viewport">${highlighted}</div></figure>`;
        } catch {
          node.type = 'html';
          node.value = `<figure class="shiki not-prose api-code"><div class="api-code-viewport"><pre><code>${escapeHtml(code)}</code></pre></div></figure>`;
        }
      }),
    );
  }

  const hast = (await remark()
    .use(remarkRehype, { allowDangerousHtml: true })
    .run(tree)) as HastNode;
  wrapTables(hast);
  const html = toHtml(hast, { allowDangerousHtml: true });
  rendered = { mtimeMs, html, toc };
  return rendered;
}
