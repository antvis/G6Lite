/**
 * Demo: 人物关系网络图 — 哈利波特角色关系 (force 布局 + 边标签)
 */
import { Graph } from '../../src/index.ts';
import { attachLabelsCanvas, attachEdgeLabelsCanvas, type GraphInstanceWithTools } from '../tooling.ts';

const COLORS: Record<string, string> = {
  gryffindor: '#5B8FF9',
  friend: '#F6BD16',
  enemy: '#30BF78',
  mentor: '#E86452',
};

const data = {
  nodes: [
    { id: 'harry', name: '哈利·波特', data: { house: 'gryffindor' } },
    { id: 'ron', name: '罗恩·韦斯莱', data: { house: 'friend' } },
    { id: 'hermione', name: '赫敏·格兰杰', data: { house: 'mentor' } },
    { id: 'voldemort', name: '伏地魔', data: { house: 'enemy' } },
    { id: 'dumbledore', name: '邓布利多', data: { house: 'mentor' } },
    { id: 'snape', name: '斯内普', data: { house: 'friend' } },
    { id: 'draco', name: '德拉科', data: { house: 'enemy' } },
    { id: 'sirius', name: '小天狼星', data: { house: 'friend' } },
  ],
  edges: [
    { source: 'ron', target: 'harry', data: { label: '朋友' } },
    { source: 'hermione', target: 'harry', data: { label: '朋友' } },
    { source: 'harry', target: 'voldemort', data: { label: '试图杀死' } },
    { source: 'dumbledore', target: 'harry', data: { label: '导师' } },
    { source: 'snape', target: 'harry', data: { label: '保护' } },
    { source: 'draco', target: 'harry', data: { label: '敌对' } },
    { source: 'sirius', target: 'harry', data: { label: '教父' } },
    { source: 'ron', target: 'hermione', data: { label: '朋友' } },
    { source: 'snape', target: 'voldemort', data: { label: '暗中效忠' } },
    { source: 'dumbledore', target: 'snape', data: { label: '信任' } },
  ],
};

export async function run(container: string | HTMLElement) {
  const wrapper = typeof container === 'string' ? document.querySelector(container)! as HTMLElement : container;
  wrapper.style.position = 'relative';

  const graph = new Graph({
    autoFitOnResize: true,
    container: wrapper,
    data,
    node: {
      type: 'circle',
      style: {
        fill: (n) => COLORS[n.data?.house as string] ?? '#5B8FF9',
        size: 20,
        stroke: '#fff',
        strokeWidth: 2,
      },
    },
    edge: {
      type: 'line',
      style: {
        stroke: '#bbb',
        lineWidth: 1.5,
        endArrow: true,
      },
    },
    layout: {
      type: 'd3-force',
      linkDistance: 180,
      nodeStrength: -600,
      collideRadius: 60,
      forceSimulation: null,
    },
    behaviors: ['zoom-canvas', 'drag-canvas', 'highlight-node'],
    theme: 'light',
  });

  await graph.render();
  graph.fitView({ padding: 64, maxZoom: 1 });

  const g = graph as unknown as GraphInstanceWithTools;
  const cleanupNodeLabels = attachLabelsCanvas(wrapper, g, {
    nodeLabel: (n) => n.name ?? n.id,
    position: 'below',
    fontSize: 11,
    color: '#333',
  });
  const cleanupEdgeLabels = attachEdgeLabelsCanvas(wrapper, g, {
    fontSize: 9,
    color: '#555',
    rotated: true,
    showBg: false,
  });

  return {
    fitView: () => graph.fitView({ padding: 64, maxZoom: 1.5 }),
    destroy: () => { cleanupNodeLabels(); cleanupEdgeLabels(); graph.destroy(); },
  };
}
