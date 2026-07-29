import { CheckCircle2, Layers3, MousePointerClick, Network, Zap } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { withBasePath } from '@/lib/shared';

import { LegacyCodeBlock } from './legacy-code-block';
// import { StatsBand } from './stats-band';

// 缩略图为真实 g6-gl(WebGL)渲染的截图,见 public/layouts/*.png。
// 重新生成:npx vite --port 5179 --no-open & 然后 node scripts/capture-thumbnails.mjs。
const relationshipLayouts = [
  { type: 'force', title: '力导向', desc: '社群结构自然展开', bg: '#f8fbff' },
  { type: 'circular', title: '环形', desc: '环状关系一览', bg: '#f7fbf8' },
  { type: 'radial', title: '辐射', desc: '以中心向外发散', bg: '#fff8fb' },
  { type: 'dagre', title: 'DAG / 层级', desc: '有向流程分层', bg: '#fffaf4' },
  { type: 'grid', title: '网格', desc: '规整对齐排布', bg: '#f7fcff' },
];

const customLayouts = [
  { type: 'mindmap', title: '脑图', desc: '树状层级双向展开', bg: '#faf8ff' },
  { type: 'fishbone', title: '鱼骨图', desc: '因果分析定制布局', bg: '#fff8f3' },
];

const heroShowcases = [
  {
    src: withBasePath('/examples/large.png'),
    title: '较大规模（200 节点）',
    desc: '200 节点、800 边的力导向关系网络',
    href: '/docs/metrics/performance',
    bg: '#f8fbff',
  },
  {
    src: withBasePath('/examples/large-labeled.png'),
    title: '5000 节点 + 标签（力导布局）',
    desc: '高密度节点与标签的力导向性能示例',
    href: '/docs/guides/label',
    bg: '#f7fbf8',
  },
  {
    src: withBasePath('/examples/combo.png'),
    title: 'Combo 分组',
    desc: '用分组容器组织节点与嵌套关系',
    href: '/docs/examples/combo',
    bg: '#fffaf5',
  },
  {
    src: withBasePath('/layouts/force.png'),
    title: '力导向布局',
    desc: '让关系网络按连接强度自然展开',
    href: '/docs/guides/layout',
    bg: '#f7faff',
  },
  {
    src: withBasePath('/layouts/fishbone.png'),
    title: '鱼骨图布局',
    desc: '沿主骨与分支梳理问题原因',
    href: '/docs/guides/layout',
    bg: '#fff8f4',
  },
  {
    src: withBasePath('/layouts/mindmap.png'),
    title: '脑图布局',
    desc: '从中心主题向两侧展开层级',
    href: '/docs/guides/layout',
    bg: '#faf8ff',
  },
  {
    src: withBasePath('/layouts/dagre.png'),
    title: 'DAG / 层级布局',
    desc: '按方向分层展示流程与依赖',
    href: '/docs/guides/layout',
    bg: '#fffaf2',
  },
  {
    src: withBasePath('/layouts/circular.png'),
    title: '环形布局',
    desc: '沿圆周排列节点，突出整体关系',
    href: '/docs/guides/layout',
    bg: '#f7fbf8',
  },
  {
    src: withBasePath('/layouts/grid.png'),
    title: '网格布局',
    desc: '规则网格排布，便于对比与浏览',
    href: '/docs/guides/layout',
    bg: '#f7fcff',
  },
  {
    src: withBasePath('/layouts/radial.png'),
    title: '辐射布局',
    desc: '围绕中心节点向外分层展开',
    href: '/docs/guides/layout',
    bg: '#fff8fb',
  },
  {
    src: withBasePath('/examples/basic.png'),
    title: '最简示例',
    desc: '用最少配置渲染第一张关系图',
    href: '/docs/examples/basic',
    bg: '#fffaf8',
  },
];

const heroMarqueeCases = [...heroShowcases, ...heroShowcases];

// 高频交互指标：聚焦 G6-GL 渲染后的增量更新路径。
const perf = [
  {
    action: '节点高亮',
    speed: '~0ms',
    benefit: '零延迟反馈',
    detail: '局部重绘，视觉无卡顿',
  },
  {
    action: '状态变更',
    speed: '~0ms',
    benefit: '流畅无闪烁',
    detail: '智能调度，按需刷新',
  },
  {
    action: '海量拾取',
    speed: '0.1ms',
    benefit: '精准秒选',
    detail: 'GPU 算力支撑，千节点无压力',
  },
];

const perfSummary = [
  { label: '节点规模', value: '5k' },
  { label: '状态更新', value: '~0ms' },
  { label: '命中检测', value: '0.1ms' },
];

