# 提示框 Tooltip (/docs/guides/behavior-tooltip)





悬停或点击节点和边时，显示它们的详细信息。

## 配置方式 [#配置方式]

触发方式通过 `trigger` 设置，内容通过 `getContent` 返回。点击触发时，再次点击同一元素或点击空白处可关闭提示框。

```ts
behaviors: [{ type: 'tooltip', trigger: 'hover', delay: 120 }],
```

## 示例 [#示例]



```ts
const tooltip: BuiltInBehaviorOptionsMap['tooltip'] = {
  type: 'tooltip', trigger: 'hover', delay: 120, className: 'docs-hover-tooltip',
  enable: (ctx) => ctx.nodeId !== 'Cache',
  getContent: (ctx) => {
    const card = document.createElement('div');
    card.style.cssText = 'padding:10px 14px;border-radius:8px;background:#163B65;color:white;font:12px system-ui;box-shadow:0 4px 16px #163b6533;';
    const title = document.createElement('strong');
    title.textContent = String(ctx.data?.label ?? ctx.nodeId ?? ctx.edgeId ?? '');
    const detail = document.createElement('div');
    detail.textContent = ctx.itemType === 'node'
      ? `Requests: ${Number(ctx.data?.requests ?? 0)}`
      : `${ctx.source} → ${ctx.target}`;
    card.append(title, detail);
    return card;
  },
};
```

**完整运行代码**

```ts
import { Graph, type BuiltInBehaviorOptionsMap } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  // #region tooltip
  const tooltip: BuiltInBehaviorOptionsMap['tooltip'] = {
    type: 'tooltip', trigger: 'hover', delay: 120, className: 'docs-hover-tooltip',
    enable: (ctx) => ctx.nodeId !== 'Cache',
    getContent: (ctx) => {
      const card = document.createElement('div');
      card.style.cssText = 'padding:10px 14px;border-radius:8px;background:#163B65;color:white;font:12px system-ui;box-shadow:0 4px 16px #163b6533;';
      const title = document.createElement('strong');
      title.textContent = String(ctx.data?.label ?? ctx.nodeId ?? ctx.edgeId ?? '');
      const detail = document.createElement('div');
      detail.textContent = ctx.itemType === 'node'
        ? `Requests: ${Number(ctx.data?.requests ?? 0)}`
        : `${ctx.source} → ${ctx.target}`;
      card.append(title, detail);
      return card;
    },
  };
  // #endregion tooltip
  const graph = new Graph({
    container,
    data: {
      nodes: [
        { id: 'API', x: 0, y: 0, data: { label: '<API Gateway>', requests: 1280 } },
        { id: 'DB', x: 180, y: 0, data: { label: 'Database', requests: 960 } },
        { id: 'Cache', x: 360, y: 0 },
      ],
      edges: [
        { id: 'request', source: 'API', target: 'DB', data: { label: 'Request' } },
        { id: 'warm', source: 'DB', target: 'Cache', data: { label: 'Warm cache' } },
      ],
    },
    node: { style: { size: 32, label: (node) => node.id, labelOffsetY: 8 } },
    edge: { style: { hitAreaWidth: 12 } },
    behaviors: [tooltip],
    autoFit: { padding: 56, maxZoom: 1 },
  });
  try {
    await graph.render();
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}
```



[运行示例与完整代码](/docs/examples/tooltip) · [参数与默认值](/docs/api/options#tooltipoptions) · [查看点击触发与样式配置](/docs/guides/behaviors#tooltip)
