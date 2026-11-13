'use client';

import { useEffect, useRef, useState } from 'react';
import type { ComboData, EdgeConfig, ElementState, Graph, GraphOptions, NodeStyleConfig } from '../../../src/index.ts';
import type { Locale } from '@/lib/i18n';
import styles from './element-style-gallery.module.css';

type PreviewOptions = Omit<GraphOptions, 'container'>;

interface Example {
  title: Record<Locale, string>;
  field: string;
  options: PreviewOptions;
}

const blue = '#4f73e8';
const blueInk = '#29458c';
const blueTint = '#e8efff';

function nodeExample(type: 'circle' | 'rect'): PreviewOptions {
  return {
    data: { nodes: [{ id: 'solid', x: 0, y: 0 }, { id: 'outline', x: 82, y: 0 }], edges: [] },
    node: {
      type,
      style: {
        size: 34,
        width: 56,
        height: 32,
        fill: (node) => node.id === 'solid' ? blue : blueTint,
        stroke: blue,
        strokeWidth: (node) => node.id === 'solid' ? 0 : 2,
        borderRadius: (node) => node.id === 'solid' ? 0 : 9,
      },
    },
  };
}

function edgeExample(edge: EdgeConfig): PreviewOptions {
  return {
    data: {
      nodes: [{ id: 'a', x: 0, y: 0 }, { id: 'b', x: 116, y: 34 }],
      edges: [{ source: 'a', target: 'b' }],
    },
    node: { style: { size: 13, fill: blue } },
    edge: { ...edge, style: { stroke: blue, lineWidth: 2, endArrow: false, ...edge.style } },
  };
}

function comboExample(group: Omit<ComboData, 'id'>): PreviewOptions {
  return {
    data: {
      nodes: [{ id: 'a', x: 0, y: 0, comboId: 'group' }, { id: 'b', x: 58, y: 20, comboId: 'group' }],
      edges: [{ source: 'a', target: 'b' }],
      combos: [{ id: 'group', ...group }],
    },
    node: { style: { size: 16, fill: blue } },
    edge: { style: { stroke: blue, endArrow: false } },
    combo: {
      style: { fill: blueTint, stroke: blue, borderRadius: 12, padding: 15, labelColor: blueInk },
    },
  };
}

function nodeLabelExample(style: NodeStyleConfig): PreviewOptions {
  return {
    data: { nodes: [{ id: 'api', x: 0, y: 0 }], edges: [] },
    node: { style: { size: 26, fill: blue, label: 'API', labelColor: blueInk, labelFontSize: 13, ...style } },
  };
}

function stateExample(title: Example['title'], states: ElementState[]): Example {
  return {
    title,
    field: states.join(' + ') || 'default',
    options: {
      data: { nodes: [{ id: 'api', x: 0, y: 0, states }], edges: [] },
      node: {
        style: { size: 36, fill: blue },
        stateStyles: {
          selected: { stroke: '#35218b', strokeWidth: 3 },
          highlight: { fill: '#079575', stroke: '#075d4c', strokeWidth: 2 },
          disabled: { fill: '#64748b', opacity: 0.3 },
          review: { fill: '#f6a73e' },
        },
      },
    },
  };
}

const titledCombo = comboExample({ style: { label: 'Storage', labelPlacement: 'top' } });

