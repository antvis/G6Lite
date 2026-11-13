# 标签位置与图标 (/docs/examples/labels)





展示节点标签、边标签、图标，并在运行时切换位置。

## 如何体验

在右上角面板将标签位置设为 left，再点击按钮切换节点图标和边标签。刷新可恢复默认配置。

## 数据说明

节点带图标和标签，边带可开关的标签。

## 完整运行代码

```ts
// Local presentation helpers in this repository are used only for the example controls.
/**
 * Demo: 节点标签 / 边标签 / 节点图标
 */
import { Graph, type GraphEdge, type GraphNode, type LabelPlacement } from '@antv/g6-lite';
import { createDemoPanel } from './demo-panel.ts';

const DATA = {
  nodes: [
    { id: 'server', data: { name: 'API Server', type: 'server' } },
    { id: 'db', data: { name: 'Database', type: 'database' } },
    { id: 'cache', data: { name: 'Redis Cache', type: 'cache' } },
    { id: 'queue', data: { name: 'Message Queue', type: 'queue' } },
    { id: 'worker', data: { name: 'Worker', type: 'worker' } },
    { id: 'gateway', data: { name: 'API Gateway', type: 'gateway' } },
    { id: 'client', data: { name: 'Client App', type: 'client' } },
    { id: 'monitor', data: { name: 'Monitor', type: 'monitor' } },
  ],
  edges: [
    { source: 'client', target: 'gateway', data: { label: 'HTTPS' } },
    { source: 'gateway', target: 'server', data: { label: 'gRPC' } },
    { source: 'server', target: 'db', data: { label: 'SQL' } },
    { source: 'server', target: 'cache', data: { label: 'TCP' } },
    { source: 'server', target: 'queue', data: { label: 'AMQP' } },
    { source: 'queue', target: 'worker', data: { label: 'consume' } },
    { source: 'worker', target: 'db', data: { label: 'write' } },
    { source: 'monitor', target: 'server', data: { label: 'metrics' } },
    { source: 'monitor', target: 'gateway', data: { label: 'health' } },
  ],
};

// Text icons use the first letter of each node's business type.
const iconForNode = (node: GraphNode) => String(node.data?.type ?? '').slice(0, 1).toUpperCase();

export async function run(container: string | HTMLElement) {
  const el = typeof container === 'string' ? document.querySelector<HTMLElement>(container)! : container;

  el.style.position = 'relative';

  const graph = new Graph({
    autoFit: true,
    container: el,
    data: DATA,
    layout: { type: 'circular', radius: 180 },
    behaviors: ['zoom-canvas', 'drag-canvas', 'drag-node'],
    node: {
      style: {
        size: 20,
        fill: '#5B8FF9',
        icon: iconForNode,
        iconType: 'text',
        iconFontSize: 12,
        iconColor: '#fff',
        label: (n) => (n.data?.name as string | undefined) ?? n.id,
        labelPlacement: 'bottom',
        labelFontSize: 12,
        labelColor: '#333',
      },
    },
    edge: {
      style: {
        label: (s, t, e) => (e.data?.label as string) ?? '',
        labelFontSize: 10,
        labelColor: '#666',
        labelAutoRotate: true,
      },
    },
    theme: 'light',
  });
  await graph.render();

  const ui = createDemoPanel(el);
  ui.addChoice<LabelPlacement>('标签', ['bottom', 'center', 'top', 'left', 'right'], 'bottom', (value) => {
    graph.updateOptions({ node: { style: { labelPlacement: value } } });
  });

  let edgeLabelsVisible = true;
  let iconsVisible = true;
  ui.addAction('切换边标签', () => {
    edgeLabelsVisible = !edgeLabelsVisible;
    graph.updateOptions({
      edge: {
        style: {
          label: edgeLabelsVisible
            ? ((_source: GraphNode, _target: GraphNode, edge: GraphEdge) =>
                (edge.data?.label as string | undefined) ?? '')
            : false,
        },
      },
    });
  });
  ui.addAction('切换节点图标', () => {
    iconsVisible = !iconsVisible;
    graph.updateOptions({ node: { style: { icon: iconsVisible ? iconForNode : false } } });
  });
  ui.addChoice('布局', ['circular', 'force'], 'circular', async (value) => {
    graph.setLayout(value === 'circular' ? { type: 'circular', radius: 180 } : { type: 'd3-force' });
    await graph.layout();
    graph.fitView();
  });

  return {
    getData: () => graph.getData(),
    fitView: () => graph.fitView(),
    destroy() {
      graph.destroy();
      ui.destroy();
    },
  };
}
```

## 操作与预期 [#操作与预期]

1. 节点中央的白色字母是 `iconType: 'text'` 图标，来自业务 `type` 的首字母；节点名称默认显示在下方，边上显示协议名称。
2. 在画布右上角“标签”菜单依次选择 `top`、`left`、`right`，节点名称应移到对应方向，中央图标保持原位。`center` 会让文字与图标共享中心位置，可能重叠。
3. 在面板点击“切换节点图标”，字母隐藏而节点名称保留，再点一次即可恢复。“切换边标签”只影响边上的协议名称。

面板通过 `graph.updateOptions()` 分别更新图标、节点标签与边标签样式。用“布局”下拉框可以比较不同布局下的标签效果。

用法见[标签与图标指南](/docs/guides/label)；字段见[节点标签](/docs/guides/node#标签)与[节点图标](/docs/guides/node#图标)，整体缩放与碰撞另见[标签渲染策略示例](/docs/examples/label-rendering-options)。


## 继续阅读

- [标签与图标](/docs/guides/label)
- [节点参考](/docs/api/options#options-node)