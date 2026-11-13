# 渲染、布局与数据更新 (/docs/guides/events/lifecycle)





## 操作完成后怎么继续 [#选择正确的完成时机]

| 要做什么             | 写法                                                 |
| ---------------- | -------------------------------------------------- |
| 首次渲染后更新图         | 等待 `await graph.render()`，再修改数据或状态。                |
| 重新布局后读取坐标        | 等待 `await graph.layout()`，再调用 `getNodePosition()`。 |
| 在每次整图数据替换后更新业务界面 | 监听 `datachange`，回调会收到更新后的节点数和边数。                   |

```ts
await graph.render();

graph.on('datachange', ({ nodeCount, edgeCount }) => {
  console.log('数据已替换', nodeCount, edgeCount);
});
await graph.setData(nextData);

await graph.layout();
const position = graph.getNodePosition('A');
```

如果要收到首次渲染通知，在调用 `render()` 前注册 `graph.once('afterrender', handler)`。`layout:end` 和 `afterlayout` 在坐标写回前触发，读取最终坐标请等待 `graph.layout()` 完成。

## 观察事件顺序 [#观察事件顺序]

示例加载时，日志会显示首次布局和渲染的事件。再点击画布右上角的按钮，查看对应操作触发了哪些事件。

| 示例按钮                                | 日志里会出现什么                                                            |
| ----------------------------------- | ------------------------------------------------------------------- |
| **Update A**、**Add D**、**Remove D** | 分别触发 `afterupdateitem`、`afteradditem`、`afterremoveitem`。先添加 D，再试删除。 |
| **Replace data**                    | 示例配置了布局，因此先触发布局事件，再触发 `datachange`。                                 |
| **Layout**                          | 触发布局事件。                                                             |



```ts
const events = [
  'beforelayout', 'layout:start', 'layout:end', 'afterlayout',
  'beforerender', 'afterrender', 'datachange',
  'afteradditem', 'afterremoveitem', 'afterupdateitem',
] as const;
const cleanups: Array<() => void> = [];
const watch = <K extends keyof GraphEventMap>(name: K) => {
  const handler = () => push(name);
  graph.on(name, handler);
  cleanups.push(() => graph.off(name, handler));
};
for (const event of events) watch(event); // Before render: capture initial events.
```

**完整运行代码**

