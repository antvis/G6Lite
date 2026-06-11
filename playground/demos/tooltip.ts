/**
 * Demo: Tooltip 浮层提示
 *
 * - 节点 hover:显示 label + 角色
 * - 边 hover:显示「源 → 目标(关系)」
 * - tooltip 开箱即用,命中事件由交互调度层统一分发,不依赖其它 behavior
 */
import { Graph } from '../../src/index.ts';

export async function run(container: string | HTMLElement) {
  const graph = new Graph({
    container,
    data: {
      nodes: [
        { id: 'alice', label: 'Alice', role: '产品经理' },
        { id: 'bob', label: 'Bob', role: '前端工程师' },
        { id: 'carol', label: 'Carol', role: '后端工程师' },
        { id: 'dave', label: 'Dave', role: '设计师' },
        { id: 'erin', label: 'Erin', role: '测试' },
      ],
      edges: [
        { source: 'alice', target: 'bob', rel: '协作' },
        { source: 'alice', target: 'carol', rel: '协作' },
        { source: 'bob', target: 'carol', rel: '联调' },
        { source: 'alice', target: 'dave', rel: '评审' },
        { source: 'bob', target: 'erin', rel: '提测' },
      ],
    },
    node: {
      type: 'circle',
      style: { fill: '#5B8FF9', size: 18, labelText: (d) => String(d.label ?? d.id) },
    },
    edge: { type: 'line', style: { stroke: '#C0C0C0', lineWidth: 2 } },
    layout: { type: 'force', maxIteration: 300 },
    behaviors: [
      'zoom-canvas',
      'drag-canvas',
      'highlight-node',
      'highlight-edge',
      {
        type: 'tooltip',
        trigger: 'hover',
        getContent: (ctx) => {
          if (ctx.itemType === 'node') {
            const { label, role } = (ctx.data ?? {}) as { label?: string; role?: string };
            return `<div style="font-weight:600">${label ?? ctx.nodeId}</div>
                    <div style="color:#8c8c8c;font-size:12px">${role ?? ''}</div>`;
          }
          const rel = (ctx.data as { rel?: string })?.rel ?? '关联';
          return `${ctx.source} → ${ctx.target}<br/><span style="color:#8c8c8c">${rel}</span>`;
        },
      },
    ],
    theme: 'light',
  });

  await graph.render();
  return { destroy: () => graph.destroy() };
}
