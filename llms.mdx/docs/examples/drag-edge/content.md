# 拖拽边端点 (/docs/examples/drag-edge)





把边的端点拖到另一个节点上，完成重新连线。

## 如何体验

按住 A → B 边上靠近 B 的圆点手柄，拖到 C 上松开。

## 数据说明

两条带端点的边可以拖到其他节点上。

## 完整运行代码

```ts
// Local presentation helpers in this repository are used only for the example controls.
import { Graph, type GraphEventMap } from '@antv/g6-lite';
import { createDemoPanel } from './demo-panel.ts';

export async function run(container: string | HTMLElement) {
  const nodeSize = 38;
  const activeColor = '#5366ad';
  const graph = new Graph({
    autoFit: { padding: 48 },
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
    node: { style: { size: nodeSize, label: (node) => String(node.data?.label ?? node.id), labelPlacement: 'center', labelColor: '#fff' } },
    label: { hideOnLowZoom: false },
    edge: {
      style: {
        stroke: (_source, _target, edge) => edge.id === 'editable-edge' ? activeColor : '#94a3b8',
        lineWidth: 4,
        hitAreaWidth: 36,
        endArrow: true,
        label: (_source, _target, edge) => edge.id === 'editable-edge' ? '●' : false,
        labelPlacement: 'end',
        labelFontSize: 18,
        labelColor: activeColor,
        labelBackground: false,
        labelAutoRotate: false,
      },
      stateStyles: { inactive: { opacity: 0.25 } },
    },
    behaviors: ['zoom-canvas', 'drag-canvas', 'drag-edge'],
  });
  const ui = createDemoPanel(container);
  const canvas = graph.getCanvas();
  const preview = document.createElement('div');
  preview.dataset.edgeDragPreview = '';
  preview.setAttribute('aria-hidden', 'true');
  preview.hidden = true;
  preview.style.cssText = `position:absolute;pointer-events:none;z-index:1;height:0;border-top:2px dashed ${activeColor};transform-origin:left center;`;
  canvas.parentElement!.append(preview);

  const drawPreview = ({ source, target, dragEnd, event }: GraphEventMap['edge:drag'][0]) => {
    const stationary = graph.getNodePosition(dragEnd === 'source' ? target : source);
    if (!stationary) return;
    const { x, y } = graph.graphToScreen(stationary.x, stationary.y);
    const dx = event.clientX - x;
    const dy = event.clientY - y;
    const length = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx);
    const radius = graph.graphToScreen(stationary.x + nodeSize / 2, stationary.y).x - x;
    const bounds = canvas.getBoundingClientRect();
    preview.style.left = `${x + radius * Math.cos(angle) - bounds.left}px`;
    preview.style.top = `${y + radius * Math.sin(angle) - bounds.top}px`;
    preview.style.width = `${Math.max(0, length - radius)}px`;
    preview.style.transform = `rotate(${angle}rad)`;
    preview.hidden = false;
  };
  graph.on('edge:pointerenter', () => {
    if (preview.hidden) canvas.style.cursor = 'grab';
  });
  graph.on('edge:pointerleave', () => {
    if (preview.hidden) canvas.style.cursor = '';
  });
  graph.on('edge:dragstart', (payload) => {
    canvas.style.cursor = 'grabbing';
    if (payload.edgeId) graph.setItemState(payload.edgeId, 'inactive', true);
    drawPreview(payload);
    ui.setStatus(`dragstart ${payload.edgeId ?? '-'} (${payload.dragEnd})`);
  });
  graph.on('edge:drag', drawPreview);
  graph.on('edge:dragend', ({ edgeId }) => {
    preview.hidden = true;
    canvas.style.cursor = '';
    if (edgeId) graph.setItemState(edgeId, 'inactive', false);
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
    preview.remove();
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
```


## 继续阅读

- [交互组合](/docs/guides/behaviors)
- [Behavior 参考](/docs/api/options#options-behaviors)