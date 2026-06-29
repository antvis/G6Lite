import Link from 'next/link';
import Image from 'next/image';
import type { LucideIcon } from 'lucide-react';
import {
  Boxes,
  CheckCircle2,
  Layers3,
  MousePointerClick,
  Network,
  PackageCheck,
  Sparkles,
  Zap,
} from 'lucide-react';

import { CodeBlock } from './code-block';
import { StatsBand } from './stats-band';

// 缩略图为真实 g6-lite(WebGL)渲染的截图,见 public/layouts/*.png。
// 重新生成:npx vite --port 5179 --no-open & 然后 node scripts/capture-thumbnails.mjs。
const relationshipLayouts = [
  { type: 'force', title: '力导向', desc: '社群结构自然展开', bg: '#e8efff' },
  { type: 'circular', title: '环形', desc: '环状关系一览', bg: '#dff9ef' },
  { type: 'radial', title: '辐射', desc: '以中心向外发散', bg: '#ffe4ec' },
  { type: 'dagre', title: 'DAG / 层级', desc: '有向流程分层', bg: '#fff1c9' },
  { type: 'grid', title: '网格', desc: '规整对齐排布', bg: '#ddf7ff' },
];

const customLayouts = [
  { type: 'mindmap', title: '脑图', desc: '树状层级双向展开', bg: '#efe5ff' },
  { type: 'fishbone', title: '鱼骨图', desc: '因果分析定制布局', bg: '#ffe3da' },
];

const heroCases = [
  { ...relationshipLayouts[0], kind: '基础布局' },
  { ...relationshipLayouts[2], kind: '基础布局' },
  { ...customLayouts[0], kind: '定制布局' },
  { ...customLayouts[1], kind: '定制布局' },
  { ...relationshipLayouts[4], kind: '基础布局' },
  { ...relationshipLayouts[1], kind: '基础布局' },
];

type Feature = {
  icon: LucideIcon;
  title: string;
  tag: string;
  desc: string;
};

const features: Feature[] = [
  {
    icon: Zap,
    title: '增量交互零成本',
    tag: '性能',
    desc: '高亮、选中、状态变更走 GPU patch + RefreshLevel 分级调度，单次开销约 0ms。',
  },
  {
    icon: MousePointerClick,
    title: 'GPU 拾取',
    tag: '性能',
    desc: '基于 Framebuffer 的颜色拾取，0.1ms 完成命中检测，适合高频交互分析。',
  },
  {
    icon: Network,
    title: 'WebGL 渲染管线',
    tag: '渲染',
    desc: '多 program 调度、process / render 分离、Float32Array 指数增长缓冲。',
  },
  {
    icon: Layers3,
    title: '14 种内置布局',
    tag: '布局',
    desc: 'force / circular / dagre / radial / concentric 等，外加自研鱼骨、缩进树和脑图。',
  },
  {
    icon: Boxes,
    title: '12 个交互行为',
    tag: '交互',
    desc: 'clickSelect / dragNode / hoverHighlight / brushSelect / lassoSelect 等可组合使用。',
  },
  {
    icon: PackageCheck,
    title: '极致轻量',
    tag: '体积',
    desc: '核心引擎约 28KB（brotli），全量含布局也只约 99KB。',
  },
];

// 性能对比：仅展示 G6Lite 领先的交互维度（数据来自 2025-05-09 vs sigma.js 实测基线）。
const perf = [
  {
    metric: '高亮一个节点',
    g6lite: '~0ms',
    rival: '4-9ms',
    times: '实时',
    bar: 0.06,
    rivalBar: 1,
    desc: '只 patch 变化的 GPU 缓冲区，不重绘全图。',
  },
  {
    metric: '状态变更',
    g6lite: '~0ms',
    rival: '3-7ms',
    times: '实时',
    bar: 0.06,
    rivalBar: 1,
    desc: 'RefreshLevel 分级调度，按需刷新。',
  },
  {
    metric: '拾取命中检测',
    g6lite: '0.1ms',
    rival: '0.2ms',
    times: '2x',
    bar: 0.5,
    rivalBar: 1,
    desc: 'GPU Framebuffer 颜色拾取，减少 CPU 侧计算。',
  },
];