const perfFlow = ['命中元素', '状态变更', 'GPU patch', '局部刷新'];

const codeExample = `import { Graph } from '@antv/g6-gl';

const graph = new Graph({
  container: 'container',
  data: {
    nodes: [{ id: '0' }, { id: '1' }],
    edges: [{ source: '0', target: '1' }],
  },
  layout: { type: 'force' },
  behaviors: ['zoom-canvas', 'drag-canvas', 'highlight-node'],
});

await graph.render();

// 高亮某个节点 —— 增量更新，~0ms
graph.setItemState('0', 'highlight', true);`;

export default function HomePage() {
  return (
    <main className="flex flex-col bg-fd-background">
      <section className="home-hero relative overflow-hidden">
        <div className="mx-auto flex max-w-6xl flex-col items-center px-6 pb-14 pt-8 lg:pb-16">
          <div className="animate-in-up mt-12 flex w-full flex-col items-center text-center sm:mt-16">
            <h1 className="home-hero-title mt-7 max-w-4xl text-[2.6rem] font-medium leading-[1.12] text-fd-foreground sm:text-[4.25rem]">
              <span className="home-hero-title-accent">G6-GL</span> · 图可视化引擎
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-fd-muted-foreground">
              面向大规模图分析的轻量引擎。以 WebGL
              批渲染为底座，让高亮、选中、邻居聚焦等高频交互走增量更新路径。
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2 text-sm text-fd-muted-foreground">
              {['轻量 WebGL 内核', 'AntV 布局能力', '状态更新 GPU patch'].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-fd-border bg-fd-card px-3 py-1"
                >
                  {item}
                </span>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/docs/getting-started/quick-start"
                className="home-button home-button-primary"
              >
                快速开始
              </Link>
              <a
                href="https://github.com/antvis/G6Lite"
                target="_blank"
                rel="noreferrer"
                className="home-button home-button-secondary"
              >
                <GitHubIcon />
                GitHub
              </a>
            </div>
          </div>
        </div>

        <div className="home-case-strip pb-16 sm:pb-20">
          <div className="home-case-track">
            {heroMarqueeCases.map((item, index) => (
              <Link
                key={`${item.src}-${index}`}
                href={item.href}
                className="home-case-card group dark:!bg-[#07090f]"
                aria-hidden={index >= heroShowcases.length}
                aria-label={`${item.title}：${item.desc}`}
                tabIndex={index >= heroShowcases.length ? -1 : undefined}
                style={{
                  backgroundColor: item.bg,
                  animationDelay: `${(index % heroShowcases.length) * 0.14}s`,
                }}
              >
                <div className="relative h-full min-h-56">
                  <Image
                    src={item.src}
                    alt={`${item.title}示例图`}
                    fill
                    sizes="300px"
                    loading={index < 3 ? 'eager' : 'lazy'}
                    className="home-case-image home-graph-image object-contain p-4 transition duration-200 group-hover:scale-[1.04] dark:!mix-blend-normal dark:brightness-[0.96] dark:hue-rotate-180 dark:invert dark:saturate-[1.08]"
                  />
                </div>
                <div className="home-case-caption">
                  <strong>{item.title}</strong>
                  <span>{item.desc}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/*
      <section className="bg-[var(--home-muted-bg)]">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
          <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <span className="home-kicker">Layout Cases</span>
              <h2 className="mt-3 text-3xl font-semibold text-fd-foreground sm:text-4xl">
                关系网络与定制图形，一套引擎承载
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-fd-muted-foreground">
              基础布局服务通用关系网络，定制布局面向脑图、鱼骨图等业务表达，并可继续扩展到更多业务图形。
            </p>
          </div>

          <div className="space-y-10">
            <div>
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-fd-foreground">基础布局</h3>
                  <p className="mt-1 text-sm text-fd-muted-foreground">
                    适合社群网络、层级关系、流程依赖等通用图分析。
                  </p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {relationshipLayouts.map((g) => (
                  <LayoutCard key={g.type} item={g} />
                ))}
              </div>
            </div>

            <div>
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-fd-foreground">定制布局</h3>
                  <p className="mt-1 text-sm text-fd-muted-foreground">
                    围绕业务结构设计，当前展示脑图、鱼骨图等示例，后续可扩展更多专用布局。
                  </p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {customLayouts.map((g) => (
                  <LayoutCard key={g.type} item={g} featured />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      */}

      {/* <StatsBand /> */}

      <section className="home-performance-section">
        <div className="mx-auto w-full max-w-6xl px-6 py-20 sm:py-24">
          <div className="grid items-start gap-10 lg:grid-cols-[0.74fr_1.26fr]">
            <div className="home-performance-copy">
              <span className="home-kicker">Performance</span>
              <h2 className="mt-4 text-3xl font-semibold text-fd-foreground sm:text-4xl">
                极速增量，轻盈交互
              </h2>
              <p className="mt-4 max-w-md leading-7 text-fd-muted-foreground">
                统一增量链路，精准 Patch 更新，告别全量渲染，让每一次交互都快速响应。
              </p>
              <div className="home-perf-stats">
                {perfSummary.map((item) => (
                  <div key={item.label}>
                    <strong>{item.value}</strong>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>

              <div className="home-perf-pipeline">
                {perfFlow.map((item, index) => (
                  <div key={item} className="home-perf-step">
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="home-benchmark-panel">
              <div className="home-benchmark-body">
                <div className="home-benchmark-summary">
                  <div>
                    <h3 className="text-xl font-semibold text-fd-foreground">5000 节点力导向图</h3>
                  </div>
                </div>

                <div className="home-benchmark-table">
                  <div className="home-benchmark-head">
                    <span>交互动作</span>
                    <span>响应速度</span>
                    <span>体验优化点</span>
                  </div>
                  {perf.map((p) => (
                    <PerformanceRow key={p.action} item={p} />
                  ))}
                </div>

                <p className="home-benchmark-footer">
                  基于 5000 节点力导向图，聚焦渲染后的高频交互更新。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto w-full max-w-6xl px-6 py-20 sm:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-[1.14fr_0.86fr]">
            <div className="lg:order-2">
              <span className="home-kicker">Developer Experience</span>
              <h2 className="mt-4 text-3xl font-semibold text-fd-foreground sm:text-4xl">
                极简配置，即刻出图
              </h2>
              <p className="mt-4 max-w-md text-lg leading-8 text-fd-muted-foreground">
                声明式配置数据、布局与交互。延续 AntV 心智，几行代码完成完整渲染。
              </p>
              <ul className="mt-7 space-y-3 text-sm">
                {[
                  '声明式 API，零学习成本',
                  '配置驱动渲染，代码极简',
                  '状态更新收敛至 GPU Patch',
                ].map((t) => (
                  <li key={t} className="flex items-center gap-3">
                    <CheckCircle2 className="size-4 shrink-0 text-[var(--brand-accent)]" />
                    <span className="text-fd-foreground/90">{t}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/docs/guides/data"
                className="mt-8 inline-flex font-medium text-[var(--brand-accent)] hover:underline"
              >
                查看完整指南
              </Link>
            </div>
            <div className="lg:order-1">
              <LegacyCodeBlock code={codeExample} lang="ts" filename="graph.ts" />
            </div>
          </div>
        </div>
      </section>

      <section className="home-features-section">
        <div className="home-features-shell mx-auto w-full max-w-7xl px-6 py-20 sm:py-24">
          <div className="home-live-graph-layout">
            <div className="home-live-graph-copy">
              <span className="home-kicker">Why G6-GL</span>
              <h2 className="home-live-graph-title mt-4 text-3xl font-semibold text-fd-foreground">
                <span>轻量内核，全能体验</span>
              </h2>
              <p className="mt-3 leading-7 text-fd-muted-foreground">
                G6-GL 是面向大规模关系网络的可视化底座。融合 WebGL 加速、GPU
                拾取与常用布局算法，让复杂图在浏览器中流畅运行。
              </p>

              <div className="home-live-graph-metrics" aria-label="G6-GL 性能指标">
                <div className="home-live-graph-primary-metric">
                  <strong>~0ms</strong>
                  <span>实时状态更新</span>
                  <small>高亮 / 选中 / 聚焦</small>
                </div>
                <div className="home-live-graph-secondary-metrics">
                  <div>
                    <strong>5k</strong>
                    <span>benchmark 节点</span>
                  </div>
                  <div>
                    <strong>0.1ms</strong>
                    <span>GPU picking</span>
                  </div>
                </div>
              </div>

              <div className="home-live-graph-signal">
                <span aria-hidden />
                轻量易用，稳定可靠
              </div>
            </div>

            <FeatureGraphShowcase />
          </div>
        </div>
      </section>

      <section className="border-t border-fd-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-8 px-6 py-16 sm:py-20 lg:flex-row lg:items-center">
          <div>
            <span className="home-kicker">Start Building</span>
            <h2 className="mt-4 text-3xl font-semibold text-fd-foreground sm:text-4xl">
              开始使用 G6-GL
            </h2>
            <p className="mt-3 max-w-xl leading-7 text-fd-muted-foreground">
              一行命令安装，30 分钟跑通你的第一个大规模图可视化场景。
            </p>
            <div className="home-install-terminal mt-6">
              <div className="home-terminal-glow" />
              <div className="home-install-terminal-bar">
                <div className="home-terminal-dots" aria-hidden>
                  <span />
                  <span />
                  <span />
                </div>
                <span className="home-terminal-title">install.sh</span>
                <span className="home-terminal-status">
                  <span aria-hidden />
                  ready
                </span>
              </div>
              <div className="home-install-command">
                <span className="home-install-prompt">$</span>
                <span className="truncate">npm install @antv/g6-gl</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/docs/getting-started/quick-start"
              className="home-button home-button-primary"
            >
              快速开始
            </Link>
            <Link href="/docs" className="home-button home-button-secondary">
              阅读文档
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function LayoutCard({
  item,
  featured,
}: {
  item: (typeof relationshipLayouts)[number];
  featured?: boolean;
}) {
  return (
    <Link
      href="/docs/guides/layout"
      className="group overflow-hidden rounded-2xl bg-fd-card transition duration-200 hover:-translate-y-1"
    >
      <div
        className={
          featured
            ? 'relative aspect-[2.25] overflow-hidden'
            : 'relative aspect-[1.45] overflow-hidden'
        }
        style={{ backgroundColor: item.bg }}
      >
        <Image
          src={withBasePath(`/layouts/${item.type}.png`)}
          alt={`${item.title}布局示例`}
          fill
          sizes={
            featured
              ? '(min-width: 768px) 50vw, 100vw'
              : '(min-width: 1024px) 20vw, (min-width: 640px) 50vw, 100vw'
          }
          loading="lazy"
          className="home-graph-image object-contain p-4 transition duration-200 group-hover:scale-[1.03]"
        />
      </div>
      <div className="px-4 py-4">
        <h4 className="font-semibold text-fd-foreground">{item.title}</h4>
        <p className="mt-1 text-sm leading-6 text-fd-muted-foreground">{item.desc}</p>
      </div>
    </Link>
  );
}

function PerformanceRow({ item }: { item: (typeof perf)[number] }) {
  return (
    <div className="home-perf-row">
      <h3 className="home-perf-action">{item.action}</h3>
      <strong className="home-perf-speed" aria-label={`${item.action}响应速度 ${item.speed}`}>
        {item.speed}
      </strong>
      <p className="home-perf-benefit">
        <span>{item.benefit}</span>
        <small>（{item.detail}）</small>
      </p>
    </div>
  );
}

function FeatureGraphShowcase() {
  return (
    <div className="home-graph-process">
      <div className="home-graph-process-title">
        <span>FROM DATA TO INTERACTION</span>
        <strong>复杂关系数据，转化为流畅可交互的图</strong>
      </div>

      <div className="home-graph-process-stage home-graph-process-before">
        <div className="home-graph-process-stage-label">
          <span>01 · INPUT</span>
          <strong>复杂原始关系</strong>
          <small>5K NODES · RAW DATA</small>
        </div>
        <svg viewBox="0 0 220 240" aria-label="尚未布局的复杂原始关系数据">
          <g className="home-graph-before-edges">
            <path d="M28 116 L68 42 L176 72 L54 194 L192 160 L104 24 L138 212 L28 116" />
            <path d="M48 68 L184 112 L86 178 L118 56 L166 192 L48 68" />
            <path d="M34 154 L154 38 L198 138 L72 116 L124 204 L34 154" />
            <path d="M68 42 L86 178 M176 72 L34 154 M54 194 L184 112 M104 24 L166 192" />
            <path d="M18 88 L94 96 L146 22 L206 82 L152 126 L206 182" />
            <path d="M22 178 L74 156 L132 76 L188 38 M42 28 L118 56 L178 214" />
            <path d="M18 132 L112 220 L152 126 L210 118 M94 96 L124 204 M74 156 L176 72" />
            <path d="M42 28 L48 68 M146 22 L154 38 M206 82 L184 112 M206 182 L166 192 M22 178 L34 154" />
          </g>
          <g className="home-graph-before-nodes">
            {[
              [28,116],[68,42],[176,72],[54,194],[192,160],[104,24],[138,212],
              [48,68],[184,112],[86,178],[118,56],[166,192],[34,154],[154,38],
              [198,138],[72,116],[124,204],[18,88],[94,96],[146,22],[206,82],
              [152,126],[206,182],[22,178],[74,156],[132,76],[188,38],[42,28],
              [178,214],[18,132],[112,220],[210,118],
            ].map(([cx, cy], index) => (
              <circle
                key={index}
                className={index === 19 || index === 22 || index === 25 ? 'is-hub' : undefined}
                cx={cx}
                cy={cy}
                r={index === 19 || index === 22 || index === 25 ? 5.8 : index % 5 === 0 ? 4.8 : 3.1}
              />
            ))}
          </g>
        </svg>
      </div>

      <div className="home-graph-process-flow home-graph-process-flow-in" aria-hidden>
        <span />
      </div>

      <div className="home-graph-process-core">
        <div className="home-graph-process-core-head">
          <Network className="size-5" />
          <div><strong>G6-GL</strong><small>WEBGL GRAPH ENGINE</small></div>
        </div>
        <div className="home-graph-process-steps">
          <span><Layers3 className="size-3.5" /><b>Layout</b><small>自动布局</small></span>
          <span><Network className="size-3.5" /><b>WebGL</b><small>批量渲染</small></span>
          <span><MousePointerClick className="size-3.5" /><b>Picking</b><small>精准命中</small></span>
          <span><Zap className="size-3.5" /><b>Patch</b><small>增量更新</small></span>
        </div>
      </div>

      <div className="home-graph-process-flow home-graph-process-flow-out" aria-hidden>
        <span />
      </div>

      <div className="home-graph-process-stage home-graph-process-after">
        <div className="home-graph-process-stage-label">
          <span>03 · OUTPUT</span>
          <strong>清晰、流畅、可交互</strong>
          <small>0.1MS PICKING · ~0MS UPDATE</small>
        </div>
        <svg viewBox="0 0 220 240" aria-label="完成布局并支持实时交互的关系图">
          <defs>
            <linearGradient id="home-engine-flow" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ff477e" />
              <stop offset="52%" stopColor="#786cff" />
              <stop offset="100%" stopColor="#20d5bc" />
            </linearGradient>
          </defs>
          <g className="home-graph-after-edges">
            <path className="is-trunk" d="M110 116 L62 72 M110 116 L58 152 M110 116 L112 48 M110 116 L164 72 M110 116 L166 150" />
            <path d="M62 72 L36 46 M62 72 L30 86 M62 72 L48 112 M36 46 L18 62 M30 86 L14 108 M48 112 L22 136" />
            <path d="M58 152 L28 142 M58 152 L42 188 M58 152 L78 204 M28 142 L14 166 M42 188 L22 212 M78 204 L58 226" />
            <path d="M112 48 L90 24 M112 48 L134 20 M112 48 L150 42 M90 24 L68 34 M134 20 L158 16" />
            <path d="M164 72 L190 44 M164 72 L198 82 M164 72 L178 112 M190 44 L210 26 M198 82 L216 62" />
            <path d="M166 150 L198 132 M166 150 L194 176 M166 150 L152 204 M198 132 L216 150 M194 176 L210 202 M152 204 L174 224" />
            <path className="is-active" d="M18 62 L36 46 L62 72 L110 116 L164 72 L198 82 L216 62" />
          </g>
          <g className="home-graph-after-nodes">
            {[
              [110,116,8],[62,72,5.5],[58,152,5.5],[112,48,5.5],[164,72,5.5],[166,150,5.5],
              [36,46,3.7],[30,86,3.7],[48,112,3.7],[18,62,3],[14,108,3],[22,136,3],
              [28,142,3.7],[42,188,3.7],[78,204,3.7],[14,166,3],[22,212,3],[58,226,3],
              [90,24,3.7],[134,20,3.7],[150,42,3.7],[68,34,3],[158,16,3],
              [190,44,3.7],[198,82,3.7],[178,112,3.7],[210,26,3],[216,62,3],
              [198,132,3.7],[194,176,3.7],[152,204,3.7],[216,150,3],[210,202,3],[174,224,3],
            ].map(([cx, cy, r], index) => (
              <circle
                key={index}
                className={`${index > 0 && index < 6 ? 'is-community-hub' : ''} ${index === 27 ? 'is-picked' : ''}`}
                cx={cx}
                cy={cy}
                r={r}
              />
            ))}
          </g>
          <circle className="home-graph-picking-ring" cx="216" cy="62" r="11" />
        </svg>
        <div className="home-graph-process-result-badges">
          <span><strong>0.1ms</strong> GPU Picking</span>
          <span><strong>~0ms</strong> State Patch</span>
        </div>
      </div>
    </div>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}
