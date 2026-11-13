# 图形类型 (/docs/examples/shapes)





并排查看圆形和矩形节点。

## 如何体验

对比上下两张图里的圆形和矩形节点。

## 数据说明

两张小图分别使用圆形和矩形节点。

## 完整运行代码

```ts
/**
 * Demo: 混合图形 — 矩形节点 + 弧线边 + 粗线边
 */
import { Graph } from '@antv/g6-lite';

export async function run(container: string | HTMLElement) {
  // --- Rect nodes with arc edges ---
  const rectContainer = document.createElement('div');
  rectContainer.className = 'demo-canvas-card';
  rectContainer.style.cssText = 'width:100%;height:45%;position:relative;';
  const arcLabel = document.createElement('div');
  arcLabel.textContent = 'Rect nodes + Arc edges';
  arcLabel.style.cssText = 'position:absolute;top:4px;left:8px;color:#888;font-size:12px;z-index:1;';
  rectContainer.appendChild(arcLabel);
  (typeof container === 'string' ? document.querySelector(container)! : container).appendChild(rectContainer);

  const graph1 = new Graph({
    autoFit: true,
    container: rectContainer,
    data: {
      nodes: [
        { id: '0', name: 'A' },
        { id: '1', name: 'B' },
        { id: '2', name: 'C' },
        { id: '3', name: 'D' },
        { id: '4', name: 'E' },
        { id: '5', name: 'F' },
      ],
      edges: [
        { source: '0', target: '1' },
        { source: '0', target: '2' },
        { source: '1', target: '3' },
        { source: '2', target: '4' },
        { source: '3', target: '5' },
        { source: '4', target: '5' },
      ],
    },
    node: {
      type: 'rect',
      style: {
        fill: (d) => ['#5B8FF9', '#5AD8A6', '#F6BD16', '#E86452', '#6DC8EC', '#945FB9'][parseInt(d.id) % 6],
        width: 32,
        height: 20,
      },
    },
    edge: {
      type: 'arc',
      style: {
        stroke: '#aaa',
        curvature: 0.25,
      },
    },
    layout: { type: 'circular', radius: 48 },
    behaviors: ['zoom-canvas', 'drag-canvas', 'highlight-node', 'highlight-edge'],
    theme: 'light',
  });
  await graph1.render();

  // --- Circle nodes with thick edges ---
  const thickContainer = document.createElement('div');
  thickContainer.className = 'demo-canvas-card';
  thickContainer.style.cssText = 'width:100%;height:45%;position:relative;margin-top:10px;';
  const thickLabel = document.createElement('div');
  thickLabel.textContent = 'Circle nodes + Thick edges (lineWidth: 3)';
  thickLabel.style.cssText = 'position:absolute;top:4px;left:8px;color:#888;font-size:12px;z-index:1;';
  thickContainer.appendChild(thickLabel);
  (typeof container === 'string' ? document.querySelector(container)! : container).appendChild(thickContainer);

  const graph2 = new Graph({
    autoFit: true,
    container: thickContainer,
    data: {
      nodes: [
        { id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }, { id: 'e' },
      ],
      edges: [
        { source: 'a', target: 'b' },
        { source: 'b', target: 'c' },
        { source: 'c', target: 'd' },
        { source: 'd', target: 'e' },
        { source: 'e', target: 'a' },
      ],
    },
    node: {
      type: 'circle',
      style: { fill: '#E86452', size: 24 },
    },
    edge: {
      type: 'line',
      style: {
        stroke: '#6DC8EC',
        lineWidth: 3,
      },
    },
    layout: { type: 'circular', radius: 48 },
    behaviors: ['zoom-canvas', 'drag-canvas', 'highlight-node', 'highlight-edge'],
    theme: 'light',
  });
  await graph2.render();

  return {
    getData: () => ({ views: [graph1.getData(), graph2.getData()] }),
    fitView() {
      graph1.fitView();
      graph2.fitView();
    },
    destroy() {
      graph1.destroy();
      graph2.destroy();
      rectContainer.remove();
      thickContainer.remove();
    },
  };
}
```


## 继续阅读

- [节点配置](/docs/guides/node)
- [节点参考](/docs/api/options#options-node)