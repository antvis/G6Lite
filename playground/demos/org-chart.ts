/**
 * Demo: 组织架构图 — 科技公司 (dagre TB + 大矩形节点 + 多行文字自动换行 + 曲线树边)
 */
import { Graph } from '../../src/index.ts';
import { enableDagreLayout } from '../../src/layout/optional/dagre.ts';
import { attachLabelsCanvas, type GraphInstanceWithTools } from '../tooling.ts';

enableDagreLayout();

const LEVEL_COLORS: Record<string, string> = {
  ceo: '#4A7DC0',
  vp: '#E8944A',
  team: '#D45B5B',
};

const NODE_W = 180;
const NODE_H = 70;

const data = {
  nodes: [
    { id: 'ceo', name: 'CEO', data: { title: '首席执行官', level: 'ceo' } },
    { id: 'cto', name: 'CTO', data: { title: '首席技术官', level: 'vp' } },
    { id: 'cfo', name: 'CFO', data: { title: '首席财务官', level: 'vp' } },
    { id: 'coo', name: 'COO', data: { title: '首席运营官', level: 'vp' } },
    { id: 'fe', name: '前端团队', data: { title: '负责人：张工', level: 'team' } },
    { id: 'be', name: '后端团队', data: { title: '负责人：李工', level: 'team' } },
  ],
  edges: [
    { source: 'ceo', target: 'cto' },
    { source: 'ceo', target: 'cfo' },
    { source: 'ceo', target: 'coo' },
    { source: 'cto', target: 'fe' },
    { source: 'cto', target: 'be' },
  ],
};

export async function run(container: string | HTMLElement) {
  const wrapper = typeof container === 'string' ? document.querySelector(container)! as HTMLElement : container;
  wrapper.style.position = 'relative';

  const graph = new Graph({
    container: wrapper,
    data,
    node: {
      type: 'rect',
      style: {
        fill: (n) => LEVEL_COLORS[n.data?.level as string] ?? '#5B8FF9',
        width: NODE_W,
        height: NODE_H,
        borderRadius: 8,
        stroke: '#fff',
        strokeWidth: 2,
      },
    },
    edge: {
      type: 'polyline',
      style: {
        stroke: '#c0c0c0',
        lineWidth: 1.5,
        router: 'tree',
        endArrow: false,
        startArrow: false,
      },
    },
    layout: { type: 'dagre', rankdir: 'TB', nodesep: 50, ranksep: 80, nodeSize: [NODE_W, NODE_H] },
    behaviors: ['zoom-canvas', 'drag-canvas'],
    theme: 'light',
  });

  await graph.render();

  const g = graph as unknown as GraphInstanceWithTools;
  attachLabelsCanvas(wrapper, g, {
    nodeLabel: (n) => `${n.name}\n${(n.data as any)?.title ?? ''}`,
    position: 'inside',
    nodeSize: () => ({ width: NODE_W, height: NODE_H }),
    fontSize: 13,
    color: '#fff',
    secondaryColor: 'rgba(255,255,255,0.8)',
  });

  return { destroy: () => graph.destroy() };
}
