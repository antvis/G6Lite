import type { Locale } from '@/lib/i18n';
import styles from './docs-architecture-diagram.module.css';

const copy = {
  zh: {
    title: 'G6Lite 技术架构',
    description:
      '业务应用通过 Graph API 调用内核。Graph 编排数据模型、布局转换、交互和渲染调度；WebGL 与 Canvas 2D 协同绘制。右侧扩展通过公开契约接入对应模块，浏览器提供底层运行能力。',
    application: '业务应用',
    api: '公开入口 · Graph API',
    apiDetail: '数据 · 配置 · 状态 · 视口 · 事件',
    registry: '扩展注册',
    core: 'G6Lite 内核',
    extensions: '可插拔扩展',
    graph: 'Graph · 运行时编排',
    graphDetail: '初始化 · 更新 · 异步布局 · 资源销毁',
    data: '图数据与状态',
    layout: '布局与数据转换',
    scheduler: '渲染调度',
    interaction: '交互分发与行为',
    renderer: '协同渲染',
    plugin: '生命周期扩展',
    compute: '数据与布局扩展',
    behavior: '交互扩展',
    drawing: '绘制扩展',
    layers: ['标签 · 图标 · 装饰', '节点 · 边 · 按需 Picking', 'Combo 分组边界'],
    changes: '变更',
    draw: '更新画面',
    hit: '命中 / 事件',
    platform: '浏览器平台',
    dependency: '调用与数据依赖',
    extension: '扩展契约接入',
    caption: '内部模块由 Graph 统一组织，具体执行顺序见下方正文。',
  },
  en: {
    title: 'G6Lite technical architecture',
    description:
      'Applications call the core through Graph API. Graph coordinates data, layout, interaction, and rendering updates. WebGL and Canvas 2D draw together. Extensions on the right connect through public contracts; the browser provides the runtime platform.',
    application: 'Business application',
    api: 'Public entry · Graph API',
    apiDetail: 'Data · Options · State · Viewport · Events',
    registry: 'Registration',
    core: 'G6Lite core',
    extensions: 'Extension contracts',
    graph: 'Graph · Runtime orchestration',
    graphDetail: 'Initialization · Updates · Async layouts · Teardown',
    data: 'Graph data & state',
    layout: 'Layouts & transforms',
    scheduler: 'Render scheduling',
    interaction: 'Interaction & behaviors',
    renderer: 'Coordinated rendering',
    plugin: 'Lifecycle extensions',
    compute: 'Data & layout',
    behavior: 'Interaction',
    drawing: 'Drawing',
    layers: [
      'Labels · Icons · Decorations',
      'Nodes · Edges · On-demand picking',
      'Combo boundaries',
    ],
    changes: 'Changes',
    draw: 'Drawing',
    hit: 'Hits / events',
    platform: 'Browser platform',
    dependency: 'Calls & data dependencies',
    extension: 'Public extension contracts',
    caption: 'Graph coordinates the internal modules. Execution sequences are explained below.',
  },
};

interface CardProps {
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
  details: string[];
  tone?: 'api' | 'extension';
}

function Card({ x, y, width, height, title, details, tone }: CardProps) {
  const start = (height - 20 - details.length * 18) / 2;
  return (
    <g className={styles.card} data-tone={tone} transform={'translate(' + x + ' ' + y + ')'}>
      <rect width={width} height={height} rx="7" />
      <text className={styles.cardTitle} x={width / 2} y={start + 15} textAnchor="middle">
        {title}
      </text>
      {details.map((detail, index) => (
        <text
          className={styles.cardDetail}
          key={detail}
          x={width / 2}
          y={start + 36 + index * 18}
          textAnchor="middle"
        >
          {detail}
        </text>
      ))}
    </g>
  );
}

