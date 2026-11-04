import { readFileSync } from 'node:fs';
import path from 'node:path';

export type NodeDocExampleId = 'body' | 'style' | 'labels' | 'label-options' | 'badges' | 'edge-style' | 'edge-hit-area' | 'edge-parallel' | 'edge-curves' | 'edge-cubic' | 'edge-orth' | 'edge-indented' | 'edge-labels' | 'combo-data' | 'combo-style' | 'combo-collapsed' | 'combo-states' | 'combo-membership' | 'label-policy' | 'theme-switch' | 'theme-precedence' | 'layout-switch' | 'layout-tree' | 'layout-worker' | 'layout-result' | 'behavior-selection';
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
};

export function readNodeDocExample(id: NodeDocExampleId) {
  return readFileSync(path.join(process.cwd(), 'demos', files[id]), 'utf8');
}

// Copy Markdown and LLM text need the same runnable code as the HTML page,
// rather than an MDX component placeholder.
export function expandNodeDocExamples(markdown: string) {
  return markdown.replace(/<(?:NodeDocExample|EdgeDocExample|ComboDocExample|LabelDocExample|ThemeDocExample|LayoutDocExample|BehaviorDocExample)\b([^>]*)\/>/g, (_match, attributes: string) => {
    const id = /\bid="([a-z-]+)"/.exec(attributes)?.[1] as NodeDocExampleId | undefined;
    if (!id || !Object.hasOwn(files, id)) throw new Error('Unknown inline configuration example in Markdown');
    return `\n\n\`\`\`ts\n${readNodeDocExample(id).trimEnd()}\n\`\`\`\n\n`;
  });
}
