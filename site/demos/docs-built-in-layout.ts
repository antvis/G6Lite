import { Graph, register, type GraphNode, type GraphOptions, type LayoutConfig } from '@antv/g6-lite';
import mds from '@antv/g6-lite/layouts/mds';
import radial from '@antv/g6-lite/layouts/radial';
import indented from '@antv/g6-lite/layouts/indented';
import mindmap from '@antv/g6-lite/layouts/mindmap';
import fishboneLayout from '@antv/g6-lite/layouts/fishbone';
import random from '@antv/g6-lite/layouts/random';
import { GridLayout } from '@antv/layout';
import { CircularLayout } from '@antv/layout';
import { DagreLayout } from '@antv/layout';
import { ConcentricLayout } from '@antv/layout';

const optionalLayouts = new Map(Object.entries({ mds, radial, indented, mindmap, fishbone: fishboneLayout, random }));

const layouts = {
  // #region layout-grid-config
  'grid': { type: GridLayout, rows: 2, cols: 3, width: 360, height: 160 },
  // #endregion layout-grid-config
  // #region layout-circular-config
  'circular': { type: CircularLayout, radius: 100 },
  // #endregion layout-circular-config
  // #region layout-dagre-config
  'dagre': { type: DagreLayout, rankdir: 'LR', nodesep: 32, ranksep: 80, nodeSize: [80, 32] },
  // #endregion layout-dagre-config
  // #region layout-force-config
  'force': { type: 'force', linkDistance: 100 },
  // #endregion layout-force-config
  // #region layout-d3-force-config
  'd3-force': { type: 'd3-force', linkDistance: 100, nodeStrength: -120, preventOverlap: true, nodeSize: 24 },
  // #endregion layout-d3-force-config
  // #region layout-force-atlas2-config
  'force-atlas2': {
    type: 'force-atlas2',
    center: [240, 150],
    kr: 12,
    kg: 0.5,
    preventOverlap: true,
    nodeSize: 24,
    maxIteration: 200,
  },
  // #endregion layout-force-atlas2-config
  // #region layout-fruchterman-config
  'fruchterman': {
    type: 'fruchterman',
    width: 560,
    height: 300,
    center: [240, 150],
    gravity: 4,
    maxIteration: 250,
    minMovement: 0.05,
  },
  // #endregion layout-fruchterman-config
  // #region layout-radial-config
  'radial': { type: 'radial', focusNode: '0', unitRadius: 68 },
  // #endregion layout-radial-config
  // #region layout-concentric-config
  'concentric': {
    type: ConcentricLayout,
    sortBy: 'degree',
    maxLevelDiff: 1,
    preventOverlap: true,
    nodeSize: 24,
    nodeSpacing: 28,
  },
  // #endregion layout-concentric-config
  // #region layout-mds-config
  'mds': { type: 'mds', linkDistance: 80 },
  // #endregion layout-mds-config
  // #region layout-indented-config
  'indented': { type: 'indented', direction: 'LR', indent: 72, rowHeight: 30 },
  // #endregion layout-indented-config
  // #region layout-mindmap-config
  'mindmap': {
    type: 'mindmap',
    direction: 'H',
    levelGap: 100,
    nodeGap: 24,
    getWidth: () => 16,
    getHeight: (node: GraphNode) => node.id.length === 1 ? 64 : 16,
    getSide: (node: GraphNode) => /^[AC]/.test(node.id) ? 'left' : 'right',
  },
  // #endregion layout-mindmap-config
  // #region layout-fishbone-config
  'fishbone': {
    type: 'fishbone',
    direction: 'LR',
    categoryGap: 200,
    categoryDistance: 138,
    itemHStep: 26,
    getWidth: () => 96,
  },
  // #endregion layout-fishbone-config
  // #region layout-random-config
  'random': { type: 'random', width: 400, height: 240, center: [200, 120] },
  // #endregion layout-random-config
} satisfies Record<string, LayoutConfig>;

export type BuiltInLayoutExample = keyof typeof layouts;

// #region shared-types
type ExampleOptions = Pick<GraphOptions, 'data' | 'node' | 'edge'>;
// #endregion shared-types

// #region arrangement
function arrangement(type: string): ExampleOptions {
  if (type === 'dagre') {
    return {
      data: {
        nodes: ['Input', 'Review', 'Check', 'Publish'].map((id) => ({ id })),
        edges: [
          { source: 'Input', target: 'Review' },
          { source: 'Input', target: 'Check' },
          { source: 'Review', target: 'Publish' },
          { source: 'Check', target: 'Publish' },
        ],
      },
      node: {
        type: 'rect',
        style: {
          width: 80, height: 32, borderRadius: 6,
          label: (node) => node.id, labelColor: '#fff', labelPlacement: 'center',
        },
      },
      edge: { type: 'polyline', style: { router: 'orth', radius: 12, endArrow: true } },
    };
  }

  const ids = Array.from({ length: type === 'grid' ? 6 : 8 }, (_, i) => String.fromCharCode(65 + i));
  return {
    data: {
      nodes: ids.map((id) => ({ id })),
      edges: type === 'grid' ? [] : ids.map((source, i) => ({ source, target: ids[(i + 2) % ids.length] })),
    },
    node: { style: { size: 24, label: (node) => node.id, labelColor: '#fff', labelPlacement: 'center' } },
  };
}
// #endregion arrangement

