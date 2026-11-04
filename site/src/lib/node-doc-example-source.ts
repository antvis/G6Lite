import { readFileSync } from 'node:fs';
import path from 'node:path';

export type NodeDocExampleId = 'style' | 'labels' | 'badges';
const files: Record<NodeDocExampleId, string> = {
  style: 'docs-node-style.ts',
  labels: 'docs-node-labels.ts',
  badges: 'docs-node-badges.ts',
};

export function readNodeDocExample(id: NodeDocExampleId) {
  return readFileSync(path.join(process.cwd(), 'demos', files[id]), 'utf8');
}

// Copy Markdown and LLM text need the same runnable code as the HTML page,
// rather than an MDX component placeholder.
export function expandNodeDocExamples(markdown: string) {
  return markdown.replace(/<NodeDocExample\b([^>]*)\/>/g, (_match, attributes: string) => {
    const id = /\bid="(style|labels|badges)"/.exec(attributes)?.[1] as NodeDocExampleId | undefined;
    if (!id) throw new Error('Unknown inline node example in Markdown');
    return `\n\n\`\`\`ts\n${readNodeDocExample(id).trimEnd()}\n\`\`\`\n\n`;
  });
}