```ts
import { Graph, type GraphData, type GraphEventMap } from '@antv/g6-lite';
import GUI from 'lil-gui';

export async function run(container: HTMLElement) {
  const initialData = (): GraphData => ({
    nodes: ['A', 'B', 'C'].map((id) => ({ id, data: { edits: 0 } })),
    edges: [{ id: 'A-B', source: 'A', target: 'B' }],
  });
  const fit = { padding: [70, 40, 140, 40] as [number, number, number, number], maxZoom: 1 };
  const graph = new Graph({
    container,
    data: initialData(),
    layout: { type: 'grid', rows: 1, width: 320, height: 80 },
    node: { style: { size: 30, label: (node) => `${node.id}: ${node.data?.edits ?? 0}`, labelOffsetY: 8 } },
    behaviors: [],
    autoFit: fit,
  });
  const ui = createDemoPanel(container);
  const status = document.createElement('div');
  status.setAttribute('role', 'status');
  status.style.cssText = 'position:absolute;bottom:12px;left:12px;right:12px;background:white;color:#334155;padding:6px 10px;font:12px/1.4 system-ui;white-space:pre-line;pointer-events:none;z-index:20;';
  const lines: string[] = [];
  const push = (line: string) => {
    lines.push(line);
    status.textContent = lines.slice(-6).join('\n');
  };
  // #region lifecycle
  const events = [
    'beforelayout', 'layout:start', 'layout:end', 'afterlayout',
    'beforerender', 'afterrender', 'datachange',
    'afteradditem', 'afterremoveitem', 'afterupdateitem',
  ] as const;
  const cleanups: Array<() => void> = [];
  const watch = <K extends keyof GraphEventMap>(name: K) => {
    const handler = () => push(name);
    graph.on(name, handler);
    cleanups.push(() => graph.off(name, handler));
  };
  for (const event of events) watch(event); // Before render: capture initial events.
  // #endregion lifecycle
  let disposed = false;
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => {
    disposed = true;
    for (const cleanup of cleanups) cleanup();
    ui.destroy();
    status.remove();
    destroy();
  };
  try {
    await graph.render();
    const buttons: ReturnType<typeof ui.addAction>[] = [];
    const addButton = (label: string, action: () => void | Promise<void>) => {
      const button = ui.addAction(label, async () => {
        for (const item of buttons) item.disable();
        lines.length = 0;
        push(`> ${label}`);
        try {
          await action();
          if (!disposed) { graph.fitView(fit); push('operation complete'); }
        } catch {
          if (!disposed) push('operation failed');
        } finally {
          if (!disposed) for (const item of buttons) item.enable();
        }
      });
      buttons.push(button);
    };
    addButton('Update A', () => {
      const edits = Number(graph.getNodeData('A')?.data?.edits ?? 0) + 1;
      graph.updateNodeData('A', { edits });
    });
    addButton('Add D', () => {
      if (!graph.getNodePosition('D')) graph.addNode({ id: 'D', x: 320, y: 100 });
    });
    addButton('Remove D', () => {
      if (graph.getNodePosition('D')) graph.removeNode('D');
    });
    addButton('Replace data', () => graph.setData(initialData(), { fitView: false }));
    addButton('Layout', () => graph.layout());
    container.append(status);
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}


export function createDemoPanel(container: string | HTMLElement, description = '') {
  const host = typeof container === 'string' ? document.querySelector<HTMLElement>(container)! : container;
  if (getComputedStyle(host).position === 'static') host.style.position = 'relative';

  let gui: GUI | undefined;
  const getGui = () => {
    if (!gui) {
      gui = new GUI({ container: host, width: 160 });
      gui.domElement.classList.add('g6lite-demo-controls');
      gui.domElement.dataset.captureIgnore = '';
      Object.assign(gui.domElement.style, {
        position: 'absolute',
        top: '10px',
        right: '10px',
        zIndex: '30',
        maxWidth: 'calc(100% - 20px)',
        maxHeight: 'calc(100% - 20px)',
      });
    }
    return gui;
  };

  let status: HTMLDivElement | undefined;
  const setStatus = (message: string) => {
    if (!status) {
      status = document.createElement('div');
      status.setAttribute('role', 'status');
      status.dataset.role = 'status';
      status.dataset.captureIgnore = '';
      status.style.cssText =
        'position:absolute;left:12px;bottom:10px;z-index:20;max-width:min(28rem,calc(100% - 24px));color:#64748b;font:12px/1.45 system-ui,sans-serif;pointer-events:none;white-space:pre-wrap;';
      host.append(status);
    }
    status.textContent = message;
  };
  if (description) setStatus(description);

  return {
    get gui() {
      return getGui();
    },
    addAction(label: string, action: () => void, folder = getGui()) {
      return folder.add({ [label]: action }, label);
    },
    addChoice<T extends string>(
      label: string,
      choices: readonly T[] | Record<string, T>,
      value: T,
      onChange: (value: T) => void,
    ) {
      const options = Array.isArray(choices) ? [...choices] : choices;
      return getGui().add({ value }, 'value', options).name(label).onChange(onChange);
    },
    setStatus,
    destroy() {
      gui?.destroy();
      status?.remove();
    },
  };
}
```



完整事件顺序、回调参数和取消时的行为见[事件 API 参考](/docs/api/graph/events#event-lifecycle)。卸载时的清理方法见[图的生命周期](/docs/api/graph#graph-lifecycle)。
