# Tooltip (/en/docs/examples/tooltip)





Show custom business information while hovering nodes or edges.

## Try it

Hover nodes for roles and edges for relationship details.

## Data

Five collaborators and five business relationships.

## Complete runnable code

```ts
/**
 * Demo: Tooltip 浮层提示
 *
 * - 节点 hover:显示 label + 角色
 * - 边 hover:显示「源 → 目标(关系)」
 * - tooltip 开箱即用,命中事件由交互调度层统一分发,不依赖其它 behavior
 */
import { Graph, type TooltipContext } from '@antv/g6-lite';

export async function run(container: string | HTMLElement) {
  const graph = new Graph({
    autoFit: true,
    container,
    data: {
      nodes: [
        { id: 'alice', x: 110, y: 76, data: { label: 'Alice', role: '产品经理' } },
        { id: 'bob', x: 290, y: 76, data: { label: 'Bob', role: '前端工程师' } },
        { id: 'carol', x: 200, y: 157, data: { label: 'Carol', role: '后端工程师' } },
        { id: 'dave', x: 0, y: 125, data: { label: 'Dave', role: '设计师' } },
        { id: 'erin', x: 400, y: 125, data: { label: 'Erin', role: '测试' } },
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
      style: { fill: '#5B8FF9', size: 26, label: (node) => String(node.data?.label ?? node.id) },
    },
    label: { scaleWithZoom: false },
    edge: { type: 'line', style: { stroke: '#8b9ec2', lineWidth: 3, hitAreaWidth: 14 } },
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
    getGraphs: () => [graph],
    getData: () => graph.getData(),
    fitView: () => graph.fitView({ padding: 64 }),
    destroy: () => graph.destroy(),
  };
}
```


## Related documentation

- [Using Tooltip](/en/docs/guides/behaviors#tooltip)
- [Behavior reference](/en/docs/api/options#options-behaviors)