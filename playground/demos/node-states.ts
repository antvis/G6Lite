/**
 * Demo: Node states - default / active / selected / disabled / highlight / inactive
 */
import { Graph, type NodeState } from '../../src/index.ts';

export async function run(container: string | HTMLElement) {
  const states: NodeState[] = ['default', 'active', 'selected', 'disabled', 'highlight', 'inactive'];
  const labels = ['Default', 'Active', 'Selected', 'Disabled', 'Highlight', 'Inactive'];

  const nodes = states.map((s, i) => ({
    id: `n-${s}`,
    name: labels[i],
    x: 100 + i * 140,
    y: 150,
    states: s === 'default' ? undefined : [s] as NodeState[],
  }));

  const graph = new Graph({
    autoFit: true,
    container,
    data: { nodes, edges: [] },
    node: {
      type: 'circle',
      style: {
        fill: '#5B8FF9',
        size: 32,
        stroke: '#fff',
        strokeWidth: 2,
      },
    },
    theme: 'light',
  });

  await graph.render();
  return { destroy: () => graph.destroy() };
}