const examples = {
  node: [
    { title: { zh: '圆形节点', en: 'Circle' }, field: "node.type: 'circle'", options: nodeExample('circle') },
    { title: { zh: '矩形节点', en: 'Rectangle' }, field: "node.type: 'rect'", options: nodeExample('rect') },
  ],
  edge: [
    {
      title: { zh: '直线', en: 'Straight line' },
      field: "edge.type: 'line'",
      options: edgeExample({ type: 'line' }),
    },
    {
      title: { zh: '弧线', en: 'Arc' },
      field: "edge.type: 'arc'",
      options: edgeExample({ type: 'arc', style: { curvature: -0.28, lineDash: [5, 4] } }),
    },
    {
      title: { zh: '三次曲线', en: 'Cubic curve' },
      field: "edge.type: 'cubic'",
      options: edgeExample({ type: 'cubic', style: { curveOffset: 65, endArrow: true, arrowSize: 8 } }),
    },
    {
      title: { zh: '直角折线', en: 'Orthogonal polyline' },
      field: "edge.type: 'polyline'",
      options: edgeExample({ type: 'polyline', style: { router: 'orth', radius: 4, endArrow: true, arrowSize: 8 } }),
    },
    {
      title: { zh: '平行边', en: 'Parallel edges' },
      field: 'parallelEdges',
      options: {
        data: {
          nodes: [{ id: 'a', x: 0, y: 0 }, { id: 'b', x: 116, y: 0 }],
          edges: ['one', 'two', 'three'].map((id) => ({ id, source: 'a', target: 'b' })),
        },
        node: { style: { size: 13, fill: blue } },
        edge: { type: 'arc', parallelEdges: { enabled: true, offset: 26 }, style: { stroke: blue, endArrow: false } },
      },
    },
    {
      title: { zh: '自环', en: 'Self-loop' },
      field: 'source === target',
      options: {
        data: { nodes: [{ id: 'a', x: 0, y: 0 }], edges: [{ source: 'a', target: 'a' }] },
        node: { style: { size: 20, fill: blue } },
        edge: { style: { stroke: blue, lineWidth: 2, endArrow: true, arrowSize: 8 } },
      },
    },
  ],
  combo: [
    { title: { zh: '展开包围框', en: 'Expanded boundary' }, field: 'borderRadius: 12', options: comboExample({}) },
    {
      title: { zh: '折叠为圆形', en: 'Collapsed circle' },
      field: "collapsedType: 'circle'",
      options: comboExample({ collapsed: true, style: { collapsedType: 'circle', collapsedSize: 44, count: true } }),
    },
    {
      title: { zh: '折叠为矩形', en: 'Collapsed rectangle' },
      field: "collapsedType: 'rect'",
      options: comboExample({ collapsed: true, style: { collapsedType: 'rect', collapsedSize: [80, 36], label: 'API' } }),
    },
    {
      title: { zh: '嵌套分组', en: 'Nested groups' },
      field: 'parentId',
      options: {
        ...titledCombo,
        data: {
          ...titledCombo.data,
          combos: [
            { id: 'outer', style: { padding: 13, fill: '#f0f4ff', stroke: '#b1c2ee' } },
            { id: 'group', parentId: 'outer', style: { padding: 10 } },
          ],
        },
      },
    },
  ],
  label: [
    {
      title: { zh: '节点下方的标签', en: 'Label below a node' },
      field: "labelPlacement: 'bottom'",
      options: nodeLabelExample({ labelPlacement: 'bottom', labelOffsetY: 6 }),
    },
    {
      title: { zh: '带底色的节点标签', en: 'Node label with a background' },
      field: 'labelBackground',
      options: nodeLabelExample({ labelPlacement: 'right', labelOffsetX: 8, labelBackground: blueTint, labelBackgroundPadding: 4 }),
    },
    {
      title: { zh: '沿边方向旋转的标签', en: 'Rotated edge label' },
      field: 'labelAutoRotate: true',
      options: edgeExample({
        type: 'line',
        style: {
          label: 'HTTP',
          labelAutoRotate: true,
          labelColor: blueInk,
          labelBackground: blueTint,
          labelBackgroundPadding: 3,
        },
      }),
    },
    { title: { zh: '分组标题', en: 'Group title' }, field: 'combo.style.label', options: titledCombo },
  ],
  parts: [
    {
      title: { zh: '节点主体、图标、标签与徽章', en: 'Node body, icon, label, and badge' },
      field: 'node.decorations',
      options: {
        data: { nodes: [{ id: 'api', x: 0, y: 0 }], edges: [] },
        node: {
          type: 'rect',
          style: {
            width: 54, height: 32, borderRadius: 8, fill: blue,
            icon: 'A', iconType: 'text', iconFontSize: 17, iconColor: '#fff',
            label: 'API', labelColor: blueInk, labelPlacement: 'bottom', labelOffsetY: 7,
          },
          decorations: [{
            renderer: 'builtin-badge', placement: 'right', attachment: 'boundary',
            data: { kind: 'count', value: 3 },
          }],
        },
      },
    },
    {
      title: { zh: '边路径、箭头与标签', en: 'Edge path, arrows, and label' },
      field: 'edge.style',
      options: edgeExample({
        type: 'arc',
        style: {
          curvature: -0.25, startArrow: true, endArrow: true, arrowSize: 8,
          label: 'Sync', labelColor: blueInk, labelBackground: blueTint, labelBackgroundPadding: 4,
        },
      }),
    },
    {
      title: { zh: '分组容器、标题与成员', en: 'Group boundary, title, and members' },
      field: 'combo.style',
      options: titledCombo,
    },
  ],
  state: [
    stateExample({ zh: '默认 · 基础样式', en: 'Default · base style' }, []),
    stateExample({ zh: '激活 · 外圈光晕', en: 'Active · halo' }, ['active']),
    stateExample({ zh: '选中 · 加粗描边', en: 'Selected · thicker outline' }, ['selected']),
    stateExample({ zh: '高亮 · 强调填充', en: 'Highlight · stronger fill' }, ['highlight']),
    stateExample({ zh: '弱化 · 降低透明度', en: 'Inactive · reduced opacity' }, ['inactive']),
    stateExample({ zh: '禁用 · 灰色弱化', en: 'Disabled · muted gray' }, ['disabled']),
    stateExample({ zh: '隐藏 · 节点消失', en: 'Hidden · node disappears' }, ['hidden']),
    stateExample({ zh: '自定义 · 待复核', en: 'Custom · needs review' }, ['review']),
    stateExample({ zh: '状态叠加 · 选中且待复核', en: 'Combined · selected for review' }, ['selected', 'review']),
  ],
} satisfies Record<string, Example[]>;

