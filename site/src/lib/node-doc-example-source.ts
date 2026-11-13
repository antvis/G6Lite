import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { BuiltInLayoutExample } from '../../demos/docs-built-in-layout.ts';

type RegisteredNodeDocExampleId = Exclude<NodeDocExampleId, 'built-in-layout'>;

export type NodeDocExampleId = 'demo-drag-canvas' | 'demo-click-select' | 'demo-brush-select' | 'demo-lasso-select' | 'demo-highlight-node' | 'demo-highlight-edge' | 'behavior-drag-node' | 'behavior-drag-edge' | 'behavior-zoom-pan' | 'built-in-layout' | 'graph-options' | 'parallel-workflow' | 'self-loops' | 'extension-plugin' | 'extension-transform' | 'extension-layout' | 'extension-decoration' | 'extension-label' | 'extension-edge' | 'extension-node' | 'polyline-orth' | 'body' | 'style' | 'labels' | 'node-icons' | 'label-options' | 'badges' | 'edge-style' | 'edge-hit-area' | 'edge-parallel' | 'edge-curves' | 'edge-cubic' | 'edge-orth' | 'edge-indented' | 'edge-labels' | 'combo-data' | 'combo-style' | 'combo-collapsed' | 'combo-states' | 'combo-membership' | 'label-policy' | 'theme-switch' | 'theme-precedence' | 'layout-switch' | 'layout-networks' | 'layout-tree' | 'layout-worker' | 'layout-result' | 'behavior-switch' | 'behavior-selection' | 'behavior-highlight' | 'behavior-custom' | 'behavior-tooltip' | 'behavior-tooltip-hover' | 'events-listen' | 'events-lifecycle' | 'state-concept' | 'state-preserve' | 'viewport-concept' | 'viewport-preserve' | 'state-visibility' | 'viewport-resize' | 'viewport-zoom-to' | 'viewport-zoom-by' | 'graph-lifecycle' | 'data-workflow' | 'combo-operations' | 'dependency-graph' | 'node-halo' | 'node-updates' | 'breathing-node' | 'edge-state-styles' | 'edge-updates' | 'edge-arrows' | 'edge-dashes';
const files: Record<RegisteredNodeDocExampleId, string> = {
  'parallel-workflow': 'docs-parallel-workflow.ts',
  'self-loops': 'docs-self-loops.ts',
  'extension-plugin': 'docs-extension-plugin.ts',
  'extension-transform': 'docs-extension-transform.ts',
  'extension-layout': 'docs-extension-layout.ts',
  'extension-decoration': 'docs-extension-decoration.ts',
  'extension-label': 'custom-label-renderer.ts',
  'extension-edge': 'docs-extension-edge.ts',
  'extension-node': 'docs-extension-node.ts',
  'breathing-node': 'breathing-node.ts',
  body: 'docs-node-body.ts',
  style: 'docs-node-style.ts',
  labels: 'docs-node-labels.ts',
  'node-icons': 'docs-node-icons.ts',
  'node-halo': 'docs-node-halo.ts',
  'node-updates': 'docs-node-updates.ts',
  'label-options': 'docs-node-label-options.ts',
  badges: 'docs-node-badges.ts',
  'edge-style': 'docs-edge-style.ts',
  'edge-arrows': 'edge-arrows.ts',
  'edge-dashes': 'docs-edge-dashes.ts',
  'edge-state-styles': 'docs-edge-state-styles.ts',
  'edge-updates': 'docs-edge-updates.ts',
  'edge-hit-area': 'docs-edge-hit-area.ts',
  'edge-parallel': 'docs-edge-parallel.ts',
  'edge-curves': 'docs-edge-curves.ts',
  'edge-cubic': 'docs-edge-cubic.ts',
  'edge-orth': 'polyline-routing.ts',
  'polyline-orth': 'docs-polyline-orth.ts',
  'edge-indented': 'docs-edge-indented.ts',
  'edge-labels': 'docs-edge-labels.ts',
  'combo-data': 'docs-combo-data.ts',
  'combo-style': 'docs-combo-style.ts',
  'combo-collapsed': 'docs-combo-collapsed.ts',
  'combo-states': 'docs-combo-states.ts',
  'combo-membership': 'docs-combo-membership.ts',
  'label-policy': 'docs-label-policy.ts',
  'theme-switch': 'docs-theme-switch.ts',
  'theme-precedence': 'docs-theme-precedence.ts',
  'layout-switch': 'docs-layout-switch.ts',
  'layout-networks': 'docs-layout-networks.ts',
  'layout-tree': 'docs-layout-tree.ts',
  'layout-worker': 'docs-layout-worker.ts',
  'layout-result': 'docs-layout-result.ts',
  'behavior-switch': 'docs-behavior-switch.ts',
  'behavior-zoom-pan': 'zoom-options.ts',
  'demo-drag-canvas': 'docs-individual-behaviors.ts',
  'demo-click-select': 'docs-individual-behaviors.ts',
  'demo-brush-select': 'docs-individual-behaviors.ts',
  'demo-lasso-select': 'docs-individual-behaviors.ts',
  'demo-highlight-node': 'docs-individual-behaviors.ts',
  'demo-highlight-edge': 'docs-individual-behaviors.ts',
  'behavior-drag-node': 'drag-node.ts',
  'behavior-drag-edge': 'drag-edge.ts',
  'behavior-selection': 'docs-behavior-selection.ts',
  'behavior-highlight': 'docs-behavior-highlight.ts',
  'behavior-custom': 'docs-behavior-custom.ts',
  'behavior-tooltip': 'docs-behavior-tooltip.ts',
  'behavior-tooltip-hover': 'docs-behavior-tooltip-hover.ts',
  'events-listen': 'docs-events-listen.ts',
  'events-lifecycle': 'docs-events-lifecycle.ts',
  'state-concept': 'docs-state-concept.ts',
  'state-preserve': 'docs-state-preserve.ts',
  'viewport-concept': 'docs-viewport-concept.ts',
  'viewport-preserve': 'docs-viewport-preserve.ts',
  'state-visibility': 'docs-state-visibility.ts',
  'viewport-resize': 'docs-viewport-resize.ts',
  'viewport-zoom-to': 'docs-viewport-zoom.ts',
  'viewport-zoom-by': 'docs-viewport-zoom.ts',
  'graph-lifecycle': 'docs-graph-lifecycle.ts',
  'graph-options': 'docs-graph-options.ts',
  'data-workflow': 'docs-data-workflow.ts',
  'combo-operations': 'docs-combo-operations.ts',
  'dependency-graph': 'dependency-graph.ts',
};

