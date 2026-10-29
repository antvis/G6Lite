import type { Locale } from '@/lib/i18n';

import { DocsArchitectureDiagram } from './docs-architecture-diagram';

interface ArchitectureDiagramProps {
  locale: Locale;
  compact?: boolean;
}

interface ArchitectureLayer {
  key: string;
  eyebrow: string;
  title: string;
  description: string;
  items: string[];
  tone: 'agent' | 'api' | 'runtime' | 'render' | 'platform';
}

const COPY: Record<
  Locale,
  {
    caption: string;
    firstRender: string;
    firstRenderPath: string;
    incremental: string;
    incrementalPath: string;
    layers: ArchitectureLayer[];
  }
> = {
  zh: {
    caption: 'G6Lite 从使用方和 AI Agent 到浏览器渲染平台的五层架构。',
    firstRender: '首次渲染',
    firstRenderPath: '数据 → Transform → 布局 → DataModel → WebGL 与 Canvas 图层 → 页面',
    incremental: '高频更新',
    incrementalPath: '状态或位置 → RenderScheduler → GPU Buffer Patch 或 Overlay Redraw',
    layers: [
      {
        key: 'consumer',
        eyebrow: 'Intent & data',
        title: '使用方与 Agent',
        description: '自然语言意图、业务数据和宿主应用。',
        items: ['Prompt', 'GraphData', 'React / Vue / Web'],
        tone: 'agent',
      },
      {
        key: 'api',
        eyebrow: 'Public contract',
        title: '公开 API',
        description: '稳定、类型安全且不暴露渲染内部实现。',
        items: ['Graph', 'register()', 'extensionFactory()', 'runLayout()', 'Public types'],
        tone: 'api',
      },
      {
        key: 'runtime',
        eyebrow: 'Orchestration',
        title: '图运行时编排',
        description: '组织数据、布局、更新、事件和扩展生命周期。',
        items: [
          'DataModel',
          'Layout & Transform',
          'RenderScheduler',
          'InteractionDispatcher',
          'Behavior & Plugin',
        ],
        tone: 'runtime',
      },
      {
        key: 'render',
        eyebrow: 'Rendering',
        title: '渲染与拾取',
        description: 'WebGL 主绘制与 Canvas 2D 信息层协同工作。',
        items: ['regl Programs', 'GPU Picking', 'Label overlay', 'Combo underlay'],
        tone: 'render',
      },
      {
        key: 'platform',
        eyebrow: 'Browser platform',
        title: '浏览器平台',
        description: '负责图形上下文、异步调度和容器生命周期。',
        items: ['WebGL2 → WebGL1', 'DOM & Canvas', 'Worker', 'ResizeObserver', 'rAF'],
        tone: 'platform',
      },
    ],
  },
  en: {
    caption:
      'The five G6Lite layers from application and AI-agent intent to the browser rendering platform.',
    firstRender: 'First render',
    firstRenderPath: 'Data → Transform → Layout → DataModel → WebGL and Canvas layers → Page',
    incremental: 'Frequent updates',
    incrementalPath: 'State or position → RenderScheduler → GPU buffer patch or overlay redraw',
    layers: [
      {
        key: 'consumer',
        eyebrow: 'Intent & data',
        title: 'Applications and agents',
        description: 'Natural-language intent, product data, and the host application.',
        items: ['Prompt', 'GraphData', 'React / Vue / Web'],
        tone: 'agent',
      },
      {
        key: 'api',
        eyebrow: 'Public contract',
        title: 'Public API',
        description: 'Stable, typed contracts without renderer internals.',
        items: ['Graph', 'register()', 'extensionFactory()', 'runLayout()', 'Public types'],
        tone: 'api',
      },
      {
        key: 'runtime',
        eyebrow: 'Orchestration',
        title: 'Graph runtime',
        description: 'Coordinates data, layouts, updates, events, and extension lifecycles.',
        items: [
          'DataModel',
          'Layout & Transform',
          'RenderScheduler',
          'InteractionDispatcher',
          'Behavior & Plugin',
        ],
        tone: 'runtime',
      },
      {
        key: 'render',
        eyebrow: 'Rendering',
        title: 'Rendering and picking',
        description: 'WebGL drawing works with Canvas 2D information layers.',
        items: ['regl Programs', 'GPU Picking', 'Label overlay', 'Combo underlay'],
        tone: 'render',
      },
      {
        key: 'platform',
        eyebrow: 'Browser platform',
        title: 'Browser platform',
        description: 'Owns graphics contexts, asynchronous scheduling, and container lifecycle.',
        items: ['WebGL2 → WebGL1', 'DOM & Canvas', 'Worker', 'ResizeObserver', 'rAF'],
        tone: 'platform',
      },
    ],
  },
};

function FlowArrow() {
  return (
    <svg aria-hidden="true" className="architecture-flow-arrow" viewBox="0 0 32 20">
      <path d="M2 10h25m-7-7 7 7-7 7" />
    </svg>
  );
}

export function ArchitectureDiagram({ locale, compact = false }: ArchitectureDiagramProps) {
  if (!compact) return <DocsArchitectureDiagram locale={locale} />;

  const copy = COPY[locale];

  return (
    <figure className={`architecture-diagram not-prose${compact ? ' is-compact' : ''}`}>
      <div className="architecture-diagram-flow">
        {copy.layers.map((layer, index) => (
          <div className="architecture-flow-entry" key={layer.key}>
            <section className={`architecture-layer architecture-layer-${layer.tone}`}>
              <span className="architecture-layer-eyebrow">{layer.eyebrow}</span>
              <h3>{layer.title}</h3>
              {!compact && <p>{layer.description}</p>}
              <ul>
                {layer.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
            {index < copy.layers.length - 1 && <FlowArrow />}
          </div>
        ))}
      </div>

      <div className="architecture-data-paths">
        <div>
          <strong>{copy.firstRender}</strong>
          <span>{copy.firstRenderPath}</span>
        </div>
        <div>
          <strong>{copy.incremental}</strong>
          <span>{copy.incrementalPath}</span>
        </div>
      </div>

      <figcaption>{copy.caption}</figcaption>
    </figure>
  );
}
