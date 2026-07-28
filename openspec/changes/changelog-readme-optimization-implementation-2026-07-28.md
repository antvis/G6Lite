# README 英文默认入口优化实施记录（2026-07-28）

## 变更内容

- 将 `README.md` 重写为英文默认入口。
- 新增结构一致的简体中文 `README.zh-CN.md`，并在两份 README 首屏提供双向语言切换。
- 首屏使用 npm version、build、动态压缩体积和 MIT license 四个徽章，并增加 Website、Quick Start、API 与 Examples 快捷导航。
- 保留原有 `site/public/examples/large.png` 主图引用，不修改图片资源。
- 将核心能力收敛为 WebGL 批量渲染、增量更新、布局与交互、公开扩展边界四条。
- 将 Quick Start 收敛为安装、容器、稳定包根 API 和可直接运行的最小图示例。
- 删除阶段性 Roadmap、长篇内部 API 兼容背景和重复文档说明，将 README 收敛为产品与官网入口。
- 删除不存在的 `CODE_OF_CONDUCT.md` 链接，保留有效的贡献指南与 Issues 入口。

## 原因

默认 README 需要优先服务 GitHub、npm、首次接入的开发者和读取仓库上下文的 AI。原内容中英文混排、内部说明偏多，且存在通用能力凑数项，不能快速表达 G6-GL 的差异化能力和最短使用路径。

## 影响

- GitHub 与 npm 默认展示英文 README，中文读者可一键切换到结构一致的中文版本。
- 两份 README 均会进入 npm 发布包；测试、性能工具、OpenSpec 和站点内部文件未因本次变更进入发布包。
- 主图、官网页面、核心源码、公开 API、依赖、工作流和发布配置均未修改。
- README 使用仓库部署工作流声明的正式域名 `g6-gl.antv.vision`。验证时该域名的公网证书与主机名暂不匹配，属于现有部署状态，本次未扩大范围调整域名或部署配置。
- 英文 README 使用最新 `master` 提供的 `/en` 官网与文档路由，中文 README 使用默认中文路由。

## 验证

- README Quick Start 临时类型契约检查通过，验证完成后已删除临时文件。
- `npx prettier --check README.md README.zh-CN.md` 通过。
- 中英文 README 的 HTML/TypeScript 示例完全一致，全部仓库相对链接均指向真实文件。
- `npm run ci` 通过：lint、类型检查、25 个测试文件共 394 个测试、构建和包体积门槛均通过。
- `npm pack --dry-run --json` 通过：`README.md`、`README.zh-CN.md`、`LICENSE`、`dist/`、`src/` 和包元数据进入发布包，其他内部目录未进入。
- `npm run site:build` 通过：静态站点生成 246 个页面，输出检查覆盖 84 个静态 HTML 文件，并包含中英文 README 导航使用的本地化文档路由。
