# G6-GL

[English](./README.en-US.md) | 简体中文

[![npm version](https://img.shields.io/npm/v/@antv/g6-gl.svg)](https://www.npmjs.com/package/@antv/g6-gl)
[![build](https://github.com/antvis/G6Lite/actions/workflows/build.yml/badge.svg)](https://github.com/antvis/G6Lite/actions/workflows/build.yml)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@antv/g6-gl)](https://bundlephobia.com/package/@antv/g6-gl)
[![license](https://img.shields.io/npm/l/@antv/g6-gl.svg)](./LICENSE)

基于 WebGL 的高性能轻量图可视化引擎。

![G6-GL 大规模关系图渲染效果](./site/public/examples/large.png)

## 核心价值

- **WebGL 批量渲染**：节点和边进入 GPU 渲染管线，适合大规模关系图。
- **增量交互更新**：状态、位置和业务数据变更按刷新级别调度，避免无关全量重建。
- **AntV 布局能力**：集成 `@antv/layout`，覆盖 force、circular、grid、dagre、mindmap 等布局。
- **受控扩展边界**：通过包根公开 API、函数式映射和统一 `register()` 扩展业务能力。

## 安装

```bash
npm install @antv/g6-gl
```

## 最小示例

准备一个有明确宽高的容器：

```html
<div id="graph" style="width: 800px; height: 500px"></div>
```

然后创建并渲染图：

```ts
import { Graph } from '@antv/g6-gl';

const graph = new Graph({
  container: 'graph',
  data: {
    nodes: [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
    edges: [
      { source: 'a', target: 'b' },
      { source: 'a', target: 'c' },
    ],
  },
  layout: { type: 'circular', radius: 140 },
  behaviors: ['zoom-canvas', 'drag-canvas', 'drag-node', 'hover-highlight'],
});

await graph.render();
```

公开 API 只以 `@antv/g6-gl` 包根导出和 `package.json#exports` 为准，不承诺 `src/` 深层路径。

## 继续阅读

- [官网](https://g6-gl.antv.vision)
- [快速开始](https://g6-gl.antv.vision/docs/getting-started/quick-start)
- [核心概念](https://g6-gl.antv.vision/docs/concepts/overview)
- [配置指南](https://g6-gl.antv.vision/docs/guides/data)
- [API](https://g6-gl.antv.vision/docs/api)
- [示例](https://g6-gl.antv.vision/docs/examples)
- [技术指标](https://g6-gl.antv.vision/docs/metrics/performance)
- [兼容性](https://g6-gl.antv.vision/docs/compatibility/browser)

## 本地开发

```bash
npm install
npm run dev
```

常用验证命令：

```bash
npm run lint
npm run typecheck
npm test -- --coverage
npm run build
npm run size
npm run examples:check -- --profile release
npm run benchmark -- --suite all --mode quick
npm run site:build
```

## 贡献

提交 Pull Request 前请阅读 [贡献指南](./CONTRIBUTING.md) 与 [行为准则](./CODE_OF_CONDUCT.md)。Bug、功能建议和使用问题请通过 [GitHub Issues](https://github.com/antvis/G6Lite/issues) 提交。

## License

[MIT](./LICENSE) © AntV
