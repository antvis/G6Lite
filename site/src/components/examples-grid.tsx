import Image from 'next/image';

import catalog from '../../../playground/demos/catalog.json';
import { localizedPath, type Locale } from '@/lib/i18n';
import { withBasePath } from '@/lib/shared';

const groupOrder = [
  'getting-started',
  'node-edge-label-combo',
  'layout',
  'interaction-state-viewport',
  'extension',
  'scenario-and-dataset',
] as const;

const groupLabels = {
  zh: {
    'getting-started': ['快速开始', '从最小 Graph 配置开始。'],
    'node-edge-label-combo': ['元素与样式', '节点、边、标签、Combo 与关联变换。'],
    layout: ['布局', '使用同一份数据切换和比较布局。'],
    'interaction-state-viewport': ['交互、状态与视口', '组合 Tooltip、状态和视口行为。'],
    extension: ['扩展', '通过公开扩展 API 定制能力。'],
    'scenario-and-dataset': ['场景与数据集', '在更真实的数据和组合场景中验证。'],
  },
  en: {
    'getting-started': ['Getting started', 'Start with the smallest Graph configuration.'],
    'node-edge-label-combo': [
      'Elements and styles',
      'Nodes, edges, labels, combos, and transforms.',
    ],
    layout: ['Layout', 'Switch and compare layouts with the same dataset.'],
    'interaction-state-viewport': [
      'Interaction, state, and viewport',
      'Combine tooltips, element states, and viewport behaviors.',
    ],
    extension: ['Extensions', 'Customize capabilities through the public extension API.'],
    'scenario-and-dataset': [
      'Scenarios and datasets',
      'Validate G6Lite with realistic data and combined workflows.',
    ],
  },
} as const;

const englishExamples: Record<string, { title: string; description: string }> = {
  basic: {
    title: 'Minimal graph',
    description: 'Render a zoomable and draggable graph with minimal configuration.',
  },
  'node-style': {
    title: 'Node styles',
    description: 'Map business fields to node colors, sizes, and highlight states.',
  },
  layouts: {
    title: 'Layout switching',
    description: 'Switch between circular, force, grid, and dagre layouts.',
  },
  tooltip: {
    title: 'Tooltip',
    description: 'Show custom business information while hovering nodes or edges.',
  },
  'edge-arrows': {
    title: 'Edge arrows',
    description: 'Compare no arrow, one-way, two-way, and wide edge arrows.',
  },
  'parallel-edges': {
    title: 'Parallel edges',
    description: 'Separate parallel, reverse, and self-loop edges automatically.',
  },
  combo: {
    title: 'Combo containers',
    description: 'Use nested groups, collapse, expand, and runtime regrouping.',
  },
  'real-dataset': {
    title: 'Real dataset',
    description: 'Validate large-graph rendering with the AI Papers dataset.',
  },
};

export function ExamplesGrid({ locale = 'zh' }: { locale?: Locale }) {
  const examples = catalog.filter((demo) => demo.audiences.includes('site') && 'docsGroup' in demo);

  return (
    <div className="example-groups">
      {groupOrder.map((group) => {
        const grouped = examples.filter((demo) => demo.docsGroup === group);
        if (grouped.length === 0) return null;
        const [title, description] = groupLabels[locale][group];

        return (
          <section className="example-group" key={group}>
            <div className="example-group-heading">
              <h2>{title}</h2>
              <p>{description}</p>
            </div>
            <div className="example-grid">
              {grouped.map((demo) => {
                const copy = locale === 'en' ? englishExamples[demo.id] : undefined;
                const demoTitle = copy?.title ?? demo.title;
                const demoDescription = copy?.description ?? demo.description;

                return (
                  <a
                    className="example-card"
                    href={withBasePath(localizedPath(`/docs/examples/${demo.id}`, locale))}
                    key={demo.id}
                  >
                    <Image
                      src={withBasePath(`/examples/${demo.id}.png`)}
                      alt={demoTitle}
                      width={960}
                      height={600}
                      unoptimized
                    />
                    <span className="example-card-body">
                      <span className="example-card-title">{demoTitle}</span>
                      <span className="example-card-desc">{demoDescription}</span>
                    </span>
                  </a>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
