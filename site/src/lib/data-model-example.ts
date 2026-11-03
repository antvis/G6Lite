import type { GraphOptions } from '../../../src/index.ts';

export function dataModelExampleOptions(): Omit<GraphOptions, 'container'> {
  const colors: Record<string, string> = {
    A: '#5B8FF9',
    B: '#61DDAA',
    C: '#F6BD16',
    D: '#7262FD',
    E: '#F6903D',
    F: '#E868A2',
  };

  return {
    data: {
      nodes: [
        { id: 'A', x: 110, y: 160, comboId: 'group-abc' },
        { id: 'B', x: 240, y: 85, comboId: 'group-abc' },
        { id: 'C', x: 240, y: 235, comboId: 'group-abc' },
        { id: 'D', x: 390, y: 160 },
        { id: 'E', x: 530, y: 85 },
        { id: 'F', x: 530, y: 235 },
      ],
      edges: [
        { source: 'A', target: 'B' },
        { source: 'A', target: 'C' },
        { source: 'B', target: 'C' },
        { source: 'B', target: 'D' },
        { source: 'C', target: 'D' },
        { source: 'D', target: 'E' },
        { source: 'D', target: 'F' },
        { source: 'E', target: 'F' },
      ],
      combos: [{ id: 'group-abc' }],
    },
    node: {
      style: {
        size: 32,
        fill: (node) => colors[node.id] ?? '#5B8FF9',
        stroke: '#fff',
        strokeWidth: 2,
        label: (node) => node.id,
        labelPlacement: 'bottom',
        labelOffsetY: 4,
        labelColor: '#334155',
      },
    },
    edge: { style: { stroke: '#B8C5D7', lineWidth: 1.5, endArrow: false } },
    combo: {
      style: {
        fill: 'rgba(91, 143, 249, 0.07)',
        stroke: 'rgba(91, 143, 249, 0.45)',
        borderRadius: 16,
        padding: [40, 32, 32, 32],
        label: 'Combo',
        labelPlacement: 'inside',
        labelColor: '#64748b',
        labelFontSize: 12,
        count: false,
      },
    },
    autoFit: { padding: 40, maxZoom: 1.1 },
    behaviors: ['zoom-canvas', 'drag-canvas', 'drag-node', 'hover-highlight'],
  };
}
