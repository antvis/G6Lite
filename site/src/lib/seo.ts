import type { Metadata } from 'next';

import type { Locale } from './i18n';
import { localizedDocsPath, localizedPath } from './i18n';
import { siteConfig } from './site-config';

export type JsonLd = Record<string, unknown>;

type PageSeoOptions = {
  locale: Locale;
  path: string;
  zhPath: string;
  enPath: string;
  title: string;
  description: string;
  image: string;
  type?: 'website' | 'article';
};

type DocsStructuredDataOptions = {
  locale: Locale;
  path: string;
  title: string;
  description: string;
  image: string;
};

type AiSkillStructuredDataOptions = {
  locale: Locale;
  path: string;
  description: string;
};

const localeTags: Record<Locale, { html: string; openGraph: string }> = {
  zh: { html: 'zh-CN', openGraph: 'zh_CN' },
  en: { html: 'en', openGraph: 'en_US' },
};

export function absoluteSiteUrl(path = '/'): string {
  const base = siteConfig.url.replace(/\/+$/, '');
  const suffix = path === '/' ? '' : path.startsWith('/') ? path : `/${path}`;
  return `${base}${suffix}`;
}

export function createPageSeo({
  locale,
  path,
  zhPath,
  enPath,
  title,
  description,
  image,
  type = 'website',
}: PageSeoOptions): Pick<Metadata, 'alternates' | 'openGraph' | 'twitter'> {
  const url = absoluteSiteUrl(path);
  const imageUrl = absoluteSiteUrl(image);
  const commonOpenGraph = {
    title,
    description,
    url,
    siteName: siteConfig.name,
    locale: localeTags[locale].openGraph,
    images: [{ url: imageUrl, alt: title }],
  };

  const openGraph: Metadata['openGraph'] =
    type === 'article'
      ? { ...commonOpenGraph, type: 'article' }
      : { ...commonOpenGraph, type: 'website' };

  return {
    alternates: {
      canonical: url,
      languages: {
        'zh-CN': absoluteSiteUrl(zhPath),
        en: absoluteSiteUrl(enPath),
        'x-default': absoluteSiteUrl(zhPath),
      },
    },
    openGraph,
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

export function createHomeStructuredData(locale: Locale): JsonLd {
  const url = absoluteSiteUrl(localizedPath('/', locale));
  const websiteId = `${absoluteSiteUrl()}/#website`;
  const softwareId = `${absoluteSiteUrl()}/#software`;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': websiteId,
        url: absoluteSiteUrl(),
        name: siteConfig.name,
        description: siteConfig.description[locale],
        inLanguage: ['zh-CN', 'en'],
      },
      {
        '@type': 'SoftwareApplication',
        '@id': softwareId,
        name: siteConfig.name,
        alternateName: siteConfig.packageName,
        description: siteConfig.description[locale],
        url,
        applicationCategory: 'DeveloperApplication',
        applicationSubCategory: 'Graph Visualization',
        operatingSystem: 'Any',
        softwareVersion: siteConfig.version,
        downloadUrl: siteConfig.npm,
        codeRepository: siteConfig.repository,
        isAccessibleForFree: true,
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        isPartOf: { '@id': websiteId },
      },
    ],
  };
}

export function createAiSkillStructuredData({
  locale,
  path,
  description,
}: AiSkillStructuredDataOptions): JsonLd {
  const steps =
    locale === 'zh'
      ? [
          ['提供 Skill 源', '把 skills/antv-g6lite-graph 交给 Agent，或让它从 GitHub 安装。'],
          ['在任务里点名调用', '用 $antv-g6lite-graph 写清数据、规模、布局、容器和交互。'],
          ['按 Skill 的顺序验收', '从最小 Graph 开始，在有尺寸的浏览器里验证，并在卸载时销毁。'],
        ]
      : [
          [
            'Provide the Skill source',
            'Point the agent at skills/antv-g6lite-graph, or ask it to install the Skill from GitHub.',
          ],
          [
            'Invoke it in the task',
            'Start with $antv-g6lite-graph and include data, scale, layout, container, and interactions.',
          ],
          [
            'Accept the result in order',
            'Start from a minimal Graph, validate it in a sized browser, and destroy it on unmount.',
          ],
        ];

  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: locale === 'zh' ? '在 AI 中使用 G6Lite Skill' : 'Use the G6Lite Skill with an AI agent',
    description,
    url: absoluteSiteUrl(path),
    inLanguage: localeTags[locale].html,
    step: steps.map(([name, text], index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name,
      text,
    })),
  };
}

export function createDocsStructuredData({
  locale,
  path,
  title,
  description,
  image,
}: DocsStructuredDataOptions): JsonLd {
  const url = absoluteSiteUrl(path);
  const homePath = localizedPath('/', locale);
  const docsPath = localizedDocsPath([], locale);
  const websiteId = `${absoluteSiteUrl()}/#website`;
  const breadcrumbItems = [
    {
      '@type': 'ListItem',
      position: 1,
      name: locale === 'zh' ? '首页' : 'Home',
      item: absoluteSiteUrl(homePath),
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: locale === 'zh' ? '文档' : 'Docs',
      item: absoluteSiteUrl(docsPath),
    },
  ];

  if (path !== docsPath) {
    breadcrumbItems.push({
      '@type': 'ListItem',
      position: 3,
      name: title,
      item: url,
    });
  }

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'TechArticle',
        headline: title,
        description,
        url,
        mainEntityOfPage: url,
        image: absoluteSiteUrl(image),
        inLanguage: localeTags[locale].html,
        author: { '@type': 'Organization', name: 'AntV', url: 'https://antv.antgroup.com' },
        publisher: { '@type': 'Organization', name: 'AntV', url: 'https://antv.antgroup.com' },
        isPartOf: { '@id': websiteId },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbItems,
      },
    ],
  };
}
