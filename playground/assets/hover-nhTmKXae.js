const n=`/**
 * Demo: Hover 高亮效果（对标 G6 hover-activate 行为）
 *
 * - 悬停节点：高亮该节点及其邻居节点和连接边
 * - 悬停边：高亮该边及其两端节点
 * - 非活跃元素：节点 0.25 透明度、边 0.08 透明度（G6 风格淡化）
 * - 鼠标指针：悬停时变为 pointer
 */
import { Graph } from '../../src/index.ts';

export async function run(container: string | HTMLElement) {
  const graph = new Graph({
    container,
    data: {
      nodes: [
        { id: '0', name: 'Central' },
        { id: '1', name: 'Node A' },
        { id: '2', name: 'Node B' },
        { id: '3', name: 'Node C' },
        { id: '4', name: 'Node D' },
        { id: '5', name: 'Node E' },
        { id: '6', name: 'Node F' },
        { id: '7', name: 'Node G' },
        { id: '8', name: 'Node H' },
        { id: '9', name: 'Node I' },
        { id: '10', name: 'Node J' },
        { id: '11', name: 'Node K' },
      ],
      edges: [
        // Central hub connections
        { source: '0', target: '1' },
        { source: '0', target: '2' },
        { source: '0', target: '3' },
        { source: '0', target: '4' },
        { source: '0', target: '5' },
        // Cluster A
        { source: '1', target: '6' },
        { source: '1', target: '7' },
        { source: '6', target: '7' },
        // Cluster B
        { source: '2', target: '8' },
        { source: '2', target: '9' },
        { source: '8', target: '9' },
        // Cluster C
        { source: '3', target: '10' },
        { source: '4', target: '10' },
        { source: '4', target: '11' },
        { source: '5', target: '11' },
        // Cross links
        { source: '7', target: '8' },
        { source: '10', target: '11' },
      ],
    },
    node: {
      type: 'circle',
      style: {
        fill: (d) => {
          const colors = ['#E86452', '#5B8FF9', '#5AD8A6', '#F6BD16', '#6DC8EC', '#945FB9'];
          const idx = parseInt(d.id);
          if (idx === 0) return '#E86452'; // Central node: red
          if (idx <= 5) return '#5B8FF9';  // First ring: blue
          return '#5AD8A6';                 // Outer ring: green
        },
        size: (d) => (d.id === '0' ? 14 : 10),
      },
    },
    edge: {
      type: 'line',
      style: {
        stroke: '#C0C0C0',
        lineWidth: 2,
      },
    },
    layout: { type: 'force', maxIteration: 300 },
    behaviors: ['zoom-canvas', 'drag-canvas', 'highlight-node', 'highlight-edge'],
    theme: 'light',
  });

  await graph.render();
  return { destroy: () => graph.destroy() };
}
`;export{n as default};
