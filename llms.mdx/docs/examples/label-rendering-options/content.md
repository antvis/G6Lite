# 标签渲染策略 (/docs/examples/label-rendering-options)





对比固定字号、低缩放持续绘制和关闭碰撞隐藏。

## 如何体验

初始为全部标签、zoom 0.4。选择默认策略和 zoom 0.2，文字隐藏；同一缩放切回全部标签，文字重新出现。刷新恢复初始设置。

## 数据说明

同一张图在默认策略和全部显示之间切换。

## 完整运行代码

```ts
// Local presentation helpers in this repository are used only for the example controls.
import { Graph } from '@antv/g6-lite';
import { createDemoPanel } from './demo-panel.ts';

const NODES = Array.from({ length: 18 }, (_, index) => ({
  id: `service-${index + 1}`,
  x: (index % 6) * 160,
  y: Math.floor(index / 6) * 180,
  data: {
    label: `Service ${String(index + 1).padStart(2, '0')}`,
    fill: ['#5B8FF9', '#5AD8A6', '#F6BD16'][Math.floor(index / 6)],
  },
}));

const EDGES = NODES.slice(1).map((node, index) => ({
  id: `route-${index + 1}`,
  source: NODES[index].id,
  target: node.id,
  data: { label: `route ${index + 1}` },
}));

export async function run(container: string | HTMLElement) {
  const root =
    typeof container === 'string' ? (document.querySelector(container)! as HTMLElement) : container;
  // Reserve left room for the bottom-left status block. Scale the reservation
  // with the container so narrow hosts (e.g. the docs site preview) are not
  // squeezed against the right edge while wide canvases keep the full gap.
  const leftReserve = Math.round(Math.min(360, Math.max(160, root.clientWidth * 0.28)));
  const viewPadding: [number, number, number, number] = [90, 70, 70, leftReserve];
  const graph = new Graph({
    autoFit: { padding: viewPadding, maxZoom: 0.4 },
    container: root,
    data: { nodes: NODES, edges: EDGES },
    label: {
      scaleWithZoom: false,
      hideOnLowZoom: false,
      hideOnCollision: false,
    },
    node: {
      style: {
        size: 30,
        fill: (node) => String(node.data?.fill ?? '#5B8FF9'),
        stroke: '#fff',
        strokeWidth: 2,
        label: (node) => String(node.data?.label ?? node.id),
        labelPlacement: 'bottom',
        labelFontSize: 12,
        labelColor: '#1e293b',
        labelBackground: 'rgba(255,255,255,0.9)',
        labelBackgroundPadding: 3,
      },
    },
    edge: {
      style: {
        stroke: '#94a3b8',
        endArrow: true,
        label: (_source, _target, edge) => String(edge.data?.label ?? edge.id ?? ''),
        labelFontSize: 10,
        labelColor: '#475569',
        labelBackground: 'rgba(255,255,255,0.88)',
        labelBackgroundPadding: 2,
      },
    },
    behaviors: ['zoom-canvas', 'drag-canvas'],
  });
  await graph.render();

  const ui = createDemoPanel(root);

  let allLabels = true;
  let zoom = 0.4;

  const updateStatus = () => {
    ui.setStatus(
      `${allLabels ? '全部标签：三项策略关闭' : '默认策略：三项策略开启'}\n` +
        `zoom=${zoom.toFixed(1)}\n` +
        `${allLabels ? '固定字号 · 不做低 zoom 隐藏 · 不做碰撞隐藏' : '字号随 zoom · 节点<0.3/边<0.5 隐藏 · 碰撞隐藏'}`,
    );
  };

  const setZoom = (nextZoom: number) => {
    zoom = nextZoom;
    graph.fitView({ padding: viewPadding, minZoom: zoom, maxZoom: zoom });
    updateStatus();
  };

  const setLabelPolicy = (showAll: boolean) => {
    allLabels = showAll;
    graph.updateOptions({
      label: {
        scaleWithZoom: !showAll,
        hideOnLowZoom: !showAll,
        hideOnCollision: !showAll,
      },
    });
    updateStatus();
  };

  ui.addAction('全部标签', () => setLabelPolicy(true));
  ui.addAction('默认策略', () => setLabelPolicy(false));
  ui.addAction('zoom 0.2', () => setZoom(0.2));
  ui.addAction('zoom 0.4', () => setZoom(0.4));
  ui.addAction('zoom 1.0', () => setZoom(1));

  setZoom(zoom);

  return {
    getData: () => graph.getData(),
    fitView: () => setZoom(zoom),
    destroy() {
      graph.destroy();
      ui.destroy();
    },
  };
}
```


## 继续阅读

- [标签与图标](/docs/guides/label)
- [标签策略](/docs/api/options#options-label)