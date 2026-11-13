import { getMDXComponents } from '@/components/mdx';
import { DocsAnchorRedirect } from '@/components/docs-anchor-redirect';
import { StructuredData } from '@/components/structured-data';
import { getDocsFooterItems } from '@/lib/docs-tree';
import type { Locale } from '@/lib/i18n';
import { localizedDocsPath } from '@/lib/i18n';
import { createDocsStructuredData, createPageSeo } from '@/lib/seo';
import { gitConfig, withBasePath } from '@/lib/shared';
import { getLegacyDocsTarget, getPageImage, getPageMarkdownUrl, source } from '@/lib/source';
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

const graphListenerAnchors = new Set(['on', 'off', 'once']);

const legacyGraphExtensionAnchors = {
  zh: ['注册规则', '扩展上下文', '兼容成员', '实例作用域'],
  en: ['registration-rules', 'extension-context', 'compatibility-members', 'instance-scope'],
};

const nodeOptionAnchors = {
  zh: ['样式函数', '标签', '图标', '内容与显示', '放置与偏移', '堆叠与溢出', '内置徽章', '自定义装饰渲染器', 'options-node-状态样式', 'options-node-运行时更新', '相关参考', '按效果选择示例', '指南与协议'],
  en: ['options-node-style-callbacks', 'labels', 'icons', 'content-and-visibility', 'placement-and-offsets', 'stacks-and-overflow', 'built-in-badges', 'custom-decoration-renderers', 'options-node-state-styles', 'options-node-runtime-updates', 'related-references', 'choose-an-example-by-effect', 'guides-and-protocols'],
};

const edgeOptionAnchors = {
  zh: [
    'edgeconfig',
    '基础样式',
    '样式回调',
    '虚线规则',
    '箭头',
    '点击热区',
    'options-edge-状态样式',
    'options-edge-运行时更新',
    '平行边与自环',
    '分组与间距',
    '两种入口与优先级',
    '曲线与折线路由',
    '弧线与三次曲线',
    '路由选择',
    '缩进目标与主干',
    '边标签',
    '位置与显示条件',
    '其他配置',
  ],
  en: [
    'edgeconfig',
    'basic-styles',
    'options-edge-style-callbacks',
    'dash-rules',
    'arrows',
    'picking-width',
    'options-edge-state-styles',
    'options-edge-runtime-updates',
    'parallel-edges-and-self-loops',
    'grouping-and-spacing',
    'entries-and-precedence',
    'curves-and-polyline-routing',
    'arcs-and-cubic-curves',
    'choosing-a-router',
    'indented-targets-and-trunks',
    'edge-labels',
    'position-and-visibility',
    'other-configuration',
  ],
};

const comboOptionAnchors = {
  zh: [
    '只读查询模型',
    '基础外观与局部覆盖',
    '基础样式字段',
    'options-combo-代码与对应效果',
    '字段回调与覆盖顺序',
    '留白包围框与标签',
    '运行时修改边界',
    '折叠形态',
    'options-combo-状态样式',
    'options-combo-相关入口',
  ],
  en: [
    'read-only-query-model',
    'basic-appearance-and-local-overrides',
    'basic-style-fields',
    'options-combo-code-and-matching-result',
    'callbacks-and-precedence',
    'padding-bounds-and-labels',
    'options-combo-runtime-updates',
    'collapsed-appearance',
    'options-combo-state-styles',
    'options-combo-related-entries',
  ],
};

const labelOptionAnchors = {
  zh: [
    'options-label-代码与对应效果',
    '缩放阈值',
    '碰撞顺序',
    '生效范围',
    'options-label-运行时更新',
    'options-label-相关入口',
  ],
  en: [
    'options-label-code-and-matching-result',
    'zoom-thresholds',
    'collision-order',
    'scope',
    'options-label-runtime-updates',
    'options-label-related-entries',
  ],
};

const layoutOptionAnchors = {
  zh: [
    '支持的布局类型',
    'options-layout-代码与对应效果',
    '计算默认值',
    '函数式树布局',
    'mindmap',
    'indented',
    'fishbone',
    'worker',
    '坐标与运行时',
  ],
  en: [
    'supported-layouts',
    'options-layout-code-and-rendered-result',
    'computation-defaults',
    'functional-tree-layouts',
    'mindmap',
    'indented',
    'fishbone',
    'worker',
    'coordinates-and-runtime',
  ],
};

