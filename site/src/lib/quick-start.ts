import type { GraphData, GraphOptions } from '../../../src/index.ts';

/** Immutable data replacements for the framework update example. */
export function frameworkGraphData(expanded: boolean): GraphData {
  return {
    nodes: [
      { id: 'Alice' },
      { id: 'Bob' },
      { id: 'Carol' },
      ...(expanded ? [{ id: 'David' }] : []),
    ],
    edges: [
      { source: 'Alice', target: 'Bob' },
      { source: 'Alice', target: 'Carol' },
      ...(expanded ? [{ source: 'Bob', target: 'David' }] : []),
    ],
  };
}

/** The six-node network used by the quick-start guide and its code samples. */
export function quickStartNetworkOptions(): Omit<GraphOptions, 'container'> {
  const data = {
    nodes: [
      { id: 'Alice', data: { color: '#5B8FF9', size: 40 } },
      { id: 'Bob', data: { color: '#5B8FF9', size: 28 } },
      { id: 'Carol', data: { color: '#5B8FF9', size: 28 } },
      { id: 'David', data: { color: '#61DDAA', size: 40 } },
      { id: 'Eva', data: { color: '#61DDAA', size: 28 } },
      { id: 'Frank', data: { color: '#61DDAA', size: 28 } },
    ],
    edges: [
      { source: 'Alice', target: 'Bob' },
      { source: 'Alice', target: 'Carol' },
      { source: 'David', target: 'Eva' },
      { source: 'David', target: 'Frank' },
      { source: 'Alice', target: 'David' },
      { source: 'Bob', target: 'Eva' },
      { source: 'Carol', target: 'Frank' },
    ],
  };

  return {
    data,
    node: {
      style: {
        size: (node) => Number(node.data?.size ?? 26),
        fill: (node) => String(node.data?.color ?? '#5B8FF9'),
        stroke: '#fff',
        strokeWidth: 2,
        label: (node) => node.id,
        labelPlacement: 'bottom',
        labelColor: '#334155',
      },
    },
    edge: { style: { stroke: '#CBD5E1', lineWidth: 1.5 } },
    layout: {
      type: 'd3-force',
      linkDistance: 100,
      nodeStrength: -400,
      collideRadius: 32,
    },
    autoFit: { padding: 48, maxZoom: 1.2 },
    behaviors: ['zoom-canvas', 'drag-canvas', 'drag-node', 'hover-highlight'],
  };
}

/** The smaller graph used by the React and Vue integration examples. */
export function quickStartOptions(): Omit<GraphOptions, 'container'> {
  return {
    data: frameworkGraphData(false),
    node: {
      style: {
        size: 24,
        label: (node) => node.id,
        labelPlacement: 'bottom',
      },
    },
    edge: { style: { endArrow: true } },
    layout: { type: 'circular', radius: 120 },
    autoFit: { padding: 32, maxZoom: 1 },
    behaviors: ['zoom-canvas', 'drag-canvas', 'drag-node', 'hover-highlight'],
  };
}
