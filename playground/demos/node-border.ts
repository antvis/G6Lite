/**
 * Demo: Node border + rounded rect
 */
import { Graph } from '../../src/index.ts';

export async function run(container: string | HTMLElement) {
  const root = typeof container === 'string' ? document.querySelector(container)! as HTMLElement : container;
  const graphs: Graph[] = [];

  // Circle nodes with stroke
  const div1 = document.createElement('div');
  div1.style.cssText = 'width:100%;height:45%;position:relative;';
  root.appendChild(div1);

  const g1 = new Graph({
    autoFitOnResize: true,
    container: div1,
    data: {
      nodes: [
        { id: 'c1', name: 'No stroke', x: 100, y: 80 },
        { id: 'c2', name: 'Thin stroke', x: 250, y: 80 },
        { id: 'c3', name: 'Thick stroke', x: 400, y: 80 },
        { id: 'c4', name: 'Colored', x: 550, y: 80 },
      ],
      edges: [],
    },
    node: {
      type: 'circle',
      style: {
        fill: '#5B8FF9',
        size: 36,
        stroke: (d) => d.id === 'c4' ? '#F08F56' : '#fff',
        strokeWidth: (d) => d.id === 'c1' ? 0 : d.id === 'c2' ? 2 : d.id === 'c3' ? 4 : 3,
      },
    },
    theme: 'light',
  });
  await g1.render();
  graphs.push(g1);

  // Rect nodes with border radius
  const div2 = document.createElement('div');
  div2.style.cssText = 'width:100%;height:45%;position:relative;margin-top:16px;';
  root.appendChild(div2);

  const g2 = new Graph({
    autoFitOnResize: true,
    container: div2,
    data: {
      nodes: [
        { id: 'r1', name: 'Sharp rect', x: 100, y: 80 },
        { id: 'r2', name: 'Rounded 4px', x: 280, y: 80 },
        { id: 'r3', name: 'Rounded 8px', x: 460, y: 80 },
        { id: 'r4', name: 'Pill', x: 640, y: 80 },
      ],
      edges: [],
    },
    node: {
      type: 'rect',
      style: {
        fill: '#5B8FF9',
        width: 60,
        height: 28,
        stroke: '#fff',
        strokeWidth: 2,
        borderRadius: (d) => d.id === 'r1' ? 0 : d.id === 'r2' ? 4 : d.id === 'r3' ? 8 : 14,
      },
    },
    theme: 'light',
  });
  await g2.render();
  graphs.push(g2);

  return {
    fitView: () => graphs.forEach((graph) => graph.fitView()),
    destroy: () => graphs.forEach((graph) => graph.destroy()),
  };
}
