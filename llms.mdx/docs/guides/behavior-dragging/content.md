# 拖动节点、分组与边 (/docs/guides/behavior-dragging)





[拖动节点与分组](/docs/guides/behavior-drag-node) · [拖动边端点](/docs/guides/behavior-drag-edge)

## 拖动节点和分组 [#拖动节点和分组]

节点拖动用 `drag-node` 开启。拖动已选节点时，其他已选节点也会移动。拖动分组里的空白处，可以移动整个分组。



```ts
behaviors: [
  'zoom-canvas',
  'drag-canvas',
  { type: 'click-select', multiple: true, trigger: 'shift' },
  'drag-node',
],
```

**完整运行代码**

```ts
/**
 * Demo: drag individual nodes, and drag a combo by its background.
 */
import { Graph } from '@antv/g6-lite';

export async function run(container: string | HTMLElement) {
  const graph = new Graph({
    autoFit: true,
    container,
    data: {
      nodes: [
        { id: 'web', data: { label: 'Web' }, x: 160, y: 150, comboId: 'clients' },
        { id: 'app', data: { label: 'App' }, x: 160, y: 250, comboId: 'clients' },
        { id: 'api', data: { label: 'API' }, x: 380, y: 200 },
        { id: 'db', data: { label: 'DB' }, x: 560, y: 140 },
        { id: 'cache', data: { label: 'Cache' }, x: 560, y: 270 },
      ],
      edges: [
        { source: 'web', target: 'api' },
        { source: 'app', target: 'api' },
        { source: 'api', target: 'db' },
        { source: 'api', target: 'cache' },
      ],
      combos: [{ id: 'clients', data: { label: '客户端' } }],
    },
    node: {
      type: 'rect',
      style: {
        fill: '#5B8FF9',
        width: 72,
        height: 32,
        borderRadius: 8,
        label: (node) => String(node.data?.label ?? node.id),
        labelPlacement: 'center',
        labelColor: '#fff',
      },
      stateStyles: { selected: { fill: '#8050d2' } },
    },
    combo: {
      style: {
        label: (combo) => String(combo.data?.label ?? combo.id),
        labelPlacement: 'top',
      },
    },
    edge: { style: { endArrow: true, stroke: '#99ADD1' } },
    // #region drag-options
    behaviors: [
      'zoom-canvas',
      'drag-canvas',
      { type: 'click-select', multiple: true, trigger: 'shift' },
      'drag-node',
    ],
    // #endregion drag-options
  });
  try {
    await graph.render();
    graph.fitView({ padding: 48, maxZoom: 1 });
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}
```



节点的分组归属通过分组 API 更新。 [分组方法](/docs/guides/combo#动态调整归属)

## 拖动边的端点 [#拖动边的端点]

边端点拖动用 `drag-edge` 开启。松开后，`edge:dragend` 会报告新的起点和终点。业务确认可以重连后，用 `updateEdgeData()` 保存。



```ts
graph.on('edge:dragend', ({ edgeId, source, target, reconnected }) => {
  if (reconnected && edgeId) {
    graph.updateEdgeData([{ id: edgeId, source, target }]);
  }
  ui.setStatus(`dragend reconnected=${reconnected}\n${edgeId ?? '-'}: ${source} → ${target}`);
});
```

**完整运行代码**

```ts
import { Graph } from '@antv/g6-lite';
import GUI from 'lil-gui';

export async function run(container: string | HTMLElement) {
  const graph = new Graph({
    autoFit: { padding: 48, maxZoom: 1 },
    container,
    data: {
      nodes: [
        { id: 'a', x: 120, y: 160, data: { label: 'A' } },
        { id: 'b', x: 340, y: 80, data: { label: 'B' } },
        { id: 'c', x: 340, y: 240, data: { label: 'C' } },
        { id: 'd', x: 560, y: 160, data: { label: 'D' } },
      ],
      edges: [
        { id: 'editable-edge', source: 'a', target: 'b' },
        { id: 'reference-edge', source: 'c', target: 'd' },
      ],
    },
    node: { style: { size: 38, label: (node) => String(node.data?.label ?? node.id), labelPlacement: 'center', labelColor: '#fff' } },
    edge: { style: { lineWidth: 4, hitAreaWidth: 16, endArrow: true } },
    behaviors: ['zoom-canvas', 'drag-canvas', 'drag-edge'],
  });
  const ui = createDemoPanel(container);

  graph.on('edge:dragstart', (payload: { edgeId?: string; dragEnd: string }) => {
    ui.setStatus(`dragstart ${payload.edgeId ?? '-'} (${payload.dragEnd})`);
  });
  // #region reconnect
  graph.on('edge:dragend', ({ edgeId, source, target, reconnected }) => {
    if (reconnected && edgeId) {
      graph.updateEdgeData([{ id: edgeId, source, target }]);
    }
    ui.setStatus(`dragend reconnected=${reconnected}\n${edgeId ?? '-'}: ${source} → ${target}`);
  });
  // #endregion reconnect

  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => {
    ui.destroy();
    destroy();
  };
  try {
    await graph.render();
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


