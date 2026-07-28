import Image from 'next/image';
import Link from 'next/link';

import { localizedPath, type Locale } from '@/lib/i18n';
import { siteConfig } from '@/lib/site-config';
import { withBasePath } from '@/lib/shared';
import { CodeBlock } from './home-code-block';

const codeExample = `import { Graph } from '@antv/g6-gl';

const graph = new Graph({
  container: 'graph',
  data: {
    nodes: [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
    edges: [
      { source: 'a', target: 'b' },
      { source: 'a', target: 'c' },
    ],
  },
  layout: { type: 'circular', radius: 140 },
  behaviors: ['zoom-canvas', 'drag-canvas', 'drag-node', 'hover-highlight'],
});

await graph.render();`;

const content = {
  zh: {
    eyebrow: 'AntV 图可视化引擎',
    title: '让大规模关系图保持轻量、清晰、可交互',
    description:
      'G6-GL 以 WebGL 批渲染和增量更新为核心，提供数据、布局、交互、状态与扩展的一体化 API。',
    start: '快速开始',
    examples: '查看示例',
    valuesTitle: '为分析型图可视化设计',
    valuesDescription: '聚焦稳定公开 API 和真实可运行链路，不把内部渲染细节暴露给业务代码。',
    values: [
      ['WebGL 批渲染', '节点与边通过 GPU 批量绘制，适合中大规模关系数据。'],
      ['增量交互', '状态、样式与坐标变化按影响范围刷新，避免无意义的全量重绘。'],
      ['AntV 布局能力', '内置 15+ 布局，覆盖关系网络、层级图、脑图与鱼骨图。'],
      ['受控扩展', '通过 register() 与 extensionFactory() 扩展节点、边、行为、布局和插件。'],
    ],
    codeTitle: '一个入口完成数据、布局与交互',
    codeDescription:
      '使用包根 Graph API 创建实例。最小示例只依赖稳定公开能力，可直接复制到浏览器项目中运行。',
    guide: '阅读配置指南',
    showcaseTitle: '从真实案例理解 API',
    showcaseDescription: '官网示例与 Playground 共用一份 catalog、源码和发布检查结果。',
    metricsTitle: '公开指标只采用可复现口径',
    metricsDescription:
      'Benchmark、包体积和兼容性均提供运行环境与复现命令；首页不展示无法跨机器比较的营销跑分。',
    metrics: [
      ['15+', '内置布局'],
      ['WebGL 1.0', '渲染基线'],
      ['≤ 120 kB', 'Brotli 体积预算'],
      ['ESM + TS', '发布格式'],
    ],
    metricsLink: '查看技术指标',
    ctaTitle: '从第一个可交互关系图开始',
    ctaDescription: '安装 @antv/g6-gl，按照快速开始完成容器、数据、布局和销毁链路。',
    docs: '阅读文档',
  },
  en: {
    eyebrow: 'AntV graph visualization engine',
    title: 'Keep large relationship graphs lightweight, clear, and interactive',
    description:
      'G6-GL combines WebGL batch rendering with incremental updates through one API for data, layouts, interactions, states, and extensions.',
    start: 'Quick start',
    examples: 'Explore examples',
    valuesTitle: 'Designed for analytical graph visualization',
    valuesDescription:
      'The public API stays focused on runnable workflows while engine internals remain behind controlled extension boundaries.',
    values: [
      [
        'WebGL batching',
        'Nodes and edges are drawn in GPU batches for medium and large relationship data.',
      ],
      [
        'Incremental interaction',
        'State, style, and position changes refresh only the affected rendering layers.',
      ],
      [
        'AntV layouts',
        '15+ built-in layouts cover networks, hierarchies, mind maps, and fishbone diagrams.',
      ],
      [
        'Controlled extensions',
        'Extend nodes, edges, behaviors, layouts, and plugins with register() and extensionFactory().',
      ],
    ],
    codeTitle: 'One entry point for data, layout, and interaction',
    codeDescription:
      'Create graphs with the package-root Graph API. The minimal example uses stable public capabilities and runs directly in a browser project.',
    guide: 'Read configuration guides',
    showcaseTitle: 'Learn the API through real examples',
    showcaseDescription:
      'The website and Playground share the same catalog, source files, and release checks.',
    metricsTitle: 'Public metrics use reproducible methodology',
    metricsDescription:
      'Benchmarks, bundle size, and compatibility include their environment and reproduction commands. The homepage avoids hardware-dependent marketing scores.',
    metrics: [
      ['15+', 'built-in layouts'],
      ['WebGL 1.0', 'rendering baseline'],
      ['≤ 120 kB', 'Brotli size budget'],
      ['ESM + TS', 'package format'],
    ],
    metricsLink: 'Read technical metrics',
    ctaTitle: 'Start with your first interactive relationship graph',
    ctaDescription:
      'Install @antv/g6-gl and follow the quick start for the container, data, layout, and cleanup lifecycle.',
    docs: 'Read documentation',
  },
} as const;

