import { DocsPageContent, getDocsMetadata } from '@/components/docs-page';
import { siteExamples } from '@/lib/site-examples';

type Props = PageProps<'/docs/examples/[id]'>;

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <DocsPageContent slug={['examples', id]} locale="zh" />;
}

export function generateStaticParams() {
  return siteExamples.map(({ id }) => ({ id }));
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  return getDocsMetadata(['examples', id], 'zh');
}
