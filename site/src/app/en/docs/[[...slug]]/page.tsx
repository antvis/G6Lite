import { DocsPageContent, getDocsMetadata } from '@/components/docs-page';
import { source } from '@/lib/source';

export default async function Page(props: PageProps<'/en/docs/[[...slug]]'>) {
  const { slug } = await props.params;
  return <DocsPageContent slug={slug} locale="en" />;
}

export function generateStaticParams() {
  return source.getPages('en')
    .filter(({ slugs }) => slugs[0] !== 'examples' || slugs.length !== 2)
    .map(({ slugs }) => ({ slug: slugs }));
}

export async function generateMetadata(props: PageProps<'/en/docs/[[...slug]]'>) {
  const { slug } = await props.params;
  return getDocsMetadata(slug, 'en');
}
