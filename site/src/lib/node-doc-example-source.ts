import { readFileSync } from 'node:fs';
import path from 'node:path';

export type NodeDocExampleId = 'body' | 'style' | 'labels' | 'label-options' | 'badges' | 'edge-style' | 'edge-hit-area' | 'edge-parallel' | 'edge-curves' | 'edge-cubic' | 'edge-orth' | 'edge-indented' | 'edge-labels' | 'combo-data' | 'combo-style' | 'combo-collapsed' | 'combo-states' | 'combo-membership' | 'label-policy' | 'theme-switch' | 'theme-precedence' | 'layout-switch' | 'layout-tree' | 'layout-worker' | 'layout-result' | 'behavior-selection' | 'behavior-highlight' | 'behavior-custom' | 'behavior-tooltip' | 'behavior-tooltip-hover' | 'events-listen' | 'events-lifecycle' | 'state-concept' | 'state-preserve' | 'viewport-concept' | 'viewport-preserve';
const files: Record<NodeDocExampleId, string> = {
  body: 'docs-node-body.ts',
  style: 'docs-node-style.ts',
  labels: 'docs-node-labels.ts',
  'label-options': 'docs-node-label-options.ts',
  badges: 'docs-node-badges.ts',
  'edge-style': 'docs-edge-style.ts',
  'edge-hit-area': 'docs-edge-hit-area.ts',
  'edge-parallel': 'docs-edge-parallel.ts',
  'edge-curves': 'docs-edge-curves.ts',
  'edge-cubic': 'docs-edge-cubic.ts',
  'edge-orth': 'polyline-routing.ts',
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
  'layout-tree': 'docs-layout-tree.ts',
  'layout-worker': 'docs-layout-worker.ts',
  'layout-result': 'docs-layout-result.ts',
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
};

export function readNodeDocExample(id: NodeDocExampleId) {
  return readFileSync(path.join(process.cwd(), 'demos', files[id]), 'utf8');
}

// Excerpts are selected from the executable source, never maintained as a copy.
export function getNodeDocExampleSnippet(source: string, focus: string) {
  if (!/^[a-z-]+$/.test(focus)) throw new Error('Invalid example excerpt');
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
    const id = /\bid="([a-z-]+)"/.exec(attributes)?.[1] as NodeDocExampleId | undefined;
    if (!id || !Object.hasOwn(files, id)) throw new Error('Unknown inline configuration example in Markdown');
    const source = readNodeDocExample(id).trimEnd();
    const focus = /\bfocus="([a-z-]+)"/.exec(attributes)?.[1];
    if (!focus) return `\n\n\`\`\`ts\n${source}\n\`\`\`\n\n`;
    const zh = /\blocale="zh"/.test(attributes);
    return `\n\n\`\`\`ts\n${getNodeDocExampleSnippet(source, focus)}\n\`\`\`\n\n<details>\n<summary>${zh ? '完整运行代码' : 'Complete runnable code'}</summary>\n\n\`\`\`ts\n${source}\n\`\`\`\n\n</details>\n\n`;
  });
}
