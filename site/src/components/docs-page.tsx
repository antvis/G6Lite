import { getMDXComponents } from '@/components/mdx';
import type { Locale } from '@/lib/i18n';
import { localizedDocsPath } from '@/lib/i18n';
import { gitConfig } from '@/lib/shared';
import { getPageImage, getPageMarkdownUrl, source } from '@/lib/source';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
} from 'fumadocs-ui/layouts/docs/page';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export async function DocsPageContent({ slug, locale }: { slug?: string[]; locale: Locale }) {
  const page = source.getPage(slug, locale);
  if (!page) notFound();

  const MDX = page.data.body;
  const markdownUrl = getPageMarkdownUrl(page).url;
  const localizedSourcePath = page.path.startsWith(`${locale}/`)
    ? page.path
    : `${locale}/${page.path}`;
  const githubUrl = `https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/site/content/docs/${localizedSourcePath}`;

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription className="mb-0">{page.data.description}</DocsDescription>
      <div className="docs-page-actions">
        <MarkdownCopyButton markdownUrl={markdownUrl} />
        <a className="docs-github-link" href={githubUrl} target="_blank" rel="noreferrer">
          {locale === 'zh' ? '在 GitHub 查看源码' : 'View source on GitHub'}
        </a>
      </div>
      <DocsBody>
        <MDX components={getMDXComponents({ a: createRelativeLink(source, page) })} />
      </DocsBody>
    </DocsPage>
  );
}

export function getDocsMetadata(slug: string[] | undefined, locale: Locale): Metadata {
  const page = source.getPage(slug, locale);
  if (!page) notFound();

  const zh = localizedDocsPath(page.slugs, 'zh');
  const en = localizedDocsPath(page.slugs, 'en');

  return {
    title: page.data.title,
    description: page.data.description,
    alternates: {
      canonical: locale === 'zh' ? zh : en,
      languages: { 'zh-CN': zh, en },
    },
    openGraph: {
      title: page.data.title,
      description: page.data.description,
      images: getPageImage(page).url,
    },
  };
}