export function DocsArchitectureDiagram({ locale }: { locale: Locale }) {
  const text = copy[locale];
  const prefix = 'g6lite-architecture-' + locale;
  const arrow = 'url(#' + prefix + '-arrow)';
  const extensionArrow = 'url(#' + prefix + '-extension-arrow)';

  return (
    <figure className={styles.figure + ' not-prose'} aria-label={text.title}>
      <svg
        className={styles.diagram}
        viewBox="0 0 680 770"
        role="img"
        aria-labelledby={prefix + '-title ' + prefix + '-description'}
      >
        <title id={prefix + '-title'}>{text.title}</title>
        <desc id={prefix + '-description'}>{text.description}</desc>
        <defs>
          <marker
            id={prefix + '-arrow'}
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M1 1 9 5 1 9" className={styles.arrowhead} />
          </marker>
          <marker
            id={prefix + '-extension-arrow'}
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M1 1 9 5 1 9" className={styles.extensionArrowhead} />
          </marker>
        </defs>

        <rect className={styles.coreBoundary} x="8" y="174" width="474" height="502" rx="10" />
        <rect
          className={styles.extensionBoundary}
          x="502"
          y="174"
          width="170"
          height="502"
          rx="10"
        />
        <text className={styles.boundaryLabel} x="28" y="191">
          {text.core}
        </text>
        <text className={styles.extensionLabel} x="514" y="191">
          {text.extensions}
        </text>

        <g className={styles.connections} fill="none" markerEnd={arrow}>
          <path d="M245 62V86" />
          <path d="M245 140V210" />
          <path d="M245 266V280H129V304" />
          <path d="M245 280H361V304" />
          <path d="M260 342H230" />
          <path d="M129 380V418" />
          <path d="M129 494V540" />
          <path d="M361 540V494" />
        </g>
        <g className={styles.extensionConnections} fill="none" markerEnd={extensionArrow}>
          <path d="M587 140V166" />
          <path d="M514 238H462" />
          <path d="M514 342H462" />
          <path d="M514 456H462" />
          <path d="M514 601H462" />
        </g>

        <Card
          x={85}
          y={8}
          width={320}
          height={54}
          title={text.application}
          details={['Web · React · Vue']}
        />
        <Card
          x={20}
          y={86}
          width={450}
          height={54}
          title={text.api}
          details={[text.apiDetail]}
          tone="api"
        />
        <Card
          x={514}
          y={86}
          width={146}
          height={54}
          title={text.registry}
          details={['register()']}
          tone="api"
        />

        <Card
          x={28}
          y={210}
          width={434}
          height={56}
          title={text.graph}
          details={[text.graphDetail]}
          tone="api"
        />
        <Card x={28} y={304} width={202} height={76} title={text.data} details={['DataModel']} />
        <Card
          x={260}
          y={304}
          width={202}
          height={76}
          title={text.layout}
          details={['Layout · Transform']}
        />
        <Card
          x={28}
          y={418}
          width={202}
          height={76}
          title={text.scheduler}
          details={['RenderScheduler']}
        />
        <Card
          x={260}
          y={418}
          width={202}
          height={76}
          title={text.interaction}
          details={['Dispatcher · Behavior']}
        />

        <text className={styles.edgeLabel} x="143" y="403">
          {text.changes}
        </text>
        <text className={styles.edgeLabel} x="143" y="522">
          {text.draw}
        </text>
        <text className={styles.edgeLabel} x="373" y="522">
          {text.hit}
        </text>

        <g className={styles.renderer} transform="translate(28 540)">
          <rect width="434" height="118" rx="7" />
          <text className={styles.cardTitle} x="16" y="24">
            {text.renderer}
          </text>
          <text className={styles.cardDetail} x="418" y="24" textAnchor="end">
            Renderer
          </text>
          {['Canvas 2D', 'WebGL', 'Canvas 2D'].map((layer, index) => (
            <g
              key={index}
              transform={'translate(12 ' + (36 + index * 25) + ')'}
              data-main={index === 1}
            >
              <rect className={styles.renderLayer} width="410" height="22" rx="4" />
              <text className={styles.layerTech} x="10" y="15">
                {layer}
              </text>
              <text className={styles.layerDetail} x="112" y="15">
                {text.layers[index]}
              </text>
            </g>
          ))}
        </g>

        <Card
          x={514}
          y={210}
          width={146}
          height={56}
          title={text.plugin}
          details={['plugin']}
          tone="extension"
        />
        <Card
          x={514}
          y={304}
          width={146}
          height={76}
          title={text.compute}
          details={['transform · layout']}
          tone="extension"
        />
        <Card
          x={514}
          y={418}
          width={146}
          height={76}
          title={text.behavior}
          details={['behavior']}
          tone="extension"
        />
        <Card
          x={514}
          y={540}
          width={146}
          height={118}
          title={text.drawing}
          details={['node · edge', 'label · decoration']}
          tone="extension"
        />

        <g className={styles.platform} transform="translate(20 704)">
          <rect width="640" height="48" rx="7" />
          <text className={styles.cardTitle} x="14" y="29">
            {text.platform}
          </text>
          <text className={styles.platformDetail} x="158" y="29">
            DOM / Canvas · WebGL2 / 1 · Worker · rAF · ResizeObserver
          </text>
        </g>
      </svg>
      <figcaption className={styles.caption}>
        <div className={styles.legend}>
          <span>
            <i aria-hidden="true" />
            {text.dependency}
          </span>
          <span>
            <i className={styles.dashed} aria-hidden="true" />
            {text.extension}
          </span>
        </div>
        <p>{text.caption}</p>
      </figcaption>
    </figure>
  );
}