// #region network
function network(type: string): ExampleOptions {
  const links = [
    [0, 1], [0, 2], [0, 3], [1, 2], [1, 4], [1, 5],
    [2, 5], [2, 6], [3, 7], [3, 8], [3, 9],
    [7, 8], [8, 9], [4, 10], [4, 11], [10, 11],
  ];
  const showClusters = type === 'force-atlas2' || type === 'fruchterman';
  // Seed the three groups around distinct centers so rerunning starts from the same layout.
  const clusters = [
    { ids: [3, 7, 8, 9], x: 90, y: 120, color: '#2468d8' },
    { ids: [0, 1, 5, 2, 6], x: 240, y: 205, color: '#7755c7' },
    { ids: [4, 10, 11], x: 390, y: 120, color: '#0c8177' },
  ];
  const nodes = showClusters
    ? clusters.flatMap(({ ids, x, y, color }, clusterIndex) => {
        const startAngle = type === 'fruchterman' && clusterIndex === 1 ? 3 * Math.PI / 2 : 0;
        return ids.map((id, index) => {
          const angle = startAngle + 2 * Math.PI * index / ids.length;
          return { id: String(id), x: x + 34 * Math.cos(angle), y: y + 34 * Math.sin(angle), data: { color } };
        });
      })
    : Array.from({ length: 12 }, (_, index) => ({ id: String(index) }));

  return {
    data: {
      nodes,
      edges: links.map(([source, target]) => ({ source: String(source), target: String(target) })),
    },
    node: {
      style: {
        size: 24,
        label: (node) => node.id,
        labelColor: '#fff',
        labelPlacement: 'center',
        fill: (node) => String(node.data?.color ?? (type === 'radial' && node.id === '0' ? '#6d28d9' : '#1677ff')),
      },
    },
    edge: { style: showClusters ? { lineWidth: 1.6, stroke: '#8494b0', endArrow: false } : { lineWidth: 2 } },
  };
}
// #endregion network

// #region concentric
function concentric(): ExampleOptions {
  const hub = 'Hub';
  const inner = ['A', 'B', 'C', 'D', 'E'];
  const edges = inner.flatMap((id) => [
    { source: hub, target: id },
    { source: id, target: `${id}1` },
    { source: id, target: `${id}2` },
  ]);
  return {
    data: {
      nodes: [{ id: hub }, ...edges.map(({ target }) => ({ id: target }))],
      edges,
    },
    node: {
      style: {
        size: 24,
        fill: (node) => node.id === hub ? '#6d28d9' : inner.includes(node.id) ? '#1677ff' : '#0f766e',
      },
    },
    edge: { style: { endArrow: false, stroke: '#91a5c1', lineWidth: 1.5 } },
  };
}
// #endregion concentric

// #region fishbone
function fishbone(): ExampleOptions {
  const head = 'Late release';
  const causes = [
    { category: 'People', items: ['Staff shortage', 'Late handoff'] },
    { category: 'Tools', items: ['Slow build', 'Test outages'] },
    { category: 'Process', items: ['Review queue', 'Manual checks'] },
    { category: 'Scope', items: ['New requests', 'Rework'] },
  ];
  const edges = causes.flatMap(({ category, items }) => [
    { source: head, target: category },
    ...items.map((item) => ({ source: category, target: item })),
  ]);
  const categories = new Set(causes.map(({ category }) => category));
  // #region edge-router
  const edge = {
    type: 'polyline',
    style: { router: 'fishbone', endArrow: false, stroke: '#7086a8', lineWidth: 2 },
  } as const;
  // #endregion edge-router
  return {
    data: { nodes: [{ id: head }, ...edges.map(({ target }) => ({ id: target }))], edges },
    node: {
      type: 'rect',
      style: {
        width: 96,
        height: (node) => node.id === head || categories.has(node.id) ? 30 : 22,
        borderRadius: 5,
        fill: (node) => node.id === head ? '#3730a3' : categories.has(node.id) ? '#1d4ed8' : '#eff6ff',
        label: (node) => node.id,
        labelPlacement: 'center',
        labelColor: (node) => node.id === head || categories.has(node.id) ? '#fff' : '#1e3a5f',
      },
    },
    edge,
  };
}
// #endregion fishbone

// #region tree
function tree(type: string): ExampleOptions {
  const edges = ['A', 'B', 'C', 'D'].flatMap((branch) => [
    { source: 'Root', target: branch },
    { source: branch, target: `${branch}1` },
    { source: branch, target: `${branch}2` },
  ]);
  return {
    data: {
      nodes: [{ id: 'Root' }, ...edges.map(({ target }) => ({ id: target }))],
      edges,
    },
    node: {
      style: {
        size: 16,
        label: (node) => node.id,
        labelPlacement: type === 'indented' ? 'right' : 'bottom',
      },
    },
    edge: type === 'indented'
      ? { type: 'polyline', style: { router: type, endArrow: false } }
      : { style: { endArrow: false } },
  };
}
// #endregion tree

export function run(container: HTMLElement, type: BuiltInLayoutExample) {
  const extension = optionalLayouts.get(type);
  if (extension) register('layout', type, extension);
  const layout = layouts[type];
  if (type === 'concentric') return render(container, layout, concentric());
  if (type === 'fishbone') return render(container, layout, fishbone());
  const options = type === 'indented' || type === 'mindmap'
    ? tree(type)
    : type === 'grid' || type === 'circular' || type === 'dagre' || type === 'random'
      ? arrangement(type)
      : network(type);
  return render(container, layout, options);
}

// #region render
async function render(container: HTMLElement, layout: LayoutConfig, options: ExampleOptions) {
  const graph = new Graph({
    container,
    ...options,
    layout,
    behaviors: ['drag-canvas', 'zoom-canvas'],
    autoFit: { padding: 36 },
  });
  try {
    await graph.render();
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}
// #endregion render