function ExampleCard({ example, locale }: { example: Example; locale: Locale }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;
    const mount = container;
    type Preview = { graph?: Graph };
    let current: Preview | undefined;

    async function render(preview: Preview) {
      try {
        const { Graph } = await import('../../../src/index.ts');
        if (current !== preview) return;
        const graph = new Graph({
          container: mount,
          ...example.options,
          autoFit: { padding: 20, maxZoom: 1 },
          label: { hideOnLowZoom: false, hideOnCollision: false },
          behaviors: [],
        });
        preview.graph = graph;
        graph.getCanvas().dataset.previewLayer = 'graph';
        await graph.render();
        if (current === preview) setStatus('ready');
      } catch {
        if (current !== preview) return;
        preview.graph?.destroy();
        mount.replaceChildren();
        setStatus('error');
      }
    }

    function stop() {
      const previous = current;
      current = undefined;
      previous?.graph?.destroy();
    }

    const observer = new IntersectionObserver((entries) => {
      if (!entries.at(-1)?.isIntersecting) {
        stop();
      } else if (!current) {
        // Release offscreen WebGL contexts as readers move between sections.
        current = {};
        setStatus('loading');
        void render(current);
      }
    }, { rootMargin: '160px' });
    observer.observe(mount);

    return () => {
      observer.disconnect();
      stop();
    };
  }, [example]);

  return (
    <figure className={styles.card} data-preview-status={status}>
      <div className={styles.preview}>
        <div ref={mountRef} className={styles.canvas} aria-hidden="true" />
        {status === 'error' && (
          <span className={styles.message} role="status">
            {locale === 'zh' ? '示例无法渲染' : 'Preview unavailable'}
          </span>
        )}
      </div>
      <figcaption className={styles.caption}>
        <span>{example.title[locale]}</span>
        <code>{example.field}</code>
      </figcaption>
    </figure>
  );
}

export function ElementStyleGallery({ element, locale }: {
  element: keyof typeof examples;
  locale: Locale;
}) {
  return (
    <div className={`${styles.gallery} not-prose`} data-element-gallery={element}>
      {examples[element].map((example) => (
        <ExampleCard key={example.field} example={example} locale={locale} />
      ))}
    </div>
  );
}
