# OpenSpec — G6Lite

本目录为 [OpenSpec](https://openspec.dev/) 规范目录，将产品与设计文档转化为可被 AI 与人类共同遵循的规格说明（Source of Truth）。

## 目录结构

- **specs/** — 当前已达成共识的规格，按能力分目录存放：
  - **g6lite-overview** — 产品定位与范围
  - **architecture** — 内部架构：渲染管线、Program 抽象、Framebuffer 拾取、性能优化、状态管理、标签系统
  - **graph-rendering** — 图渲染：Graph 构造、数据格式、节点/边样式
  - **layout** — 布局：基于 AntV Layout 的封装与透传
  - **behaviors** — 交互：zoom-canvas、drag-canvas、highlight-edge、highlight-node
  - **theme** — 主题：light/dark 及 token 覆盖
  - **canvas-tools** — 画布工具栏：放大、缩小、全屏与还原
  - **labels** — 节点与边标签渲染
  - **large-demo-5000** — 5000 点带标签的性能验证 Demo
  - **project-requirements** — 工程要求：TypeScript、目录、playground、性能与包体
  - **future-capabilities** — 当前不做、后续可能：动画、分析

- **changes/** — 变更与提案目录：
  - 已发布版本的变更日志（例如：`changelog-0.2.0.md`）
  - 按需的 proposal / design / tasks / specs 增量文档

## 来源文档

上述规格由 `issue1.md` 中的「背景」「规划」「功能和设计」「要求」等章节转换而来，采用 OpenSpec 约定的格式：

- **Purpose** — 该能力的用途
- **Requirements** — 使用 SHALL 的强制性要求
- **Scenarios** — GIVEN / WHEN / THEN 场景说明

## 参考链接

- AntV Layout: https://github.com/antvis/layout
- AntV Layout 文档: https://layout.antv.vision/zh/guide/introduction
- OpenSpec: https://openspec.dev/
