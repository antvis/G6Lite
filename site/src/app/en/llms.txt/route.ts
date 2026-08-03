import { source } from '@/lib/source';

export const revalidate = false;

export function GET() {
  const lines = [
    '# G6Lite Documentation',
    '',
    ...source.getPages('en').map((page) => `- [${page.data.title}](${page.url})`),
  ];
  return new Response(lines.join('\n'));
}
