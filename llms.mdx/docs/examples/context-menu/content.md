# 右键菜单 (/docs/examples/context-menu)





在节点上打开右键菜单，执行聚焦或高亮。

## 如何体验

在节点上右键，选择聚焦或高亮。

## 数据说明

三个流程节点响应 node:contextmenu。

## 完整运行代码

```ts
/**
 * Demo: open a node context menu from node:contextmenu.
 */
import { Graph } from '@antv/g6-lite';
import GUI from 'lil-gui';

export async function run(container: string | HTMLElement) {
  const host = typeof container === 'string' ? document.querySelector<HTMLElement>(container)! : container;
  host.style.position = 'relative';

  const graph = new Graph({
    autoFit: true,
    container: host,
    data: {
      nodes: [
        { id: 'design', data: { label: '设计' }, x: 180, y: 160 },
        { id: 'review', data: { label: '评审' }, x: 380, y: 160 },
        { id: 'build', data: { label: '实现' }, x: 560, y: 160 },
      ],
      edges: [
        { source: 'design', target: 'review' },
        { source: 'review', target: 'build' },
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
    edge: { style: { endArrow: true, lineWidth: 1.5 } },
    behaviors: ['zoom-canvas', 'drag-canvas'],
  });
  await graph.render();
  graph.fitView({ padding: 80 });

  const menu = new GUI({ container: host, title: '节点操作', width: 128 }).hide();
  const element = menu.domElement;
  element.dataset.captureIgnore = '';
  Object.assign(element.style, {
    position: 'absolute',
    zIndex: '30',
    maxWidth: '100%',
    maxHeight: '100%',
  });

  let activeId = '';
  const close = () => {
    menu.hide();
  };
  const addAction = (label: string, action: () => void) => {
    menu.add({
      [label]() {
        action();
        close();
      },
    }, label);
  };
  addAction('聚焦', () => graph.focusItem(activeId, 80));
  addAction('高亮', () => {
    for (const node of graph.getNodes()) graph.clearItemStates(node.id);
    graph.setItemState(activeId, 'selected', true);
  });

  graph.on('node:contextmenu', ({ nodeId, nativeEvent }) => {
    nativeEvent.preventDefault();
    activeId = nodeId;
    const bounds = host.getBoundingClientRect();
    menu.open().show();
    const x = Math.max(0, Math.min(nativeEvent.clientX - bounds.left, bounds.width - element.offsetWidth));
    const y = Math.max(0, Math.min(nativeEvent.clientY - bounds.top, bounds.height - element.offsetHeight));
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
  });
  graph.on('canvas:click', close);

  return {
    getData: () => graph.getData(),
    fitView: () => graph.fitView({ padding: 80 }),
    destroy() {
      graph.destroy();
      menu.destroy();
    },
  };
}
```


## 继续阅读

- [事件指南](/docs/guides/events)
- [事件参考](/docs/api/graph/events)