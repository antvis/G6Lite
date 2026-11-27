import 'server-only';
import { codeToHtml } from 'shiki';

import type { Locale } from '@/lib/i18n';
import type { ShowcaseCode, ShowcaseId, ShowcaseTheme } from './showcase-catalog';
import { showcaseOptions } from './showcase-examples';

/** Highlight at build time; the browser receives one selected source and markup. */
export async function createShowcaseCode(
  id: ShowcaseId,
  locale: Locale,
  theme: ShowcaseTheme,
): Promise<ShowcaseCode> {
  const source = showcaseSource(id, locale, theme === 'dark');
  return { source, html: await codeToHtml(source, { lang: 'ts', theme: 'github-dark' }) };
}

export function showcaseSource(id: ShowcaseId, locale: Locale, dark = false): string {
  const { data, ...options } = showcaseOptions(id, locale, dark);
  // These callbacks are self-contained; preserve them in the copied source.
  const callbacks: string[] = [];
  const config = JSON.stringify(
    options,
    (key, value) => {
      if (key === 'type' && typeof value === 'function' && value.name) {
        return `__layout_class_${value.name}__`;
      }
      if (typeof value !== 'function') return value;
      const token = `__showcase_callback_${callbacks.length}__`;
      let source = value.toString();
      // LayoutConfig accepts arbitrary options, so getSide needs an explicit
      // parameter type in the copied TypeScript rather than contextual typing.
      if (key === 'getSide') {
        source = source.replace(
          /^\(?([\w$]+)\)?\s*=>/,
          '($1: { data?: Record<string, unknown> }) =>',
        );
      }
      callbacks.push(source);
      return token;
    },
    2,
  )
    .replace(/"__showcase_callback_(\d+)__"/g, (_match, index) => callbacks[Number(index)])
    .replace(/"__layout_class_(\w+)__"/g, '$1')
    .slice(2, -2);
  const nodes = data.nodes.map((node) => `    ${JSON.stringify(node)}`).join(',\n');
  const edges = data.edges.map((edge) => `    ${JSON.stringify(edge)}`).join(',\n');
  const layoutType = typeof options.layout === 'object' ? options.layout?.type : undefined;
  const layoutClass = typeof layoutType === 'function' ? layoutType.name : undefined;
  const imports = layoutClass
    ? `import { Graph } from '@antv/g6-lite';
import { ${layoutClass} } from '@antv/layout';`
    : "import { Graph } from '@antv/g6-lite';";
  return `${imports}

// HTML: <div id="container" style="height: 360px"></div>
const data = {
  nodes: [
${nodes}
  ],
  edges: [
${edges}
  ],
};

const graph = new Graph({
  container: '#container',
  data,
${config}
});

await graph.render();
${
  id === 'relationship'
    ? `
let highlightedEdges: string[] = [];
const clearHighlight = () => {
  graph.batchSetState(highlightedEdges.map((id) => ({ id, state: 'highlight', value: false })));
  highlightedEdges = [];
};
graph.on('node:pointerover', ({ nodeId }) => {
  clearHighlight();
  highlightedEdges = graph.getEdges()
    .filter((edge) => edge.source === nodeId || edge.target === nodeId)
    .map((edge) => edge.id);
  graph.batchSetState(highlightedEdges.map((id) => ({ id, state: 'highlight', value: true })));
});
graph.on('node:pointerleave', clearHighlight);
`
    : ''
}

// ${locale === 'zh' ? '组件卸载时调用 graph.destroy()。' : 'Call graph.destroy() when the component unmounts.'}`;
}
