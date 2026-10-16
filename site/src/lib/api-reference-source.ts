import { readFileSync } from 'node:fs';
import path from 'node:path';

const referencePath = path.join(process.cwd(), 'src/data/api-reference.md');

export function readApiReferenceMarkdown(): string {
  return readFileSync(referencePath, 'utf8');
}
