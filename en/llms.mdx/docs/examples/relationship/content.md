# Character relationship network (/en/docs/examples/relationship)





Explore a force-directed network with character nodes and relationship labels.

## Try it

Zoom or pan the canvas, hover characters to highlight connections, and fit the full graph.

## Data

An illustrative Harry Potter character network with 8 nodes and 10 labeled edges.

## Complete runnable code

```ts
// Local presentation helpers in this repository provide example label overlays.
/**
 * Demo: 人物关系网络图 — 哈利波特角色关系 (force 布局 + 边标签)
 */
import { Graph } from '@antv/g6-lite';
import { attachLabelsCanvas, attachEdgeLabelsCanvas, type GraphInstanceWithTools } from './tooling.ts';

const COLORS: Record<string, string> = {
  gryffindor: '#5B8FF9',
  friend: '#F6BD16',
  enemy: '#30BF78',
  mentor: '#E86452',
};

const data = {
  nodes: [
    { id: 'harry', name: '哈利·波特', data: { house: 'gryffindor' } },
    { id: 'ron', name: '罗恩·韦斯莱', data: { house: 'friend' } },
    { id: 'hermione', name: '赫敏·格兰杰', data: { house: 'mentor' } },
    { id: 'voldemort', name: '伏地魔', data: { house: 'enemy' } },
    { id: 'dumbledore', name: '邓布利多', data: { house: 'mentor' } },
    { id: 'snape', name: '斯内普', data: { house: 'friend' } },
    { id: 'draco', name: '德拉科', data: { house: 'enemy' } },
    { id: 'sirius', name: '小天狼星', data: { house: 'friend' } },
  ],
  edges: [
    { source: 'ron', target: 'harry', data: { label: '朋友' } },
    { source: 'hermione', target: 'harry', data: { label: '朋友' } },
    { source: 'harry', target: 'voldemort', data: { label: '试图杀死' } },
    { source: 'dumbledore', target: 'harry', data: { label: '导师' } },
    { source: 'snape', target: 'harry', data: { label: '保护' } },
    { source: 'draco', target: 'harry', data: { label: '敌对' } },
    { source: 'sirius', target: 'harry', data: { label: '教父' } },
    { source: 'ron', target: 'hermione', data: { label: '朋友' } },
    { source: 'snape', target: 'voldemort', data: { label: '暗中效忠' } },
    { source: 'dumbledore', target: 'snape', data: { label: '信任' } },
  ],
};

export async function run(container: string | HTMLElement) {
  const wrapper = typeof container === 'string' ? document.querySelector(container)! as HTMLElement : container;
  wrapper.style.position = 'relative';

  // Use the same fit for initial render, resize, and the toolbar action.
  // A low maxZoom leaves this small network tiny on large or high-DPI canvases.
  const fitOptions = { padding: 64 };
  const graph = new Graph({
    autoFit: fitOptions,
    container: wrapper,
    data,
    node: {
      type: 'circle',
      style: {
        fill: (n) => COLORS[n.data?.house as string] ?? '#5B8FF9',
        stroke: '#fff',
        strokeWidth: 2,
      },
    },
    edge: {
      type: 'line',
      style: {
        stroke: '#bbb',
        lineWidth: 1.5,
        endArrow: true,
      },
    },
    layout: {
      type: 'd3-force',
      linkDistance: 180,
      nodeStrength: -600,
      collideRadius: 60,
      forceSimulation: null,
    },
    behaviors: ['zoom-canvas', 'drag-canvas', 'highlight-node'],
    theme: 'light',
  });

  await graph.render();

  const g = graph as unknown as GraphInstanceWithTools;
  const cleanupNodeLabels = attachLabelsCanvas(wrapper, g, {
    nodeLabel: (n) => n.name ?? n.id,
    position: 'below',
    fontSize: 11,
    color: '#333',
  });
  const cleanupEdgeLabels = attachEdgeLabelsCanvas(wrapper, g, {
    fontSize: 9,
    color: '#555',
    rotated: true,
    showBg: false,
  });

  return {
    getData: () => graph.getData(),
    fitView: () => graph.fitView(fitOptions),
    destroy: () => { cleanupNodeLabels(); cleanupEdgeLabels(); graph.destroy(); },
  };
}
```


## Related documentation

- [Business data mapping](/en/docs/guides/data)
- [Node mapping](/en/docs/guides/node)
- [Edge configuration](/en/docs/guides/edge)