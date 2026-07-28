# G6-GL

[![npm version](https://img.shields.io/npm/v/@antv/g6-gl.svg)](https://www.npmjs.com/package/@antv/g6-gl)
[![build](https://github.com/antvis/G6Lite/actions/workflows/build.yml/badge.svg)](https://github.com/antvis/G6Lite/actions/workflows/build.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![bundle size](https://img.shields.io/badge/gzip-~117%20KB-brightgreen.svg)](./site/content/docs/zh/metrics/bundle-size.mdx)

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
npm install @antv/g6-gl
```

## 🚀 快速开始 / Quick Start

```ts
import { Graph } from '@antv/g6-gl';

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

`new Graph(options)` 是长期保留的唯一推荐创建入口；项目不会改为 `createGraph()` 或无 `new` 的函数式入口。

## 🧩 扩展与 API 边界 / Extensions & API Boundary

业务扩展统一从包根使用 `register()`。无状态 Node / Edge / Label 描述可直接注册；Behavior、Layout、Transform、Plugin 等有状态扩展使用 `extensionFactory()`，确保每个 Graph 获得独立实例：

```ts
import { extensionFactory, register } from '@antv/g6-gl';

register(
  'behavior',
  'business-click',
  extensionFactory(() => ({
    init(context) {
      // 通过受控 context.data / state / viewport 使用引擎能力
    },
    getEvents() {
      return {};
    },
  })),
);
```

`extensionFactory()` 是有状态扩展实例隔离的唯一保证。beta 兼容的对象实例和 class constructor 仍可注册，但对象只做尽力克隆，新增有状态扩展不要依赖该兼容行为。

- 公开 API 和类型只从 `@antv/g6-gl` 包根导入；不要依赖 `DataModel`、Renderer、Scheduler 或源码深层路径。
- 查询结果使用 `NodeModel`、`EdgeModel`、`ComboModel` 和 `ElementModel`，数据修改统一通过 Graph 或 ExtensionContext API 完成。
- 当前发布产物为 ESM-only，消费代码使用标准 ESM import，不支持 `require()`。
- 仓库源码中的相对 `.js` 后缀用于保证 `tsc` 产物可被 Node ESM 直接解析，暂不应机械删除。

详见[扩展体系](./site/content/docs/zh/guides/extensions.mdx)。公开 API 参考由 `npm run docs:api` 从包根类型自动生成。

## 📖 文档 / Documentation

完整文档以官网站点形式提供（基于 [Next.js](https://nextjs.org/) + [Fumadocs](https://fumadocs.dev/)）。本地预览：

```bash
npm run site:dev      # 启动文档站点
npm run site:build    # 构建静态站点到 site/out/
```

站点内容：

- **指南 / Guide** — 项目介绍、快速开始、数据格式、节点 / 边样式、布局、交互、主题（建设中，逐步补全）。
- **指标 / Metrics**：
  - [包大小](./site/content/docs/zh/metrics/bundle-size.mdx) — 真实打包体积与同类库对比。
  - [浏览器兼容性](./site/content/docs/zh/compatibility/browser.mdx) — WebGL 支持矩阵与最低版本。
  - [性能指标](./site/content/docs/zh/metrics/performance.mdx) — 指标定义、测试环境与核心数据。
- **完整指南** — 从 [快速开始](./site/content/docs/zh/getting-started/quick-start.mdx) 进入，覆盖数据、配置、布局、交互、主题与 API。

> 公网文档站点（GitHub Pages）将在 `0.1.0` 正式发布时上线。

## 🎮 Playground

```bash
npm run dev
```

运行后可按分类浏览功能、缺陷回归、性能和真实数据集案例；案例清单及覆盖能力以 [`playground/demos/catalog.json`](./playground/demos/catalog.json) 为准。

## 🔨 构建 / Build

```bash
npm run build    # 输出 dist/（ESM + 类型声明）
npm run ci       # lint + typecheck + coverage + build + package smoke + size
npm run size     # 检查打包体积
```

## 🗺️ Roadmap

当前处于 `0.1.0-beta` 阶段，目标是首个对外开源版本 `0.1.0`。进行中的工作：

- ✅ 核心引擎、渲染、15+ 布局、P0–P3 交互行为
- ✅ 治理文件（CONTRIBUTING / CODE_OF_CONDUCT / Issue & PR 模板）
- ✅ 文档站点骨架（Next.js + Fumadocs）+ 三份指标文档
- ✅ TypeDoc API 参考、公开类型边界检查与 beta API 迁移材料
- ✅ 发布前 package smoke、公开声明和包入口验证
- 🚧 Guide 各章节正文、Combo / Label 文档与示例
- 🚧 测试覆盖率门槛与独立 examples
- 🚧 GitHub Pages 部署与发布自动化

完整路线图见仓库内部 Roadmap 文档。

## 🤝 贡献 / Contributing

欢迎贡献！提交 Pull Request 前请阅读 [贡献指南](./CONTRIBUTING.md)，了解开发环境、工作流、提交规范（Conventional Commits）与 DCO 签名要求。

参与本项目即表示你同意遵守 [行为准则](./CODE_OF_CONDUCT.md)。

## 💬 社区 / Community

- **Bug 与功能建议**：通过 [GitHub Issues](https://github.com/antvis/G6Lite/issues) 提交（已提供 Bug / Feature / Question 模板）。
- **讨论与提问**：[GitHub Discussions](https://github.com/antvis/G6Lite/discussions)。

## 📄 License

[MIT](./LICENSE) © AntV
