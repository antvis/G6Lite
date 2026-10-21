/**
 * Demo: edge capabilities showcase
 *
 * Section 1: Edge types (line / arc / dashed)
 * Section 2: Edge colors (category palette)
 * Section 3: Arrow directions (none / single / double)
 * Section 4: Arc curvature variants
 */
import { Graph } from '../../src/index.ts';

const PALETTE = ['#1783FF', '#00C9C9', '#F08F56', '#D580FF', '#7863FF', '#DB9D0D', '#60C42D', '#FF80CA', '#2491B3', '#17C76F'];

function makeSection(parent: HTMLElement, title: string, height: string): HTMLDivElement {
  const wrap = document.createElement('div');
  wrap.className = 'demo-canvas-card';
  wrap.style.cssText = `width:100%;height:${height};position:relative;margin-bottom:8px;`;
  const label = document.createElement('div');
  label.textContent = title;
  label.style.cssText = 'position:absolute;top:4px;left:8px;color:#888;font-size:12px;z-index:1;';
  wrap.appendChild(label);
  parent.appendChild(wrap);
  return wrap;
}

export async function run(container: string | HTMLElement) {
  const root = typeof container === 'string' ? document.querySelector(container)! as HTMLElement : container;
  const graphs: Graph[] = [];

  // ---- Section 1: Edge types (line + dashed) ----
  const sec1 = makeSection(root, 'Edge types: solid / dashed / arc', '22%');
  const g1 = new Graph({
    autoFitOnResize: true,
    container: sec1,
    data: {
      nodes: [
        { id: 's1', name: 'Solid', x: 60, y: 50 },
        { id: 't1', name: '', x: 200, y: 50 },
        { id: 's2', name: 'Dashed', x: 280, y: 50 },
        { id: 't2', name: '', x: 420, y: 50 },
      ],
      edges: [
        { source: 's1', target: 't1', data: { type: 'solid' } },
        { source: 's2', target: 't2', data: { type: 'dashed' } },
      ],
    },
    node: { type: 'circle', style: { fill: '#5B8FF9', size: 24 } },
    edge: {
      type: 'line',
      style: {
        stroke: '#99ADD1',
        lineWidth: 2,
        endArrow: true,
        lineDash: (_s, _t, e) => (e.data as Record<string, string>)?.type === 'dashed' ? [6, 4] : [],
      },
    },
    theme: 'light',
  });
  await g1.render();
  graphs.push(g1);

  // Arc edges in separate graph
  const sec1b = makeSection(root, '', '0'); // hidden label
  sec1b.style.height = '0';
  sec1b.style.marginBottom = '0';

  // Combine arc into same section visually
  const sec1arc = document.createElement('div');
  sec1arc.style.cssText = 'position:absolute;right:60px;top:0;width:200px;height:100%;';
  sec1.appendChild(sec1arc);
  const g1arc = new Graph({
    autoFitOnResize: true,
    container: sec1arc,
    data: {
      nodes: [
        { id: 'sa', name: 'Arc', x: 30, y: 50 },
        { id: 'ta', name: '', x: 170, y: 50 },
      ],
      edges: [{ source: 'sa', target: 'ta' }],
    },
    node: { type: 'circle', style: { fill: '#5B8FF9', size: 24 } },
    edge: {
      type: 'arc',
      style: { stroke: '#99ADD1', lineWidth: 2, curvature: 0.3 },
    },
    theme: 'light',
  });
  await g1arc.render();
  graphs.push(g1arc);

  // ---- Section 2: Edge colors (category palette) ----
  const sec2 = makeSection(root, 'Edge colors: category palette', '22%');
  const colorNodes: { id: string; name: string; x: number; y: number }[] = [];
  const colorEdges: { source: string; target: string; data?: { idx: number } }[] = [];
  for (let i = 0; i < 10; i++) {
    const x = 60 + i * 80;
    colorNodes.push({ id: `cs${i}`, name: '', x, y: 30 });
    colorNodes.push({ id: `ct${i}`, name: '', x, y: 80 });
    colorEdges.push({ source: `cs${i}`, target: `ct${i}`, data: { idx: i } });
  }
  const g2 = new Graph({
    autoFitOnResize: true,
    container: sec2,
    data: { nodes: colorNodes, edges: colorEdges },
    node: { type: 'circle', style: { fill: '#5B8FF9', size: 16 } },
    edge: {
      type: 'line',
      style: {
        stroke: (_s, _t, e) => PALETTE[(e.data as { idx: number }).idx % PALETTE.length],
        lineWidth: 3,
        endArrow: true,
      },
    },
    theme: 'light',
  });
  await g2.render();
  graphs.push(g2);

  // ---- Section 3: Arrow directions ----
  const sec3 = makeSection(root, 'Arrow directions: none / forward / bidirectional', '22%');
  const g3 = new Graph({
    autoFitOnResize: true,
    container: sec3,
    data: {
      nodes: [
        { id: 'an1', name: 'No arrow', x: 60, y: 50 },
        { id: 'at1', name: '', x: 200, y: 50 },
        { id: 'an2', name: 'Forward', x: 280, y: 50 },
        { id: 'at2', name: '', x: 420, y: 50 },
        { id: 'an3', name: 'Bidirectional', x: 500, y: 50 },
        { id: 'at3', name: '', x: 680, y: 50 },
      ],
      edges: [
        { source: 'an1', target: 'at1', data: { dir: 'none' } },
        { source: 'an2', target: 'at2', data: { dir: 'forward' } },
        { source: 'an3', target: 'at3', data: { dir: 'both' } },
      ],
    },
    node: { type: 'circle', style: { fill: '#5B8FF9', size: 24 } },
    edge: {
      type: 'line',
      style: {
        stroke: '#99ADD1',
        lineWidth: 3,
        endArrow: (_s, _t, e) => (e.data as Record<string, string>)?.dir !== 'none',
        startArrow: (_s, _t, e) => (e.data as Record<string, string>)?.dir === 'both',
      },
    },
    theme: 'light',
  });
  await g3.render();
  graphs.push(g3);

  // ---- Section 4: Arc curvature variants ----
  const sec4 = makeSection(root, 'Arc curvature: 0.1 / 0.3 / 0.5 / 0.8', '22%');
  const curvatures = [0.1, 0.3, 0.5, 0.8];
  const curveNodes: { id: string; name: string; x: number; y: number }[] = [];
  const curveEdges: { source: string; target: string; data: { ci: number } }[] = [];
  for (let i = 0; i < curvatures.length; i++) {
    const x = 80 + i * 180;
    curveNodes.push({ id: `qs${i}`, name: `${curvatures[i]}`, x, y: 50 });
    curveNodes.push({ id: `qt${i}`, name: '', x: x + 120, y: 50 });
    curveEdges.push({ source: `qs${i}`, target: `qt${i}`, data: { ci: i } });
  }
  const g4 = new Graph({
    autoFitOnResize: true,
    container: sec4,
    data: { nodes: curveNodes, edges: curveEdges },
    node: { type: 'circle', style: { fill: '#5B8FF9', size: 24 } },
    edge: {
      type: 'arc',
      style: {
        stroke: '#5B8FF9',
        lineWidth: 2,
        curvature: (_s, _t, e) => curvatures[(e.data as { ci: number }).ci],
      },
    },
    theme: 'light',
  });
  await g4.render();
  graphs.push(g4);

  // ---- Section 5: Self-loop edges ----
  const sec5 = makeSection(root, 'Self-loop edges: single / multiple', '22%');
  const g5 = new Graph({
    autoFitOnResize: true,
    container: sec5,
    data: {
      nodes: [
        { id: 'loop1', name: 'Single loop', x: 120, y: 60 },
        { id: 'loop3', name: '3 loops', x: 360, y: 60 },
        { id: 'loop5', name: '5 loops', x: 600, y: 60 },
      ],
      edges: [
        // Single self-loop
        { source: 'loop1', target: 'loop1' },
        // 3 self-loops on same node
        { source: 'loop3', target: 'loop3' },
        { source: 'loop3', target: 'loop3' },
        { source: 'loop3', target: 'loop3' },
        // 5 self-loops on same node
        { source: 'loop5', target: 'loop5' },
        { source: 'loop5', target: 'loop5' },
        { source: 'loop5', target: 'loop5' },
        { source: 'loop5', target: 'loop5' },
        { source: 'loop5', target: 'loop5' },
      ],
    },
    node: { type: 'circle', style: { fill: '#5B8FF9', size: 24 } },
    edge: {
      type: 'line',
      style: { stroke: '#99ADD1', lineWidth: 2 },
    },
    theme: 'light',
  });
  await g5.render();
  graphs.push(g5);

  return {
    destroy() {
      graphs.forEach((g) => g.destroy());
    },
  };
}
