import { readFileSync } from 'node:fs';
import path from 'node:path';

export type NodeDocExampleId = 'body' | 'style' | 'labels' | 'label-options' | 'badges' | 'edge-style' | 'edge-hit-area' | 'edge-parallel';
const files: Record<NodeDocExampleId, string> = {
  body: 'docs-node-body.ts',
  style: 'docs-node-style.ts',
  labels: 'docs-node-labels.ts',
  'label-options': 'docs-node-label-options.ts',
  badges: 'docs-node-badges.ts',
  'edge-style': 'docs-edge-style.ts',
  'edge-hit-area': 'docs-edge-hit-area.ts',
  'edge-parallel': 'docs-edge-parallel.ts',
};

export function readNodeDocExample(id: NodeDocExampleId) {
  return readFileSync(path.join(process.cwd(), 'demos', files[id]), 'utf8');
}

// Copy Markdown and LLM text need the same runnable code as the HTML page,
// rather than an MDX component placeholder.
export function expandNodeDocExamples(markdown: string) {
  return markdown.replace(/<(?:NodeDocExample|EdgeDocExample)\b([^>]*)\/>/g, (_match, attributes: string) => {
    const id = /\bid="(body|style|labels|label-options|badges|edge-style|edge-hit-area|edge-parallel)"/.exec(attributes)?.[1] as NodeDocExampleId | undefined;
    if (!id) throw new Error('Unknown inline configuration example in Markdown');
    return `\n\n\`\`\`ts\n${readNodeDocExample(id).trimEnd()}\n\`\`\`\n\n`;
  });
}
