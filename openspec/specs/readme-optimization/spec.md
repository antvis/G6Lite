# README 英文默认入口优化方案

## 状态

- 状态：已确认并实施
- 日期：2026-07-28
- 开发分支：`feature/readme-optimization`
- 基线：最新 `origin/master`（`59fffec`）

## 1. 目标

将仓库根 README 收敛为 G6-GL 的英文默认门户，同时保留结构一致的简体中文版本。README 需要让首次访问的开发者和读取仓库上下文的 AI 快速理解产品定位、完成安装、运行最小示例，并继续进入官网的文档、API 和示例页面。

本次只处理评审截图红框中的内容：

- 中英文入口与默认语言。
- README 的信息结构、排版和逐字文案。
- 徽章。
- 3～4 条有辨识度的核心能力。
- 最小安装与示例代码。
- 官网导航。

## 2. 非目标

- 不新增、替换或重新设计主图，不修改图片资源。
- 不修改官网页面、核心源码、示例实现、API、依赖、工作流或发布配置。
- 不引入未经指标报告支撑的性能数字、包体积数字或营销口号。
- 不顺带整理 Roadmap、站点视觉和其他工程文档。

## 3. 文件与语言策略

- `README.md` 作为 GitHub 和 npm 默认展示文件，内容改为英文。
- 新增 `README.zh-CN.md` 作为简体中文版本。
- 两份 README 顶部互相链接：英文页显示简体中文入口，中文页显示 English 入口。
- 两份 README 保持相同章节顺序、徽章、代码和导航，只翻译说明文字，避免内容漂移。
- 当前原工作区中的 README 草稿只作为内容参考；不会把其余未提交的网站或工作流改动带入本分支。

## 4. 信息结构

README 按以下顺序组织：

1. 语言切换。
2. 产品名与一句话定位。
3. 动态徽章与官网快捷导航。
4. 保持现有主图引用和展示方式不变。
5. 3～4 条核心能力。
6. 安装。
7. 可直接复制运行的 Quick Start。
8. 官网继续阅读入口。
9. 精简的本地开发、贡献与 License 信息。

删除或下沉重复、内部化、阶段性的说明，例如长篇 API 兼容背景、详细 Roadmap、站点建设状态和重复的文档目录。README 只承担产品入口职责，完整解释交给官网和仓库专项文档。

## 5. 首屏与徽章

首屏使用简洁、语义清晰的 Markdown/HTML 结构，不依赖复杂装饰，保证 GitHub、npm 和 AI 文本读取场景都能正确理解。

建议保留四个可自动更新且与当前仓库真实配置一致的徽章：

- npm version：链接 npm 包页面。
- build：链接当前实际存在的 `.github/workflows/build.yml`。
- minified + gzip bundle size：使用动态数据源，避免写死 `~117 KB`。
- MIT license：链接仓库 `LICENSE`。

官网快捷导航放在首屏可见位置，至少包含 Website、Quick Start、API 和 Examples。链接必须使用当前分支实际存在的站点路由。

## 6. 核心能力文案

核心能力控制为四条，每条都说明用户可获得的具体能力，避免“完整 TypeScript 类型”一类缺少产品辨识度的通用描述：

- WebGL batched rendering：突出面向关系图的 GPU 批量渲染管线，不承诺未经验证的固定节点规模。
- Incremental interaction updates：说明状态、位置和数据变化按刷新级别更新，避免无关全量重建。
- Layouts and interactions included：说明基于 `@antv/layout` 的常用布局及缩放、拖拽、高亮等交互可直接配置。
- Explicit extension boundary：说明业务从包根公开 API、函数式映射和统一 `register()` 扩展，避免依赖源码深层路径。

英文文案先定稿，中文版本按相同语义翻译，不逐字硬译。

## 7. Quick Start

Quick Start 必须形成完整的最短使用路径：

1. 安装 `@antv/g6-gl`。
2. 准备一个有明确宽高的容器。
3. 从包根导入 `Graph`。
4. 提供最小节点、边、布局和基础交互配置。
5. 调用并等待 `graph.render()`。

示例只使用当前稳定公开 API，不出现深层导入、内部类型、实验性扩展或与官网快速开始不一致的行为名称。示例代码应保持足够短，但复制到浏览器工程后可以直接运行。

## 8. 官网导航

README 仅保留面向使用者的主要入口：

- Website
- Quick Start
- Core Concepts
- Configuration
- API
- Examples
- Performance / Technical Metrics
- Browser Compatibility

最新 `master` 已提供中英文官网路由。英文 README 指向 `/en` 及其文档路由，中文 README 指向默认中文路由。实施时逐项检查链接，避免保留站点不存在的页面或历史路径。

## 9. 预计变更文件

- `README.md`
- `README.zh-CN.md`
- `openspec/specs/readme-optimization/spec.md`
- `openspec/changes/changelog-readme-optimization-plan-2026-07-28.md`
- `openspec/changes/changelog-readme-optimization-implementation-2026-07-28.md`（实施完成后新增）

## 10. 验证

实施完成后执行与 README 变更相匹配的验证：

- 检查两份 README 的章节、代码和链接保持一致。
- 检查全部仓库相对链接对应真实文件。
- 检查官网链接的中英文路由及关键页面可访问性。
- 检查 CI、npm、bundle size 和 license 徽章 URL 有效。
- 核对 Quick Start 中的配置项和行为名称与当前公开类型一致。
- 运行 `npm run typecheck`，确认文档使用的公开 API 未偏离类型定义。
- 运行 `npm pack --dry-run` 或现有 package smoke，确认默认英文 `README.md` 与中文 README 按预期进入发布包，且测试、方案和站点内部文件未意外扩大包清单。

## 11. 验收标准

- GitHub 与 npm 默认展示英文 `README.md`。
- 简体中文版本可从首屏一键进入，并能返回英文默认页。
- 首屏包含有效徽章和明确的官网导航。
- 核心能力只有 3～4 条，内容具体、可验证、无通用凑数项。
- 新用户或 AI 只阅读 README 即可完成安装并写出第一个可运行图示例。
- 主图及其资源不发生变化。
- 除 README、方案和实施变更记录外，不修改其他产品或工程文件。
