# 注册自定义交互 (/docs/examples/custom-behavior)





注册一个 Behavior：点击节点时选中它，点击画布时清除。

## 如何体验

点击节点选中它，点击空白画布清除选中。

## 数据说明

四个流程节点由自定义 pin-node Behavior 选中。

## 完整运行代码

```ts
/**
 * Demo: register a behavior that selects the clicked node.
 */
import {
  Graph,
  register,
  type BehaviorExtension,
  type BehaviorOptions,
  type ExtensionContext,
} from '@antv/g6-lite';

const PIN_BEHAVIOR = 'pin-node' as const;

type PinBehaviorOptions = BehaviorOptions<typeof PIN_BEHAVIOR>;

function createPinBehavior(): BehaviorExtension<PinBehaviorOptions> {
  let context: ExtensionContext | undefined;
  return {
    init(nextContext) {
      context = nextContext;
    },
    getEvents() {
      return {
        'node:click': ({ nodeId }) => {
          if (!context) return;
          const stateMap = Object.fromEntries(
            context.data.getNodeIds().map((id) => [id, id === nodeId ? ['selected'] : []]),
          );
          context.state.setAll(stateMap);
        },
        'canvas:click': () => {
          if (!context) return;
          const stateMap = Object.fromEntries(context.data.getNodeIds().map((id) => [id, []]));
          context.state.setAll(stateMap);
        },
      };
    },
    destroy() {
      context = undefined;
    },
  };
}

register('behavior', PIN_BEHAVIOR, () => createPinBehavior());

export async function run(container: string | HTMLElement) {
  const graph = new Graph({
    autoFit: true,
    container,
    data: {
      nodes: [
        { id: 'inbox', data: { label: '收件箱' } },
        { id: 'draft', data: { label: '草稿' } },
        { id: 'sent', data: { label: '已发送' } },
        { id: 'archive', data: { label: '归档' } },
      ],
      edges: [
        { source: 'inbox', target: 'draft' },
        { source: 'draft', target: 'sent' },
        { source: 'sent', target: 'archive' },
      ],
    },
    node: {
      type: 'rect',
      style: {
        fill: '#5B8FF9',
        width: 88,
        height: 36,
        borderRadius: 8,
        label: (node) => String(node.data?.label ?? node.id),
        labelPlacement: 'center',
        labelColor: '#fff',
      },
    },
    edge: { style: { endArrow: true } },
    layout: { type: 'dagre', rankdir: 'LR', nodesep: 24, ranksep: 70, nodeSize: [88, 36] },
    behaviors: ['zoom-canvas', 'drag-canvas', { type: PIN_BEHAVIOR } satisfies PinBehaviorOptions],
  });
  await graph.render();
  return graph;
}
```


## 继续阅读

- [自定义交互](/docs/guides/custom-behavior)
- [Behavior 参考](/docs/api/options#options-behaviors)