export function readNodeDocExample(id: RegisteredNodeDocExampleId) {
  const demos = path.join(process.cwd(), 'demos');
  const source = readFileSync(path.join(demos, files[id]), 'utf8');
  if (files[id] === 'docs-individual-behaviors.ts') {
    const configuration = getNodeDocExampleSnippet(source, id)
      .replace(/^'[^']+': /, '')
      .replace(/,$/, '');
    const render = getNodeDocExampleSnippet(source, 'render-graph');
    return [
      "import { Graph, type BehaviorOption } from '@antv/g6-lite';",
      '',
      'export async function run(container: HTMLElement) {',
      '  // #region behavior-config',
      `  const behaviors: BehaviorOption[] = ${configuration};`,
      '  // #endregion behavior-config',
      '',
      ...render.split('\n').map((line) => line ? `  ${line}` : ''),
      '}',
    ].join('\n');
  }
  const panelImport = "import { createDemoPanel } from './demo-panel.ts';";
  if (!source.includes(panelImport)) return source;

  // Include the shared panel implementation so the copied example runs as one file.
  const panel = readFileSync(path.join(demos, 'demo-panel.ts'), 'utf8').trimEnd();
  const endOfImport = panel.indexOf('\n');
  return source.replace(panelImport, panel.slice(0, endOfImport)).trimEnd() + '\n' + panel.slice(endOfImport) + '\n';
}

