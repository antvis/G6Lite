/**
 * Demo: a topic tree laid out with the radial algorithm.
 */
import { Graph } from '../../src/index.ts';

const TREE: Array<[string, string, string?]> = [
  ['root', '产品'],
  ['research', '研究', 'root'],
  ['design', '设计', 'root'],
  ['build', '研发', 'root'],
  ['interview', '访谈', 'research'],
  ['metrics', '指标', 'research'],
  ['flow', '流程', 'design'],
  ['visual', '视觉', 'design'],
  ['api', '接口', 'build'],
  ['test', '测试', 'build'],
];

export async function run(container: string | HTMLElement) {
  const graph = new Graph({
    autoFitOnResize: false,
    container,
    data: {
      nodes: TREE.map(([id, label]) => ({ id, data: { label, root: id === 'root' } })),
      edges: TREE.filter((item) => item[2]).map(([id, , parent]) => ({ source: parent!, target: id })),
    },
    node: {
      style: {
        size: (node) => (node.data?.root ? 46 : 28),
        fill: (node) => (node.data?.root ? '#E86452' : '#5B8FF9'),
        label: (node) => String(node.data?.label ?? node.id),
        labelPlacement: 'bottom',
      },
    },
    edge: { style: { stroke: '#C5CEDB', lineWidth: 1.5 } },
    layout: { type: 'radial', unitRadius: 110, linkDistance: 90, nodeSize: 28 },
    behaviors: ['zoom-canvas', 'drag-canvas'],
  });
  await graph.render();
  graph.fitView({ padding: [72, 72, 120, 72], maxZoom: 0.85 });
  return graph;
}
