import { getLLMText, getPrimaryDocsPages } from '@/lib/source';

export const revalidate = false;

export async function GET() {
  const scanned = await Promise.all(getPrimaryDocsPages('en').map(getLLMText));
  return new Response(scanned.join('\n\n'));
}
