import { ArrowRight, Code2, Cpu, MousePointer2, Scan, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { withBasePath } from '@/lib/shared';

import styles from './tana-home.module.css';

const examples = [
  {
    title: '布局切换',
    description: '同一份数据，在 circular、force、grid 与 dagre 间切换。',
    images: ['/examples/layouts.png'],
    href: '/docs/examples/layouts',
    tag: '布局',
  },
  {
    title: 'Combo 分组',
    description: '把节点组织成清晰的业务分组与嵌套结构。',
    images: ['/examples/combo.png'],
    href: '/docs/examples/combo',
    tag: '分组',
  },
  {
    title: '脑图布局',
    description: '从中心主题向两侧展开层级与思路。',
    images: ['/layouts/mindmap.png'],
    href: '/docs/examples/layout-gallery',
    tag: '脑图',
  },
  {
    title: '鱼骨图',
    description: '沿主骨与分支梳理问题原因和业务因素。',
    images: ['/layouts/fishbone.png'],
    href: '/docs/examples/layout-gallery',
    tag: '鱼骨图',
  },
] as const;

const faqs = [
  {
    question: 'G6Lite 和 G6 v5 有什么区别？',
    answer:
      'G6Lite 延续 AntV 图可视化的核心心智，提供更聚焦的 WebGL 渲染与交互能力。已有 G6 v5 项目可以通过迁移指南逐项评估。',
  },
  {
    question: '能在 React、Vue 或原生 Web 项目中使用吗？',
    answer:
      '可以。G6Lite 通过包根导出提供 TypeScript API，只要宿主页面能够提供容器元素，就能创建和销毁 Graph 实例。',
  },
  {
    question: '怎样评估它在真实数据下的表现？',
    answer:
      '建议先运行真实数据示例，再结合技术指标文档中的环境、数据集与复现命令验证。页面不会用脱离环境的单一数字替代实际评估。',
  },
] as const;

const codeExample = `const graph = new Graph({
  container: 'graph',
  data,
  layout: { type: 'force' },
  behaviors: [
    'zoom-canvas',
    'drag-node',
    'hover-highlight',
  ],
});

await graph.render();`;

export function TanaHomePage({ preview = false }: { preview?: boolean }) {
  return (
    <main className={styles.root} lang="zh-CN">
      {preview ? (
        <div className={styles.previewBar}>
          <span>独立视觉预览</span>
          <p>当前官网首页已使用此方案</p>
          <Link href="/">打开正式首页</Link>
        </div>
      ) : null}

      <section className={styles.hero}>
        <div className={styles.shell}>
          <div className={styles.heroGrid}>
            <div className={styles.heroCopy}>
              <span className={styles.eyebrow}>G6Lite · AntV 图可视化引擎</span>
              <h1>
                让大规模关系图
                <br />
                在浏览器里<em>流畅探索</em>
              </h1>
              <p>
                轻量 WebGL 内核，融合 AntV
                布局能力与增量更新链路，让复杂关系图在浏览器中保持流畅交互。
              </p>
              <div className={styles.actions}>
                <Link className={styles.primaryButton} href="/ai">
                  <Sparkles aria-hidden="true" />用 AI 构建
                </Link>
                <Link className={styles.secondaryButton} href="/docs/examples">
                  查看示例
                  <ArrowRight aria-hidden="true" />
                </Link>
              </div>
            </div>

            <ProductStage />
          </div>
        </div>
      </section>

      <section className={styles.capabilities}>
        <div className={styles.shell}>
          <header className={`${styles.sectionHeader} ${styles.capabilityHeader}`}>
            <div>
              <span className={styles.sectionIndex}>01 / 核心能力</span>
              <h2>轻量内核，兼顾易用与性能</h2>
            </div>
            <p>G6Lite 将视口、状态和配置收敛为清晰 API，并通过增量更新减少重复工作。</p>
          </header>

          <div className={styles.bentoGrid}>
            <article className={`${styles.bentoCard} ${styles.scaleCard}`}>
              <CardHeading
                icon={<Scan aria-hidden="true" />}
                eyebrow="视口控制"
                title="缩放、聚焦与适配"
                description="缩放、聚焦、画布适配与坐标转换统一在同一套视口 API 中。"
              />
              <div className={styles.bentoGraph}>
                <Image
                  src={withBasePath('/examples/viewport-controls.png')}
                  alt="G6Lite 视口与坐标转换示例"
                  fill
                  sizes="(min-width: 1024px) 54vw, 92vw"
                />
                <span>Viewport · Camera</span>
              </div>
            </article>

            <article className={`${styles.bentoCard} ${styles.interactionCard}`}>
              <CardHeading
                icon={<MousePointer2 aria-hidden="true" />}
                eyebrow="数据与状态"
                title="查询、状态与可见性"
                description="通过元素查询、批量状态与可见性控制组织交互反馈。"
              />
              <div className={styles.interactionVisual}>
                <Image
                  src={withBasePath('/examples/queries-and-states.png')}
                  alt="G6Lite 查询与状态交互"
                  fill
                  sizes="(min-width: 1024px) 36vw, 92vw"
                />
              </div>
            </article>

            <article className={`${styles.bentoCard} ${styles.developerCard}`}>
              <CardHeading
                icon={<Code2 aria-hidden="true" />}
                eyebrow="开发体验"
                title="配置驱动，快速出图"
                description="延续 AntV 心智，不让渲染细节进入业务代码。"
              />
              <div className={styles.codeWindow}>
                <div className={styles.codeHeader}>
                  <span>graph.ts</span>
                  <small>● ready</small>
                </div>
                <pre>
                  <code>{codeExample}</code>
                </pre>
              </div>
            </article>

            <article className={`${styles.bentoCard} ${styles.pipelineCard}`}>
              <CardHeading
                icon={<Cpu aria-hidden="true" />}
                eyebrow="增量渲染"
                title="高频交互，只更新变化部分"
                description="GPU Picking 命中后，状态变化直接收敛到 Buffer Patch，避免重复布局与全量绘制。"
              />
              <div className={styles.pipelineVisual}>
                <div className={styles.renderPath}>
                  <div className={styles.pathLabel}>
                    <span>首次渲染</span>
                    <small>完整链路</small>
                  </div>
                  <div className={styles.pathSteps}>
                    {['数据', '布局', 'WebGL'].map((item, index) => (
                      <div key={item}>
                        <span>{String(index + 1).padStart(2, '0')}</span>
                        <strong>{item}</strong>
                        {index < 2 && <i aria-hidden="true">→</i>}
                      </div>
                    ))}
                  </div>
                </div>
                <div className={`${styles.renderPath} ${styles.fastPath}`}>
                  <div className={styles.pathLabel}>
                    <span>高频交互</span>
                    <small>局部更新</small>
                  </div>
                  <div className={styles.pathSteps}>
                    {['GPU 拾取', '状态', 'Buffer Patch'].map((item, index) => (
                      <div key={item}>
                        <span>{String(index + 1).padStart(2, '0')}</span>
                        <strong>{item}</strong>
                        {index < 2 && <i aria-hidden="true">→</i>}
                      </div>
                    ))}
                  </div>
                </div>
                <div className={styles.patchResult}>
                  <span aria-hidden="true" />
                  <strong>跳过重复布局与全量绘制</strong>
                  <small>只提交发生变化的 GPU Buffer</small>
                </div>
              </div>
              <Link className={styles.inlineLink} href="/docs/concepts/architecture">
                查看技术架构
                <ArrowRight aria-hidden="true" />
              </Link>
            </article>
          </div>
        </div>
      </section>

      <section className={styles.examplesSection}>
        <div className={styles.shell}>
          <header className={styles.sectionHeader}>
            <div>
              <span className={styles.sectionIndex}>02 / 示例场景</span>
              <h2>从真实案例开始探索</h2>
            </div>
            <Link className={styles.inlineLink} href="/docs/examples">
              查看全部示例
              <ArrowRight aria-hidden="true" />
            </Link>
          </header>

          <div className={styles.exampleGrid}>
            {examples.map((example) => (
              <Link className={styles.exampleCard} href={example.href} key={example.title}>
                <div className={styles.exampleImage}>
                  {example.images.map((image, index) => (
                    <div className={styles.exampleImageFrame} key={image}>
                      <Image
                        src={withBasePath(image)}
                        alt={`${example.title}${example.images.length > 1 ? `示例 ${index + 1}` : '示例图'}`}
                        fill
                        sizes={
                          example.images.length > 1
                            ? '(min-width: 900px) 13vw, 45vw'
                            : '(min-width: 900px) 26vw, 90vw'
                        }
                      />
                    </div>
                  ))}
                </div>
                <div className={styles.exampleCopy}>
                  <span>{example.tag}</span>
                  <h3>{example.title}</h3>
                  <p>{example.description}</p>
                  <ArrowRight aria-hidden="true" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.faqSection}>
        <div className={styles.shell}>
          <div className={styles.faqIntro}>
            <span className={styles.sectionIndex}>03 / 帮助与解答</span>
            <h2>常见问题</h2>
            <p>这里先回答定位、兼容性和迁移相关的问题，更多细节可以继续查看完整文档。</p>
          </div>
          <div className={styles.faqList}>
            {faqs.map((faq) => (
              <details key={faq.question}>
                <summary>
                  {faq.question}
                  <span aria-hidden="true">＋</span>
                </summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.finalCta}>
        <div className={styles.shell}>
          <div className={styles.ctaPanel}>
            <div className={styles.ctaGraph} aria-hidden="true">
              <svg viewBox="0 0 250 180">
                <path d="m28 92 58-54 73 30 62-42M28 92l66 55 65-79 62 65M86 38l8 109m65-79 62 65" />
                <circle cx="28" cy="92" r="8" />
                <circle cx="86" cy="38" r="8" />
                <circle cx="94" cy="147" r="8" />
                <circle cx="159" cy="68" r="11" />
                <circle cx="221" cy="26" r="8" />
                <circle cx="221" cy="133" r="8" />
              </svg>
            </div>
            <div className={styles.ctaCopy}>
              <span className={styles.eyebrow}>开始构建</span>
              <h2>开始使用 G6Lite</h2>
              <p>一行命令完成安装，然后按快速开始渲染第一张可交互关系图。</p>
              <div className={styles.ctaActions}>
                <div className={styles.installCommand}>
                  <span>$</span>
                  <code>npm install @antv/g6-lite</code>
                </div>
                <Link className={styles.primaryButton} href="/docs/getting-started/quick-start">
                  快速开始
                  <ArrowRight aria-hidden="true" />
                </Link>
              </div>
              <div className={styles.ctaLinks}>
                <Link href="/docs/examples">查看示例</Link>
                <Link href="/docs/compatibility/g6-v5-migration">从 G6 v5 迁移</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function CardHeading({
  icon,
  eyebrow,
  title,
  description,
}: {
  icon: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <header className={styles.cardHeading}>
      <div className={styles.cardIcon}>{icon}</div>
      <div>
        <span>{eyebrow}</span>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </header>
  );
}

function ProductStage() {
  return (
    <div className={styles.productStage}>
      <div className={styles.stageWindow}>
        <div className={styles.stageBar}>
          <div>
            <span />
            <span />
            <span />
          </div>
          <small>relationship-network.ts</small>
          <em>WebGL ready</em>
        </div>
        <div className={styles.stageCanvas}>
          <div className={styles.stageToolbar} aria-hidden="true">
            <span>＋</span>
            <span>−</span>
            <span>⌖</span>
          </div>
          <Image
            src={withBasePath('/examples/large.png')}
            alt="G6Lite 大规模关系网络渲染结果"
            fill
            priority
            sizes="(min-width: 1024px) 48vw, 92vw"
          />
          <aside className={styles.stageInspector}>
            <span>图概览</span>
            <strong>关系网络</strong>
            <dl>
              <div>
                <dt>渲染</dt>
                <dd>WebGL</dd>
              </div>
              <div>
                <dt>布局</dt>
                <dd>Force</dd>
              </div>
              <div>
                <dt>交互</dt>
                <dd>就绪</dd>
              </div>
            </dl>
          </aside>
        </div>
      </div>
    </div>
  );
}
