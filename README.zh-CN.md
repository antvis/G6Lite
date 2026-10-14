简体中文 | [English](./README.md)

<h1 align="center">G6Lite</h1>

<p align="center">
  面向交互式图可视化的轻量、高性能 WebGL 引擎。
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@antv/g6-lite"><img alt="npm 版本" src="https://img.shields.io/npm/v/@antv/g6-lite.svg"></a>
  <a href="https://github.com/antvis/G6Lite/actions/workflows/build.yml"><img alt="构建" src="https://github.com/antvis/G6Lite/actions/workflows/build.yml/badge.svg"></a>
  <a href="https://bundlephobia.com/package/@antv/g6-lite"><img alt="压缩后体积" src="https://img.shields.io/bundlephobia/minzip/@antv/g6-lite"></a>
  <a href="./LICENSE"><img alt="MIT 许可证" src="https://img.shields.io/npm/l/@antv/g6-lite.svg"></a>
</p>

<p align="center">
  <a href="https://g6-gl.antv.vision">官网</a> ·
  <a href="https://g6-gl.antv.vision/docs/getting-started/quick-start">快速开始</a> ·
  <a href="https://g6-gl.antv.vision/docs/api">API</a> ·
  <a href="https://g6-gl.antv.vision/docs/examples">示例</a>
</p>

![G6Lite 大规模关系图渲染效果](./site/public/examples/large.png)

## 为什么选择 G6Lite

- **面向图数据的 GPU 渲染** — 节点与边共享 WebGL 批量渲染管线，为流畅探索关系数据而设计。
- **按变化增量更新** — 状态、位置和业务数据变更按刷新级别调度，避免无关的全量重建。
- **布局与交互开箱即用** — 组合使用 `@antv/layout` 布局与可配置的缩放、平移、拖拽、选择和高亮交互。
- **清晰的扩展边界** — 从包根导入公开 API，通过函数映射数据与样式，并使用统一的 `register()` API 扩展能力。

## 安装

```bash
npm install @antv/g6-lite
```

## 快速开始

准备一个有明确宽高的容器：

```html
<div id="graph" style="width: 800px; height: 500px"></div>
```

然后创建并渲染一个可交互的图：

```ts
import { Graph } from '@antv/g6-lite';

const graph = new Graph({
  container: 'graph',
  data: {
    nodes: [
      { id: 'gateway', data: { role: 'core' } },
      { id: 'orders', data: { role: 'service' } },
      { id: 'inventory', data: { role: 'service' } },
    ],
    edges: [
      { source: 'gateway', target: 'orders' },
      { source: 'gateway', target: 'inventory' },
    ],
  },
  node: {
    type: 'circle',
    style: {
      size: 18,
      fill: (node) => (node.data?.role === 'core' ? '#1677ff' : '#36cfc9'),
    },
  },
  edge: { type: 'line', style: { lineWidth: 2 } },
  layout: { type: 'circular', radius: 140 },
  behaviors: ['zoom-canvas', 'drag-canvas', 'drag-node', 'hover-highlight'],
});

await graph.render();
```

公开 API 只以 `@antv/g6-lite` 包根导出和 `package.json#exports` 为准。`src/` 深层路径属于内部实现，可能随版本调整。

## 继续阅读

- [官网](https://g6-gl.antv.vision)
- [快速开始](https://g6-gl.antv.vision/docs/getting-started/quick-start)
- [核心概念](https://g6-gl.antv.vision/docs/concepts/overview)
- [数据与配置](https://g6-gl.antv.vision/docs/guides/data)
- [API 参考](https://g6-gl.antv.vision/docs/api)
- [示例](https://g6-gl.antv.vision/docs/examples)
- [性能指标](https://g6-gl.antv.vision/docs/metrics/performance)
- [浏览器兼容性](https://g6-gl.antv.vision/docs/compatibility/browser)

## 本地开发

```bash
npm install
npm run dev
```

使用 `npm run ci` 执行项目验证流水线，使用 `npm run site` 构建文档站点。

## 贡献

提交 Pull Request 前请阅读[贡献指南](./CONTRIBUTING.md)。Bug、功能建议和使用问题请通过 [GitHub Issues](https://github.com/antvis/G6Lite/issues) 提交。

## 许可证

[MIT](./LICENSE) © AntV
