import { DocsPageContent, getDocsMetadata } from '@/components/docs-page';
import { source } from '@/lib/source';

export default async function Page(props: PageProps<'/en/docs/[[...slug]]'>) {
  const { slug } = await props.params;
  return <DocsPageContent slug={slug} locale="en" />;
}

export function generateStaticParams() {
  return source.getPages('en').map((page) => ({ slug: page.slugs }));
}

export async function generateMetadata(props: PageProps<'/en/docs/[[...slug]]'>) {
  const { slug } = await props.params;
  return getDocsMetadata(slug, 'en');
}
