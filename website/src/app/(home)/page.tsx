import Link from 'next/link';

// 缩略图为真实 g6-lite(WebGL)渲染的截图,见 public/layouts/*.png。
// 重新生成:npx vite --port 5179 --no-open & 然后 node scripts/capture-thumbnails.mjs。
// 配色参考 AntV 分类色板:每张卡一种靓丽但浅的底色,与图元强调色对应。
const gallery = [
  { type: 'force', title: '力导向', desc: '社群结构自然展开', bg: '#eef3ff' },
  { type: 'circular', title: '环形', desc: '环状关系一览', bg: '#eafaf4' },
  { type: 'radial', title: '辐射', desc: '以中心向外发散', bg: '#fdf1ee' },
  { type: 'dagre', title: 'DAG / 层级', desc: '有向流程分层', bg: '#fff8e8' },
  { type: 'grid', title: '网格', desc: '规整对齐排布', bg: '#eef9fb' },
  { type: 'mindmap', title: '脑图', desc: '树状层级展开', bg: '#f4eefc' },
];

const features = [
  {
    emoji: '⚡',
    title: '增量交互零成本',
    tag: '性能',
    desc: '高亮、选中、状态变更走 GPU patch + RefreshLevel 分级调度，单次开销约 0ms，频繁交互始终流畅。',
  },
  {
    emoji: '🎯',
    title: 'GPU 拾取',
    tag: '性能',
    desc: '基于 Framebuffer 的颜色拾取，0.1ms 完成命中检测，优于传统空间索引方案。',
  },
  {
    emoji: '🖥️',
    title: 'WebGL 渲染管线',
    tag: '渲染',
    desc: '多 program 调度、process / render 分离、Float32Array 指数增长缓冲，万级节点稳定渲染。',
  },
  {
    emoji: '🧭',
    title: '14 种内置布局',
    tag: '布局',
    desc: 'force / circular / dagre / radial / concentric 等，外加自研鱼骨 / 缩进树 / 脑图，≥1000 节点自动 Worker。',
  },
  {
    emoji: '🖱️',
    title: '12 个交互行为',
    tag: '交互',
    desc: 'clickSelect / dragNode / hoverHighlight / brushSelect / lassoSelect 等，开箱即用、可组合。',
  },
  {
    emoji: '🪶',
    title: '极致轻量',
    tag: '体积',
    desc: '核心引擎仅 ~28KB（brotli），全量含 14 种布局也只 ~99KB，约为 G6 v5 的 1/4。',
  },
];

const stats = [
  { value: '~0ms', label: '高亮 / 状态变更开销' },
  { value: '~28KB', label: '核心引擎 (brotli)' },
  { value: '14', label: '内置布局算法' },
  { value: '10k+', label: '可流畅渲染节点' },
];