const featuredExamples = [
  { id: 'basic', image: 'basic.png' },
  { id: 'layouts', image: 'layouts.png' },
  { id: 'real-dataset', image: 'real-dataset.png' },
] as const;

const exampleText = {
  zh: {
    basic: ['最简示例', '用最少配置渲染第一张可交互关系图。'],
    layouts: ['布局切换', '在同一份数据上切换 circular、force、grid 与 dagre。'],
    'real-dataset': ['真实数据集', '使用真实关系数据验证渲染与交互链路。'],
  },
  en: {
    basic: [
      'Minimal graph',
      'Render the first interactive relationship graph with minimal configuration.',
    ],
    layouts: ['Layout switching', 'Switch circular, force, grid, and dagre on the same data.'],
    'real-dataset': [
      'Real dataset',
      'Validate rendering and interaction with real relationship data.',
    ],
  },
} as const;

export function HomePage({ locale }: { locale: Locale }) {
  const copy = content[locale];

  return (
    <main className="landing" lang={locale === 'zh' ? 'zh-CN' : 'en'}>
      <section className="landing-hero">
        <div className="landing-shell landing-hero-grid">
          <div className="landing-hero-copy">
            <div className="landing-eyebrow">{copy.eyebrow}</div>
            <div className="landing-version">{siteConfig.version}</div>
            <h1>{copy.title}</h1>
            <p>{copy.description}</p>
            <div className="landing-actions">
              <Link
                className="landing-button landing-button-primary"
                href={localizedPath('/docs/getting-started/quick-start', locale)}
              >
                {copy.start}
              </Link>
              <Link className="landing-button" href={localizedPath('/docs/examples', locale)}>
                {copy.examples}
              </Link>
            </div>
            <div className="landing-install" aria-label="npm install command">
              <span>$</span>
              <code>npm install @antv/g6-gl</code>
            </div>
          </div>
          <Link
            className="landing-visual"
            href={localizedPath('/docs/examples/real-dataset', locale)}
          >
            <Image
              src={withBasePath('/examples/real-dataset.png')}
              alt={
                locale === 'zh'
                  ? 'G6-GL 真实数据集渲染示例'
                  : 'G6-GL real dataset rendering example'
              }
              fill
              priority
              sizes="(min-width: 1024px) 48vw, 92vw"
            />
            <span>WebGL graph · real dataset</span>
          </Link>
        </div>
      </section>

      <section className="landing-section">
        <div className="landing-shell">
          <div className="landing-heading">
            <h2>{copy.valuesTitle}</h2>
            <p>{copy.valuesDescription}</p>
          </div>
          <div className="landing-value-grid">
            {copy.values.map(([title, description], index) => (
              <article className="landing-value-card" key={title}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section landing-section-muted">
        <div className="landing-shell landing-code-grid">
          <div className="landing-code-copy">
            <h2>{copy.codeTitle}</h2>
            <p>{copy.codeDescription}</p>
            <Link className="landing-text-link" href={localizedPath('/docs/guides/data', locale)}>
              {copy.guide} →
            </Link>
          </div>
          <CodeBlock code={codeExample} lang="ts" filename="graph.ts" />
        </div>
      </section>

      <section className="landing-section">
        <div className="landing-shell">
          <div className="landing-heading landing-heading-row">
            <div>
              <h2>{copy.showcaseTitle}</h2>
              <p>{copy.showcaseDescription}</p>
            </div>
            <Link className="landing-text-link" href={localizedPath('/docs/examples', locale)}>
              {copy.examples} →
            </Link>
          </div>
          <div className="landing-example-grid">
            {featuredExamples.map((example) => {
              const [title, description] = exampleText[locale][example.id];
              return (
                <Link
                  className="landing-example-card"
                  href={localizedPath(`/docs/examples/${example.id}`, locale)}
                  key={example.id}
                >
                  <div className="landing-example-image">
                    <Image
                      src={withBasePath(`/examples/${example.image}`)}
                      alt={title}
                      fill
                      sizes="(min-width: 900px) 31vw, 90vw"
                    />
                  </div>
                  <div>
                    <h3>{title}</h3>
                    <p>{description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="landing-section landing-metrics">
        <div className="landing-shell landing-metrics-grid">
          <div>
            <h2>{copy.metricsTitle}</h2>
            <p>{copy.metricsDescription}</p>
            <Link
              className="landing-text-link"
              href={localizedPath('/docs/metrics/performance', locale)}
            >
              {copy.metricsLink} →
            </Link>
          </div>
          <div className="landing-metric-list">
            {copy.metrics.map(([value, label]) => (
              <div key={label}>
                <strong>{value}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-cta">
        <div className="landing-shell landing-cta-inner">
          <div>
            <h2>{copy.ctaTitle}</h2>
            <p>{copy.ctaDescription}</p>
          </div>
          <div className="landing-actions">
            <Link
              className="landing-button landing-button-primary"
              href={localizedPath('/docs/getting-started/quick-start', locale)}
            >
              {copy.start}
            </Link>
            <Link className="landing-button" href={localizedPath('/docs', locale)}>
              {copy.docs}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
