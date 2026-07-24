import { DocsPageContent, getDocsMetadata } from '@/components/docs-page';
import { source } from '@/lib/source';

export default async function Page(props: PageProps<'/docs/[[...slug]]'>) {
  const { slug } = await props.params;
  return <DocsPageContent slug={slug} locale="zh" />;
}

export function generateStaticParams() {
  return source.getPages('zh').map(({ slugs }) => ({ slug: slugs }));
}

export async function generateMetadata(props: PageProps<'/docs/[[...slug]]'>) {
  const { slug } = await props.params;
  return getDocsMetadata(slug, 'zh');
}