// 性能对比：仅展示 G6Lite 领先的交互维度（数据来自 2025-05-09 vs sigma.js 实测基线）
const perf = [
  { metric: '高亮一个节点', g6lite: '~0ms', rival: '4–9ms', times: '碾压', desc: 'GPU patch 仅更新变化的缓冲区，不重绘全图' },
  { metric: '状态变更', g6lite: '~0ms', rival: '3–7ms', times: '碾压', desc: 'RefreshLevel 分级调度，按需刷新' },
  { metric: '拾取（命中检测）', g6lite: '0.1ms', rival: '0.2ms', times: '2×', desc: 'GPU Framebuffer 颜色拾取，优于空间索引' },
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
    <main className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 pt-24 pb-16 lg:grid-cols-[1.1fr_1fr] lg:pt-32 lg:pb-20">
          {/* 左 */}
          <div className="animate-in-up">
            <span className="inline-flex items-center gap-2 rounded-full bg-fd-primary/10 px-4 py-1.5 text-sm font-medium text-fd-primary">
              轻量 · 高性能 · 开箱即用
            </span>
            <h1 className="mt-6 text-[2.75rem] font-bold leading-[1.25] tracking-tight text-fd-foreground sm:text-[3.25rem]">
              基于 <span className="text-fd-primary">WebGL</span> 的
              <br />
              <span className="text-fd-primary">大规模</span>图可视化引擎
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-fd-muted-foreground">
              为大规模图分析而生。万级节点实时渲染，高频交互零延迟，
              核心 ~28KB（约 G6 v5 的 1/4）——性能与轻量兼得。
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/docs/guide/quick-start"
                className="rounded-full bg-fd-primary px-6 py-3 text-base font-medium text-white shadow-lg shadow-fd-primary/25 transition-transform hover:-translate-y-0.5"
              >
                快速开始
              </Link>
              <a
                href="https://github.com/antvis/G6Lite"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-fd-border bg-fd-card px-6 py-3 text-base font-medium transition-colors hover:bg-fd-accent"
              >
                <GitHubIcon />
                GitHub
              </a>
            </div>
          </div>

          {/* 右：终端窗口 */}
          <div
            className="animate-in-up overflow-hidden rounded-xl border border-fd-border bg-fd-card shadow-xl shadow-black/5"
            style={{ animationDelay: '0.15s' }}
          >
            {/* 标题栏 */}
            <div className="flex items-center gap-2 border-b border-fd-border bg-fd-secondary/60 px-4 py-3">
              <span className="size-3 rounded-full bg-[#ff5f57]" />
              <span className="size-3 rounded-full bg-[#febc2e]" />
              <span className="size-3 rounded-full bg-[#28c840]" />
              <span className="ml-2 font-mono text-xs text-fd-muted-foreground">bash — @antv/g6-lite</span>
            </div>
            {/* 命令行区 */}
            <div className="space-y-2 px-5 py-5 font-mono text-sm leading-relaxed">
              <div className="flex items-center gap-2">
                <span className="select-none text-fd-primary">$</span>
                <span className="text-fd-foreground">npm install @antv/g6-lite</span>
              </div>
              <div className="text-fd-muted-foreground">
                <span className="text-[#28a745]">+</span> @antv/g6-lite@1.0.0
              </div>
              <div className="flex items-center gap-2">
                <span className="select-none text-fd-primary">$</span>
                <span className="inline-block h-4 w-2 animate-pulse bg-fd-foreground/70 align-middle" />
              </div>
            </div>
          </div>
        </div>

        {/* 能力画廊：全宽无限横向跑马灯 */}
        <div className="marquee-mask relative w-full overflow-hidden pt-12 pb-20">
          {/* 两侧渐隐遮罩 */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-fd-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-fd-background to-transparent" />
          <div className="marquee-track gap-8 py-6">
            {[...gallery, ...gallery].map((g, i) => (
              <div
                key={`${g.title}-${i}`}
                className="group relative h-80 w-96 shrink-0 overflow-hidden rounded-3xl shadow-lg shadow-black/5 transition-transform duration-300 hover:rotate-0 hover:-translate-y-2"
                style={{
                  backgroundColor: g.bg,
                  rotate: i % 2 === 0 ? '-2.5deg' : '2.5deg',
                }}
              >
                {/* 真实 g6-lite 渲染截图,铺满卡片 */}
                <img
                  src={`/layouts/${g.type}.png`}
                  alt={`${g.title}布局示例`}
                  loading="lazy"
                  className="absolute inset-0 size-full object-contain p-8"
                />
                {/* 底部渐变蒙层 + 标题 */}
                <div
                  className="absolute inset-x-0 bottom-0 px-6 pb-5 pt-12"
                  style={{
                    background: `linear-gradient(to top, ${g.bg} 28%, color-mix(in srgb, ${g.bg} 70%, transparent) 60%, transparent 100%)`,
                  }}
                >
                  <h3 className="text-base font-semibold text-fd-foreground">{g.title}</h3>
                  <p className="mt-1 text-sm text-fd-muted-foreground">{g.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 数据墙 */}
      <section className="border-y border-fd-border bg-fd-card/40">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 py-14 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-4xl font-bold tracking-tight text-fd-primary">{s.value}</div>
              <div className="mt-2 text-sm text-fd-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 性能对比：交互维度的碾压 */}
      <section className="mx-auto w-full max-w-6xl px-6 py-24">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-fd-primary/30 bg-fd-primary/10 px-3.5 py-1.5 text-sm font-medium text-fd-primary">
            性能优势
          </span>
          <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">交互更新，近乎零成本</h2>
          <p className="mx-auto mt-3 max-w-2xl text-fd-muted-foreground">
            大规模图分析中，真正高频的是<strong className="text-fd-foreground">交互</strong>——高亮、选中、邻居聚焦。
            G6Lite 的增量更新只动变化的那一小块缓冲区，单次开销近 0ms。
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {perf.map((p) => (
            <div key={p.metric} className="relative overflow-hidden rounded-2xl border border-fd-border bg-fd-card p-6">
              <div className="flex items-baseline justify-between">
                <h3 className="font-semibold">{p.metric}</h3>
                <span className="rounded-full bg-fd-primary/10 px-2.5 py-1 text-xs font-medium text-fd-primary">
                  {p.times}
                </span>
              </div>
              <div className="mt-6 flex items-end gap-4">
                <div>
                  <div className="text-3xl font-bold text-fd-primary">{p.g6lite}</div>
                  <div className="mt-1 text-xs text-fd-muted-foreground">G6Lite</div>
                </div>
                <div className="pb-1 text-fd-muted-foreground">vs</div>
                <div>
                  <div className="text-2xl font-semibold text-fd-muted-foreground line-through decoration-fd-border">
                    {p.rival}
                  </div>
                  <div className="mt-1 text-xs text-fd-muted-foreground">sigma.js</div>
                </div>
              </div>
              <p className="mt-5 text-sm leading-relaxed text-fd-muted-foreground">{p.desc}</p>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-fd-muted-foreground">
          数据来自 2025-05-09 与 sigma.js 的对比基线（5000 节点力导向图）。
          <Link href="/docs/metrics/performance" className="ml-1 text-fd-primary hover:underline">
            查看完整性能指标 →
          </Link>
        </p>
      </section>

      {/* 代码演示 */}
      <section className="mx-auto w-full max-w-6xl px-6 py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">几行代码，渲染一张图</h2>
            <p className="mt-4 max-w-md text-lg text-fd-muted-foreground">
              声明式配置数据、布局、交互与主题。最关键的是——渲染后的每一次交互更新，都只动变化的那一小块缓冲区。
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {['声明式 API，与 AntV 生态一致', '布局 / 渲染 / 交互可独立组合', '增量更新 ~0ms，不重绘全图'].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <span className="text-fd-primary">✓</span>
                  {t}
                </li>
              ))}
            </ul>
            <Link href="/docs/guide/full-guide" className="mt-7 inline-flex items-center gap-1 font-medium text-fd-primary hover:underline">
              查看完整指南 →
            </Link>
          </div>
          <pre className="overflow-x-auto rounded-2xl border border-fd-border bg-fd-secondary p-6 text-sm leading-relaxed">
            <code>{codeExample}</code>
          </pre>
        </div>
      </section>

      {/* 核心能力 */}
      <section className="border-t border-fd-border bg-fd-card/40">
        <div className="mx-auto w-full max-w-6xl px-6 py-24">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">为什么选择 G6Lite</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-fd-muted-foreground">
            聚焦大规模渲染与高频交互，把该快的地方做到极致。
          </p>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="rounded-2xl border border-fd-border bg-fd-card p-6 transition-colors hover:border-fd-primary/40">
                <div className="flex items-center justify-between">
                  <div className="text-3xl">{f.emoji}</div>
                  <span className="rounded-full bg-fd-primary/10 px-2.5 py-1 text-xs font-medium text-fd-primary">
                    {f.tag}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-fd-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto w-full max-w-6xl px-6 py-28 text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">开始使用 G6Lite</h2>
        <p className="mx-auto mt-4 max-w-md text-lg text-fd-muted-foreground">
          一行命令安装，30 分钟跑通你的第一个大规模图。
        </p>
        <div className="mx-auto mt-8 inline-flex items-center gap-3 rounded-lg border border-fd-border bg-fd-card px-5 py-3 font-mono text-sm">
          <span className="text-fd-primary">$</span>
          npm install @antv/g6-lite
        </div>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            href="/docs/guide/quick-start"
            className="rounded-full bg-fd-primary px-6 py-3 text-base font-medium text-white shadow-lg shadow-fd-primary/25 transition-transform hover:-translate-y-0.5"
          >
            快速开始
          </Link>
          <Link href="/docs" className="rounded-full border border-fd-border bg-fd-card px-6 py-3 text-base font-medium transition-colors hover:bg-fd-accent">
            阅读文档
          </Link>
        </div>
      </section>
    </main>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}
