# G6Lite

[![npm version](https://img.shields.io/npm/v/@antv/g6-lite.svg)](https://www.npmjs.com/package/@antv/g6-lite)
[![CI](https://github.com/antvis/G6Lite/actions/workflows/ci.yml/badge.svg)](https://github.com/antvis/G6Lite/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![bundle size](https://img.shields.io/badge/gzip-~117%20KB-brightgreen.svg)](./website/content/docs/metrics/bundle-size.mdx)

> 基于 WebGL 的高性能图可视化与分析引擎，为大规模图数据而生。
>
> A high-performance graph analysis engine based on WebGL, designed for large-scale graph data analysis.

## ✨ 特性 / Features

- **⚡ WebGL 高性能渲染** — 节点（circle / rect）与边（line / cubic / polyline）以极少 draw call 渲染，万级节点流畅交互。
- **🧭 丰富布局** — 基于 [@antv/layout](https://github.com/antvis/layout) 内置 15+ 布局：force / circular / grid / dagre / fishbone / mindmap / indented-tree / fa2 等。
- **🖱️ 完整交互** — `clickSelect`、`dragNode`、`hoverHighlight`、`brushSelect`、`zoom-canvas`、`drag-canvas` 等开箱即用。
- **🎨 主题** — 内置 `light` / `dark` 主题与 token 覆盖。
- **📦 增量更新近零成本** — RefreshLevel 分级调度 + GPU patch，高亮 / 状态变更 / 拾取开销极低。
- **🔷 TypeScript** — 完整类型定义，strict 模式。

## 📦 安装 / Install

```bash
npm install @antv/g6-lite
```

## 🚀 快速开始 / Quick Start

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

## 📖 文档 / Documentation

完整文档以官网站点形式提供（基于 [Next.js](https://nextjs.org/) + [Fumadocs](https://fumadocs.dev/)）。本地预览：

```bash
npm run site:dev      # 启动文档站点
npm run site:build    # 构建静态站点到 website/out/
```

站点内容：

- **指南 / Guide** — 项目介绍、快速开始、数据格式、节点 / 边样式、布局、交互、主题（建设中，逐步补全）。
- **指标 / Metrics**：
  - [包大小](./website/content/docs/metrics/bundle-size.mdx) — 真实打包体积与同类库对比。
  - [浏览器兼容性](./website/content/docs/metrics/browser-compatibility.mdx) — WebGL 支持矩阵与最低版本。
  - [性能指标](./website/content/docs/metrics/performance.mdx) — 指标定义、测试环境与核心数据。
- **完整指南** — 从 [快速开始](./website/content/docs/getting-started/quick-start.mdx) 进入，覆盖数据、配置、布局、交互、主题与 API。

> 公网文档站点（GitHub Pages）将在 `0.1.0` 正式发布时上线。

## 🎮 Playground

```bash
npm run dev
```

运行后在浏览器中可切换示例：

| Demo | 说明 |
|------|------|
| 最简示例 | 少量节点边 + 环形布局 |
| 节点样式 | 按 `data` 用函数设置 fill、size |
| 布局切换 | 同一数据下切换 circular / force / grid / dagre |
| 主题 | light / dark 及 token 覆盖 |
| 交互高亮 | 缩放、拖拽、节点 / 边高亮 |
| 较大规模 | 约 200 节点，验证基础性能 |

## 🔨 构建 / Build

```bash
npm run build    # 输出 dist/（ESM + 类型声明）
npm run ci       # lint + typecheck + test + build
npm run size     # 检查打包体积
```

## 🗺️ Roadmap

当前处于 `0.1.0-beta` 阶段，目标是首个对外开源版本 `0.1.0`。进行中的工作：

- ✅ 核心引擎、渲染、15+ 布局、P0–P3 交互行为
- ✅ 治理文件（CONTRIBUTING / CODE_OF_CONDUCT / Issue & PR 模板）
- ✅ 文档站点骨架（Next.js + Fumadocs）+ 三份指标文档
- 🚧 Guide 各章节正文、Combo / Label 文档与示例
- 🚧 测试覆盖率门槛、独立 examples、API 文档
- 🚧 GitHub Pages 部署、changesets 发布流程

完整路线图见仓库内部 Roadmap 文档。

## 🤝 贡献 / Contributing

欢迎贡献！提交 Pull Request 前请阅读 [贡献指南](./CONTRIBUTING.md)，了解开发环境、工作流、提交规范（Conventional Commits）与 DCO 签名要求。

参与本项目即表示你同意遵守 [行为准则](./CODE_OF_CONDUCT.md)。

## 💬 社区 / Community

- **Bug 与功能建议**：通过 [GitHub Issues](https://github.com/antvis/G6Lite/issues) 提交（已提供 Bug / Feature / Question 模板）。
- **讨论与提问**：[GitHub Discussions](https://github.com/antvis/G6Lite/discussions)。

## 📄 License

[MIT](./LICENSE) © AntV