const codeExample = `import { Graph } from '@antv/g6-lite';

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
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 pb-14 pt-24 lg:grid-cols-[0.95fr_1fr] lg:pb-20 lg:pt-32">
          <div className="animate-in-up">
            <div className="flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-2xl bg-[var(--brand-accent)] text-white">
                <Sparkles className="size-6" />
              </span>
              <div>
                <div className="text-xs font-semibold uppercase text-fd-muted-foreground">AntV</div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-semibold text-fd-foreground">G6Lite</span>
                  <span className="rounded-full bg-fd-secondary px-2 py-0.5 text-xs text-fd-muted-foreground">v0.1.0</span>
                </div>
              </div>
            </div>
            <h1 className="mt-7 max-w-2xl text-[2.5rem] font-semibold leading-[1.14] text-fd-foreground sm:text-[3.25rem]">
              新一代高性能 WebGL 图可视化引擎
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-fd-muted-foreground">
              面向大规模图分析的轻量引擎。万级节点流畅渲染，高频交互增量更新，布局、渲染与行为开箱组合。
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/docs/guide/quick-start" className="home-button home-button-primary">
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

          <div className="animate-in-up home-prompt-card" style={{ animationDelay: '0.12s' }}>
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-fd-foreground">
                <Sparkles className="size-4 text-[var(--brand-accent)]" />
                渲染一张关系图
              </div>
              <span className="font-mono text-xs text-fd-muted-foreground">WebGL</span>
            </div>
            <div className="px-5 pb-5">
              <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[var(--brand-blue-soft)] text-sm">🌐</span>
                <div className="min-w-0 flex-1 truncate text-sm text-fd-foreground">10k 节点社群关系网络</div>
                <Link href="/docs/guide/quick-start" className="shrink-0 rounded-full bg-[var(--brand-accent)] px-4 py-2 text-sm font-semibold text-white">
                  快速开始
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="home-case-strip pb-16">
          <div className="home-case-track">
            {heroCases.map((item, index) => (
              <Link
                key={`${item.type}-${index}`}
                href="/docs/guide/layout"
                className="home-case-card group"
                style={{ backgroundColor: item.bg }}
              >
                <div className="relative h-full min-h-56">
                  <Image
                    src={`/layouts/${item.type}.png`}
                    alt={`${item.title}布局示例`}
                    fill
                    sizes="320px"
                    loading={index < 2 ? 'eager' : 'lazy'}
                    className="home-graph-image object-contain p-8 transition duration-200 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="absolute left-4 top-4 rounded-full bg-white/75 px-2.5 py-1 text-xs font-semibold text-fd-muted-foreground backdrop-blur">
                  {item.kind}
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white/85 to-transparent px-5 pb-4 pt-12">
                  <h3 className="text-base font-semibold text-fd-foreground">{item.title}</h3>
                  <p className="mt-1 text-sm text-fd-muted-foreground">{item.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[var(--home-muted-bg)]">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
          <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <span className="home-kicker">Layout Cases</span>
              <h2 className="mt-3 text-3xl font-semibold text-fd-foreground sm:text-4xl">关系网络与定制图形，一套引擎承载</h2>
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
                  <p className="mt-1 text-sm text-fd-muted-foreground">适合社群网络、层级关系、流程依赖等通用图分析。</p>
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
                  <p className="mt-1 text-sm text-fd-muted-foreground">围绕业务结构设计，当前展示脑图、鱼骨图等示例，后续可扩展更多专用布局。</p>
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

      <StatsBand />

      <section className="bg-[var(--home-muted-bg)]">
        <div className="mx-auto w-full max-w-6xl px-6 py-20 sm:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <span className="home-kicker">Performance</span>
            <h2 className="mt-4 text-3xl font-semibold text-fd-foreground sm:text-4xl">交互更新，近乎零成本</h2>
            <p className="mt-3 leading-7 text-fd-muted-foreground">
              大规模图分析中，真正高频的是高亮、选中、邻居聚焦。G6Lite 只更新变化的那一小块缓冲区。
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {perf.map((p) => (
              <div key={p.metric} className="home-panel p-6">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-semibold text-fd-foreground">{p.metric}</h3>
                  <span className="rounded-full bg-[var(--brand-accent-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--brand-accent)]">
                    {p.times}
                  </span>
                </div>

                <div className="mt-7 space-y-4">
                  <MetricBar label="G6Lite" value={p.g6lite} width={p.bar} strong />
                  <MetricBar label="sigma.js" value={p.rival} width={p.rivalBar} />
                </div>

                <p className="mt-6 text-sm leading-6 text-fd-muted-foreground">{p.desc}</p>
              </div>
            ))}
          </div>

          <p className="mt-8 text-center text-xs text-fd-muted-foreground">
            数据来自 2025-05-09 与 sigma.js 的对比基线（5000 节点力导向图）。
            <Link href="/docs/metrics/performance" className="ml-1 font-medium text-[var(--brand-accent)] hover:underline">
              查看完整性能指标
            </Link>
          </p>
        </div>
      </section>

      <section>
        <div className="mx-auto w-full max-w-6xl px-6 py-20 sm:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-[0.86fr_1.14fr]">
            <div>
              <span className="home-kicker">Developer Experience</span>
              <h2 className="mt-4 text-3xl font-semibold text-fd-foreground sm:text-4xl">几行代码，渲染一张图</h2>
              <p className="mt-4 max-w-md text-lg leading-8 text-fd-muted-foreground">
                声明式配置数据、布局、交互与主题。渲染后的每一次交互更新，都只动变化的那一小块缓冲区。
              </p>
              <ul className="mt-7 space-y-3 text-sm">
                {['声明式 API，与 AntV 生态一致', '布局 / 渲染 / 交互可独立组合', '增量更新 ~0ms，不重绘全图'].map((t) => (
                  <li key={t} className="flex items-center gap-3">
                    <CheckCircle2 className="size-4 shrink-0 text-[var(--brand-accent)]" />
                    <span className="text-fd-foreground/90">{t}</span>
                  </li>
                ))}
              </ul>
              <Link href="/docs/guide/data" className="mt-8 inline-flex font-medium text-[var(--brand-accent)] hover:underline">
                查看完整指南
              </Link>
            </div>
            <CodeBlock code={codeExample} lang="ts" filename="graph.ts" />
          </div>
        </div>
      </section>

      <section className="bg-[var(--home-muted-bg)]">
        <div className="mx-auto w-full max-w-6xl px-6 py-20 sm:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <span className="home-kicker">Why G6Lite</span>
            <h2 className="mt-4 text-3xl font-semibold text-fd-foreground sm:text-4xl">为大规模图分析保留关键能力</h2>
            <p className="mt-3 leading-7 text-fd-muted-foreground">聚焦渲染、交互、布局和体积，把浏览器里的图分析体验做得更轻。</p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <FeatureCard key={f.title} feature={f} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-fd-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-8 px-6 py-16 sm:py-20 lg:flex-row lg:items-center">
          <div>
            <span className="home-kicker">Start Building</span>
            <h2 className="mt-4 text-3xl font-semibold text-fd-foreground sm:text-4xl">开始使用 G6Lite</h2>
            <p className="mt-3 max-w-xl leading-7 text-fd-muted-foreground">一行命令安装，30 分钟跑通你的第一个大规模图可视化场景。</p>
            <div className="mt-5 inline-flex max-w-full items-center gap-3 rounded-xl border border-fd-border bg-fd-secondary px-4 py-3 font-mono text-sm text-fd-muted-foreground">
              <span className="text-[var(--brand-accent)]">$</span>
              <span className="truncate">npm install @antv/g6-lite</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/docs/guide/quick-start" className="home-button home-button-primary">
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
      href="/docs/guide/layout"
      className="group overflow-hidden rounded-2xl bg-fd-card transition duration-200 hover:-translate-y-1"
    >
      <div className={featured ? 'relative aspect-[2.25] overflow-hidden' : 'relative aspect-[1.45] overflow-hidden'} style={{ backgroundColor: item.bg }}>
        <Image
          src={`/layouts/${item.type}.png`}
          alt={`${item.title}布局示例`}
          fill
          sizes={featured ? '(min-width: 768px) 50vw, 100vw' : '(min-width: 1024px) 20vw, (min-width: 640px) 50vw, 100vw'}
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

function MetricBar({
  label,
  value,
  width,
  strong,
}: {
  label: string;
  value: string;
  width: number;
  strong?: boolean;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className={strong ? 'text-xs font-semibold text-fd-foreground' : 'text-xs font-medium text-fd-muted-foreground'}>{label}</span>
        <span className={strong ? 'font-mono text-2xl font-semibold text-[var(--brand-accent)]' : 'font-mono text-lg font-semibold text-fd-muted-foreground'}>
          {value}
        </span>
      </div>
      <div className="h-2 rounded-full bg-fd-secondary">
        <div
          className={strong ? 'h-full rounded-full bg-[var(--brand-accent)]' : 'h-full rounded-full bg-fd-muted-foreground/35'}
          style={{ width: `${Math.max(width * 100, strong ? 7 : 12)}%` }}
        />
      </div>
    </div>
  );
}

function FeatureCard({ feature }: { feature: Feature }) {
  const Icon = feature.icon;
  return (
    <div className="home-panel p-6">
      <div className="flex items-center justify-between gap-4">
        <span className="grid size-10 place-items-center rounded-xl bg-[var(--brand-accent-soft)] text-[var(--brand-accent)]">
          <Icon className="size-5" />
        </span>
        <span className="rounded-full bg-fd-secondary px-2.5 py-1 text-xs font-medium text-fd-muted-foreground">{feature.tag}</span>
      </div>
      <h3 className="mt-4 text-lg font-semibold text-fd-foreground">{feature.title}</h3>
      <p className="mt-2 text-sm leading-6 text-fd-muted-foreground">{feature.desc}</p>
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