const oldNodeOptionAliases = {
  zh: { 状态样式: 'options-node-状态样式', 运行时更新: 'options-node-运行时更新' },
  en: {
    'style-callbacks': 'options-node-style-callbacks',
    'state-styles': 'options-node-state-styles',
    'runtime-updates': 'options-node-runtime-updates',
  },
};

export async function DocsPageContent({ slug, locale }: { slug?: string[]; locale: Locale }) {
  const page = source.getPage(slug, locale);
  if (!page) notFound();

  const MDX = page.data.body;
  const pagePath = localizedDocsPath(page.slugs, locale);
  const image = getPageImage(page).url;
  const description = page.data.description ?? page.data.title;
  const markdownUrl = getPageMarkdownUrl(page).url;
  const localizedSourcePath = page.path.startsWith(`${locale}/`)
    ? page.path
    : `${locale}/${page.path}`;
  const githubUrl = `https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/site/content/docs/${localizedSourcePath}`;
  const isExamplesRoute = page.slugs[0] === 'examples';
  const isGraphApi = pagePath === localizedDocsPath(['api', 'graph'], locale);
  const isEventReference = pagePath === localizedDocsPath(['api', 'graph', 'events'], locale);
  const eventReference = isGraphApi ? source.getPage(['api', 'graph', 'events'], locale) : undefined;
  const eventReferenceText = eventReference ? await eventReference.data.getText('raw') : '';
  const eventReferenceAnchors = Array.from(
    eventReferenceText.matchAll(/<span id="([^"]+)"/g),
    ([, id]) => id,
  ).filter((id) => id !== 'grapheventmap' && !graphListenerAnchors.has(id));
  const isExtensionReference = pagePath === localizedDocsPath(['api', 'extensions'], locale);
  const extensionReference = isGraphApi ? source.getPage(['api', 'extensions'], locale) : undefined;
  const optionsPath = localizedDocsPath(['api', 'options'], locale);
  const isOptions = pagePath === optionsPath;
  const isOldNodeOptions = pagePath === localizedDocsPath(['api', 'options', 'node'], locale);
  const isNodeGuide = pagePath === localizedDocsPath(['guides', 'node'], locale);
  const compactToc = isGraphApi || isEventReference || isExtensionReference || isOptions || isNodeGuide;
  const toc = compactToc
    ? page.data.toc.filter((item) => item.depth <= (isOptions ? 2 : 3))
    : page.data.toc;
  const isFlatToc = toc.every((item) => item.depth === toc[0]?.depth);
  const bodyClassName = isGraphApi ? 'graph-api-reference' : isEventReference || isOptions ? 'scrollable-doc-tables' : undefined;
  const RelativeLink = createRelativeLink(source, page);

  if (isExamplesRoute) {
    return (
      <>
        <StructuredData
          data={createDocsStructuredData({
            locale,
            path: pagePath,
            title: page.data.title,
            description,
            image,
          })}
        />
        <DocsPage toc={[]} full footer={{ enabled: false }}>
          <DocsBody className="examples-docs-body">
            <MDX components={getMDXComponents({ a: RelativeLink })} />
          </DocsBody>
        </DocsPage>
      </>
    );
  }

  return (
    <>
      {!getLegacyDocsTarget(page.slugs) && (
        <StructuredData
          data={createDocsStructuredData({
            locale,
            path: pagePath,
            title: page.data.title,
            description,
            image,
          })}
        />
      )}
      <DocsPage
        toc={toc}
        full={page.data.full}
        tableOfContent={{
          single: true,
          list: { className: isFlatToc ? 'docs-toc-flat' : 'docs-toc-nested' },
        }}
        footer={{ items: getDocsFooterItems(source.getPageTree(locale), locale, pagePath) }}
      >
        <DocsTitle>{page.data.title}</DocsTitle>
        <DocsDescription className="mb-0">{description}</DocsDescription>
        <div className="docs-page-actions">
          <MarkdownCopyButton markdownUrl={markdownUrl} />
          <a className="docs-github-link" href={githubUrl} target="_blank" rel="noreferrer">
            {locale === 'zh' ? '在 GitHub 查看源码' : 'View source on GitHub'}
          </a>
        </div>
        <DocsBody className={bodyClassName}>
          {(isGraphApi || isEventReference) && (
            <DocsAnchorRedirect
              referenceUrl={withBasePath(localizedDocsPath(['api', 'graph'], locale))}
              anchors={[]}
              aliases={{ grapheventmap: 'off' }}
            />
          )}
          {eventReference && (
            <DocsAnchorRedirect
              referenceUrl={withBasePath(eventReference.url)}
              anchors={[
                ...eventReference.data.toc.map(({ url }) => decodeURIComponent(url.slice(1))),
                ...eventReferenceAnchors,
              ]}
            />
          )}
          {extensionReference && (
            <DocsAnchorRedirect
              referenceUrl={withBasePath(extensionReference.url)}
              anchors={[
                ...extensionReference.data.toc.map(({ url }) => decodeURIComponent(url.slice(1))),
                'extension-registration-extensionfactory',
                ...legacyGraphExtensionAnchors[locale],
              ]}
            />
          )}
          {(isOptions || isOldNodeOptions) && (
            <DocsAnchorRedirect
              referenceUrl={withBasePath(localizedDocsPath(['guides', 'node'], locale))}
              anchors={[
                ...(isOldNodeOptions ? ['options-node'] : []),
                'nodeconfig',
                'nodestyleconfig',
                'labelrenderer',
                'nodedecorationconfig',
                ...nodeOptionAnchors[locale],
              ]}
              aliases={isOldNodeOptions ? oldNodeOptionAliases[locale] : undefined}
            />
          )}
          {isOptions && (
            <DocsAnchorRedirect
              referenceUrl={withBasePath(localizedDocsPath(['guides', 'edge'], locale))}
              anchors={edgeOptionAnchors[locale]}
            />
          )}
          {isOptions && (
            <DocsAnchorRedirect
              referenceUrl={withBasePath(localizedDocsPath(['guides', 'combo'], locale))}
              anchors={comboOptionAnchors[locale]}
            />
          )}
          {isOptions && (
            <DocsAnchorRedirect
              referenceUrl={withBasePath(localizedDocsPath(['guides', 'label'], locale))}
              anchors={labelOptionAnchors[locale]}
            />
          )}
          {isOptions && (
            <DocsAnchorRedirect
              referenceUrl={withBasePath(localizedDocsPath(['guides', 'layout'], locale))}
              anchors={layoutOptionAnchors[locale]}
            />
          )}
          <MDX
            components={getMDXComponents({
              a: ({ href, ...props }) => {
                if (isOptions && href?.startsWith('#')) return <a href={href} {...props} />;
                if (href?.startsWith(`${optionsPath}#`)) return <a href={withBasePath(href)} {...props} />;
                return <RelativeLink href={href} {...props} />;
              },
            })}
          />
        </DocsBody>
      </DocsPage>
    </>
  );
}

export function getDocsMetadata(slug: string[] | undefined, locale: Locale): Metadata {
  const page = source.getPage(slug, locale);
  if (!page) notFound();

  const legacyTarget = getLegacyDocsTarget(page.slugs);
  const canonicalPage = legacyTarget
    ? source.getPage(legacyTarget === 'index' ? [] : legacyTarget.split('/'), locale)
    : page;
  if (!canonicalPage) notFound();

  const zh = localizedDocsPath(canonicalPage.slugs, 'zh');
  const en = localizedDocsPath(canonicalPage.slugs, 'en');
  const path = locale === 'zh' ? zh : en;
  const image = getPageImage(canonicalPage).url;
  const description = page.data.description ?? page.data.title;

  return {
    title: page.data.title,
    description,
    ...(legacyTarget ? { robots: { index: false, follow: true } } : {}),
    ...createPageSeo({
      locale,
      path,
      zhPath: zh,
      enPath: en,
      title: page.data.title,
      description,
      image,
      type: 'article',
    }),
  };
}
