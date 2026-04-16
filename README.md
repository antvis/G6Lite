# G6Lite

A high-performance graph analysis engine based on WebGL, designed for large-scale graph data analysis.

## Features

- **WebGL rendering** — Nodes (circle/rect) and edges (line) with minimal draw calls
- **Layout** — Thin wrapper over [@antv/layout](https://github.com/antvis/layout): circular, force, grid, dagre, and more
- **Behaviors** — `zoom-canvas`, `drag-canvas`, `highlight-node`, `highlight-edge`
- **Theme** — Built-in `light` and `dark` with token overrides
- **TypeScript** — Full typings and strict mode

## Install

```bash
npm install @antv/g6-lite
```

## Usage

```ts
import { Graph } from '@antv/g6-lite';

const graph = new Graph({
  container: 'container',
  data: {
    nodes: [
      { id: '0', name: 'node 0', data: { cluster: 'a' } },
      { id: '1', name: 'node 1', data: { cluster: 'b' } },
    ],
    edges: [{ source: '0', target: '1', data: {} }],
  },
  node: {
    type: 'circle',
    style: { fill: (d) => (d.data?.cluster === 'a' ? '#5B8FF9' : '#61DDAA'), size: 12 },
  },
  edge: { type: 'line', style: { lineWidth: 2 } },
  layout: { type: 'circular', radius: 150 },
  behaviors: ['zoom-canvas', 'drag-canvas', 'highlight-node', 'highlight-edge'],
  theme: 'dark',
});

await graph.render();
```

## 使用文档与 Demo

- **使用文档**：[docs/guide.md](./docs/guide.md) — 数据格式、配置项、布局、交互、主题与 API 说明。
- **Playground**：运行 `npm run dev` 后，在浏览器中可切换以下示例：

| Demo | 说明 |
|------|------|
| 最简示例 | 少量节点边 + 环形布局 |
| 节点样式 | 按 `data` 用函数设置 fill、size |
| 布局切换 | 同一数据下切换 circular / force / grid / dagre |
| 主题 | light / dark 及 token 覆盖 |
| 交互高亮 | 缩放、拖拽、节点/边高亮 |
| 较大规模 | 约 200 节点，验证基础性能 |

```bash
npm run dev
```

## Build

```bash
npm run build
```

Output: `dist/` (ESM + declarations).

## Spec

Requirements and scenarios are maintained in [openspec/specs](./openspec/README.md) (OpenSpec format).

## License

MIT
