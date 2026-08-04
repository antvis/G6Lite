/**
 * Demo: Tooltip 浮层提示
 *
 * - 节点 hover:显示 label + 角色
 * - 边 hover:显示「源 → 目标(关系)」
 * - tooltip 开箱即用,命中事件由交互调度层统一分发,不依赖其它 behavior
 */
import { Graph, type TooltipContext } from '../../src/index.ts';

export async function run(container: string | HTMLElement) {
  const graph = new Graph({
    autoFitOnResize: true,
    container,
    data: {
      nodes: [
        { id: 'alice', data: { label: 'Alice', role: '产品经理' } },
        { id: 'bob', data: { label: 'Bob', role: '前端工程师' } },
        { id: 'carol', data: { label: 'Carol', role: '后端工程师' } },
        { id: 'dave', data: { label: 'Dave', role: '设计师' } },
        { id: 'erin', data: { label: 'Erin', role: '测试' } },
      ],
      edges: [
        { source: 'alice', target: 'bob', data: { rel: '协作' } },
        { source: 'alice', target: 'carol', data: { rel: '协作' } },
        { source: 'bob', target: 'carol', data: { rel: '联调' } },
        { source: 'alice', target: 'dave', data: { rel: '评审' } },
        { source: 'bob', target: 'erin', data: { rel: '提测' } },
      ],
    },
    node: {
      type: 'circle',
      style: { fill: '#5B8FF9', size: 18, label: (node) => String(node.data?.label ?? node.id) },
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
        getContent: (ctx: TooltipContext) => {
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
  return {
    fitView: () => graph.fitView({ padding: 64, maxZoom: 1.5 }),
    destroy: () => graph.destroy(),
  };
}