export function readBuiltInLayoutExample(type: BuiltInLayoutExample) {
  const source = readFileSync(path.join(process.cwd(), 'demos', 'docs-built-in-layout.ts'), 'utf8');
  const config = getNodeDocExampleSnippet(source, `layout-${type}-config`).replace(/^'[^']+': /, '').replace(/,$/, '');
  const dedicatedExample = type === 'concentric' || type === 'fishbone';
  const dataRegion = dedicatedExample ? type
    : type === 'mindmap' || type === 'indented'
    ? 'tree'
    : type === 'grid' || type === 'circular' || type === 'dagre' || type === 'random'
      ? 'arrangement'
      : 'network';
  const [mainImport] = source.split('\n');
  const layoutImport = source.split('\n').find((line) => line.endsWith(`'@antv/g6-lite/layouts/${type}';`));
  const layoutName = layoutImport?.split(' ')[1];
  const registration = layoutName ? `  register('layout', '${type}', ${layoutName});\n` : '';
  const code = [
    type === 'mindmap' ? mainImport : mainImport.replace(', type GraphNode', ''),
    ...(layoutImport ? [layoutImport] : []),
    getNodeDocExampleSnippet(source, 'shared-types'),
    getNodeDocExampleSnippet(source, dataRegion),
    getNodeDocExampleSnippet(source, 'render'),
    `export function run(container: HTMLElement) {
${registration}  const layout: LayoutConfig = ${config.replaceAll('\n', '\n  ')};
  return render(container, layout, ${dataRegion}(${dedicatedExample ? '' : 'layout.type'}));
}`,
  ].join('\n\n');
  const registrationImport = layoutImport ? "import { register } from '@antv/g6-lite';" : undefined;
  const excerpt = [registrationImport, layoutImport, registration.trim(), `const layout = ${config};`].filter(Boolean).join('\n\n');
  return { code, excerpt: type === 'fishbone' ? `${excerpt}\n\n${getNodeDocExampleSnippet(source, 'edge-router')}` : excerpt };
}

// Excerpts are selected from the executable source, never maintained as a copy.
export function getNodeDocExampleSnippet(source: string, focus: string) {
  if (!/^[a-z0-9-]+$/.test(focus)) throw new Error('Invalid example excerpt');
  const start = `// #region ${focus}`;
  const end = `// #endregion ${focus}`;
  if (source.split(start).length !== 2 || source.split(end).length !== 2) {
    throw new Error(`Unknown or repeated example excerpt: ${focus}`);
  }
  const excerpt = source.slice(source.indexOf(start) + start.length, source.indexOf(end)).replace(/^\n/, '').trimEnd();
  if (!excerpt.trim()) throw new Error(`Empty example excerpt: ${focus}`);
  const indent = Math.min(...excerpt.split('\n').filter((line) => line.trim()).map((line) => /^ */.exec(line)![0].length));
  return excerpt.split('\n').map((line) => line.slice(indent)).join('\n');
}

// Copy Markdown and LLM text need the same runnable code as the HTML page,
// rather than an MDX component placeholder.
export function expandNodeDocExamples(markdown: string) {
  return markdown.replace(/<(?:NodeDocExample|EdgeDocExample|ComboDocExample|LabelDocExample|ThemeDocExample|LayoutDocExample|BehaviorDocExample|EventDocExample|StateDocExample)\b([^>]*)\/>/g, (_match, attributes: string) => {
    const id = /\bid="([a-z-]+)"/.exec(attributes)?.[1];
    if (id === 'built-in-layout') {
      const type = /\blayoutType="([a-z0-9-]+)"/.exec(attributes)?.[1] as BuiltInLayoutExample | undefined;
      if (!type) throw new Error('Missing built-in layout type in Markdown');
      return `\n\n\`\`\`ts\n${readBuiltInLayoutExample(type).code}\n\`\`\`\n\n`;
    }
    if (!id || !Object.hasOwn(files, id)) throw new Error('Unknown inline configuration example in Markdown');
    if (/\bview="preview"/.test(attributes)) return '';
    const source = readNodeDocExample(id as RegisteredNodeDocExampleId).trimEnd();
    const focus = /\bfocus="([a-z-]+)"/.exec(attributes)?.[1];
    if (!focus) return `\n\n\`\`\`ts\n${source}\n\`\`\`\n\n`;
    const zh = /\blocale="zh"/.test(attributes);
    return `\n\n\`\`\`ts\n${getNodeDocExampleSnippet(source, focus)}\n\`\`\`\n\n**${zh ? '完整运行代码' : 'Complete runnable code'}**\n\n\`\`\`ts\n${source}\n\`\`\`\n\n`;
  });
}
