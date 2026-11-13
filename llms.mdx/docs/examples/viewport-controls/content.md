# 视口与坐标转换 (/docs/examples/viewport-controls)





验证 camera、fit、zoom、focus、resize 和屏幕/图坐标互转。

## 如何体验

通过工具条执行视口操作，并观察坐标与尺寸结果。

## 数据说明

固定坐标节点用于验证视口和坐标 API。

## 完整运行代码

```ts
// Local presentation helpers in this repository are used only for the example controls.
import { Graph } from '@antv/g6-lite';
import { createDemoPanel } from './demo-panel.ts';

export async function run(container: string | HTMLElement) {
  const graph = new Graph({
    autoFit: true,
    container,
    data: {
      nodes: [
        { id: 'a', x: 60, y: 80, data: { label: 'A' } },
        { id: 'b', x: 420, y: 80, data: { label: 'B' } },
        { id: 'c', x: 240, y: 300, data: { label: 'C' } },
      ],
      edges: [
        { id: 'ab', source: 'a', target: 'b' },
        { id: 'bc', source: 'b', target: 'c' },
        { id: 'ca', source: 'c', target: 'a' },
      ],
    },
    node: { style: { size: 36, label: (node) => String(node.data?.label ?? node.id), labelPlacement: 'center', labelColor: '#fff' } },
    edge: { style: { endArrow: true } },
    behaviors: ['zoom-canvas', 'drag-canvas'],
  });
  await graph.render();
  graph.fitView({ padding: 80 });

  const ui = createDemoPanel(container);

  const showCamera = (prefix: string) => {
    const camera = graph.getCamera();
    ui.setStatus(`${prefix}\nzoom=${camera.zoom.toFixed(3)} x=${camera.x.toFixed(1)} y=${camera.y.toFixed(1)}\nnodes=${graph.getNodes().length} edges=${graph.getEdges().length}`);
  };

  const addCameraAction = (label: string, action: string, run: () => void) => {
    ui.addAction(label, () => {
      run();
      showCamera(action);
    });
  };
  addCameraAction('zoomBy +', 'zoom-in', () => graph.zoomBy(1.25));
  addCameraAction('zoomBy −', 'zoom-out', () => graph.zoomBy(0.8));
  addCameraAction('fitView', 'fit', () => graph.fitView({ padding: 64 }));
  addCameraAction('fitCenter', 'center', () => graph.fitCenter());
  addCameraAction('focus C', 'focus', () => graph.focusItem('c'));
  addCameraAction('setCamera', 'camera', () => graph.setCamera({ zoom: 1.1, x: 80, y: 40 }));
  addCameraAction('resetCamera', 'reset', () => graph.resetCamera());
  addCameraAction('setSize', 'resize', () => graph.setSize(720, 460));
  ui.addAction('坐标互转', () => {
    const position = graph.getNodePosition('a')!;
    const screen = graph.graphToScreen(position.x, position.y);
    const restored = graph.screenToGraph(screen.x, screen.y);
    ui.setStatus(`graph=(${position.x.toFixed(1)}, ${position.y.toFixed(1)})\nscreen=(${screen.x.toFixed(1)}, ${screen.y.toFixed(1)})\nrestored=(${restored.x.toFixed(1)}, ${restored.y.toFixed(1)})`);
  });

  showCamera('ready');
  return {
    getData: () => graph.getData(),
    fitView: () => graph.fitView({ padding: 64 }),
    destroy: () => {
      graph.destroy();
      ui.destroy();
    },
  };
}
```


## 继续阅读

- [视口指南](/docs/guides/viewport)
- [视口方法](/docs/api/graph#graph-viewport)