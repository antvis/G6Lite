const n=`/**
 * Demo: Edge types - solid / dashed / arc
 */
import { Graph } from '../../src/index.ts';

export async function run(container: string | HTMLElement) {
  const graphs: Graph[] = [];
  const root = typeof container === 'string' ? document.querySelector(container)! as HTMLElement : container;

  // Line edges: solid + dashed
  const lineDiv = document.createElement('div');
  lineDiv.style.cssText = 'width:100%;height:45%;position:relative;';
  root.appendChild(lineDiv);

  const g1 = new Graph({
    container: lineDiv,
    data: {
      nodes: [
        { id: 's1', name: 'Solid', x: 80, y: 80 },
        { id: 't1', name: '', x: 280, y: 80 },
        { id: 's2', name: 'Dashed', x: 400, y: 80 },
        { id: 't2', name: '', x: 600, y: 80 },
      ],
      edges: [
        { source: 's1', target: 't1', data: { dash: false } },
        { source: 's2', target: 't2', data: { dash: true } },
      ],
    },
    node: { type: 'circle', style: { fill: '#5B8FF9', size: 24 } },
    edge: {
      type: 'line',
      style: {
        stroke: '#99ADD1',
        lineWidth: 2,
        endArrow: true,
        lineDash: (_s: any, _t: any, e: any) => e.data?.dash ? [6, 4] : [],
      },
    },
    theme: 'light',
  });
  await g1.render();
  graphs.push(g1);

  // Arc edges
  const arcDiv = document.createElement('div');
  arcDiv.style.cssText = 'width:100%;height:45%;position:relative;margin-top:16px;';
  root.appendChild(arcDiv);

  const g2 = new Graph({
    container: arcDiv,
    data: {
      nodes: [
        { id: 'a1', name: 'Arc', x: 80, y: 80 },
        { id: 'a2', name: '', x: 280, y: 80 },
        { id: 'a3', name: 'Arc wide', x: 400, y: 80 },
        { id: 'a4', name: '', x: 600, y: 80 },
      ],
      edges: [
        { source: 'a1', target: 'a2', data: { c: 0.3 } },
        { source: 'a3', target: 'a4', data: { c: 0.6 } },
      ],
    },
    node: { type: 'circle', style: { fill: '#5B8FF9', size: 24 } },
    edge: {
      type: 'arc',
      style: {
        stroke: '#5B8FF9',
        lineWidth: 2,
        curvature: (_s: any, _t: any, e: any) => e.data?.c ?? 0.3,
      },
    },
    theme: 'light',
  });
  await g2.render();
  graphs.push(g2);

  return { destroy: () => graphs.forEach(g => g.destroy()) };
}
`;export{n as default};
