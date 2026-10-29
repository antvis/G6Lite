import type { Locale } from '@/lib/i18n';
import styles from './first-render-flow.module.css';

const copy = {
  zh: {
    title: '首次渲染流程',
    description:
      '调用 render 后准备输入，根据布局配置计算或复用坐标，再建立数据模型和运行时、准备 GPU 数据与相机，依次绘制 Combo 底层、WebGL 主画布和标签上层，最后发出 afterrender 并挂载尺寸观察与插件。',
    prepare: '准备输入与画布',
    prepareDetail: '渲染代次 · Transform · 主题 · 容器尺寸',
    decision: '需要计算布局？',
    yes: '是',
    no: '否',
    layout: '执行布局算法',
    layoutDetail: '计算坐标 · 可在 Worker 中执行',
    positions: '使用已有坐标',
    positionsDetail: '节点 x / y，缺省为 0',
    runtime: '建立数据模型与运行时',
    runtimeDetails: ['DataModel → Renderer 数据 → Scheduler', '挂载交互、Behaviors 与 Canvas 图层'],
    process: '准备 GPU 数据与视口',
    processDetail: 'beforerender → 生成 Buffer → fitView()',
    combo: 'Combo 包围框（如有）',
    webgl: '节点与边',
    labels: '标签、图标与装饰',
    complete: '完成首帧与初始化',
    completeDetail: 'afterrender → ResizeObserver → Plugin',
    caption: '配置了布局且数据非空时才计算布局；Picking 命中缓冲按需生成，不属于首帧必经步骤。',
  },
  en: {
    title: 'First-render flow',
    description:
      'Render prepares input, computes or reuses positions, builds the model and runtime, prepares GPU data and camera, draws the Combo underlay, WebGL content, and label overlay in order, then emits afterrender and mounts resize observation and plugins.',
    prepare: 'Prepare input and canvas',
    prepareDetail: 'Generation · Transform · Theme · Size',
    decision: 'Run layout?',
    yes: 'Yes',
    no: 'No',
    layout: 'Execute layout',
    layoutDetail: 'Compute positions · Worker when applicable',
    positions: 'Use existing positions',
    positionsDetail: 'Node x / y, defaulting to 0',
    runtime: 'Build data model and runtime',
    runtimeDetails: [
      'DataModel → Renderer data → Scheduler',
      'Mount interactions, behaviors, and Canvas layers',
    ],
    process: 'Prepare GPU data and viewport',
    processDetail: 'beforerender → Buffer processing → fitView()',
    combo: 'Combo bounds, if present',
    webgl: 'Nodes and edges',
    labels: 'Labels, icons, decorations',
    complete: 'Complete first frame and initialization',
    completeDetail: 'afterrender → ResizeObserver → Plugin',
    caption:
      'Layout runs when configured and data is nonempty. Picking buffers are generated on demand; they are not required for the first frame.',
  },
};

function Step({
  title,
  details = [],
  terminal = false,
}: {
  title: string;
  details?: string[];
  terminal?: boolean;
}) {
  return (
    <div className={styles.step} data-terminal={terminal}>
      <span className={styles.title}>{title}</span>
      {details.map((detail) => (
        <span className={styles.detail} key={detail}>
          {detail}
        </span>
      ))}
    </div>
  );
}

function Arrow() {
  return <div className={styles.arrow} aria-hidden="true" />;
}

export function FirstRenderFlow({ locale }: { locale: Locale }) {
  const text = copy[locale];

  return (
    <figure className={styles.figure + ' not-prose'} aria-label={text.title}>
      <span className="sr-only">{text.description}</span>
      <div className={styles.diagram}>
        <Step title="await graph.render()" terminal />
        <Arrow />
        <Step title={text.prepare} details={[text.prepareDetail]} />
        <Arrow />
        <div className={styles.decision}>
          <svg viewBox="0 0 240 64" preserveAspectRatio="none" aria-hidden="true">
            <path d="M120 1 238 32 120 63 2 32Z" />
          </svg>
          <span>{text.decision}</span>
        </div>
        <div className={styles.branchStem} aria-hidden="true" />
        <div className={styles.branches}>
          <div className={styles.branch}>
            <span className={styles.branchLabel}>{text.yes}</span>
            <Step title={text.layout} details={[text.layoutDetail]} />
          </div>
          <div className={styles.branch}>
            <span className={styles.branchLabel}>{text.no}</span>
            <Step title={text.positions} details={[text.positionsDetail]} />
          </div>
        </div>
        <div className={styles.merge} aria-hidden="true" />
        <Arrow />
        <Step title={text.runtime} details={text.runtimeDetails} />
        <Arrow />
        <Step title={text.process} details={[text.processDetail]} />
        <Arrow />
        <Step title={text.combo} details={['Canvas 2D underlay']} />
        <Arrow />
        <Step title={text.webgl} details={['WebGL normal pass']} />
        <Arrow />
        <Step title={text.labels} details={['Canvas 2D overlay']} />
        <Arrow />
        <Step title={text.complete} details={[text.completeDetail]} terminal />
      </div>
      <figcaption>{text.caption}</figcaption>
    </figure>
  );
}
