# P5 README、文档与官网实施记录（2026-07-24）

## 变更内容

- 冻结并统一 G6-GL 品牌、npm 包、GitHub 仓库和正式站点域名口径。
- 重写中文 `README.md`，新增结构一致的 `README.en-US.md`，补齐徽章、真实主视觉、四项核心价值和最小可运行代码。
- 将官网文档收敛为快速开始、核心概念、配置指南、API、示例、技术指标和兼容性七组，合并重复 `guide/` 内容并归并 layouts、interactions、advanced 页面。
- 建立 39 个中英文对应文档页面和各层英文导航 metadata。
- 为官网案例增加 `docsGroup`，按 API 概念组织 Examples，同时继续复用 Playground catalog、源码、截图和发布检查。
- 更新 API 稳定性、Benchmark、性能调优、包体积、浏览器兼容性和 G6 v5 迁移说明。
- 增加 sitemap、robots、manifest、favicon、canonical、Open Graph、Twitter card、hreflang、英文 LLM Markdown 和 `llms.txt` 静态路由。
- 拆分中文与英文根布局，静态 HTML 分别输出 `zh-CN` 和 `en`。
- 删除自定义搜索组件、搜索 API 和专用依赖，并在 Root Provider 关闭搜索能力，移除桌面、移动端和折叠侧栏中的搜索入口。
- 删除不可用本地运行入口，保留经过静态发布验证的在线 Playground 和 GitHub 源码入口。
- 新增 `site:check` 与 `site:output-check`，校验双语页面、案例映射、静态 HTML、语言路由和发布产物。
- 修复 TypeDoc 清理英文 API 文档及 Fumadocs 并发生成 `.source` 的构建问题。
- 按用户最新确认，将中文默认首页回退到 P5 前视觉版本，仅修正失效文档链接和动态版本号。
- 新增 `homepage-optimization.md`，记录首页正确性、信息架构、主视觉、响应式和验收建议；确认前不再实施首页优化。

## 变更原因

仓库已完成部分 site 改名、文档结构和案例体系建设。本次以验收收口方式统一公开口径、消除重复文档和不可用入口，并补齐可复现指标、静态发布、多语言与 SEO 链路。

首页包含较多视觉和内容优先级判断。为避免未经单独确认继续改版，默认中文首页恢复旧版呈现，首页视觉统一作为后续独立批次处理。

## 影响

- 核心图引擎实现和公开 API 未修改。
- npm 发布包边界未扩大，site、playground、tests、performance 和 openspec 不进入发布包。
- 中文和英文文档具备对应静态路由，正式 canonical 域名统一为 `https://g6-gl.antv.vision`。
- 中文默认首页暂时保留旧版历史性能展示；这些口径已在首页优化方案中标记为待替换，不作为本轮 P5 技术指标验收结果。
- P5.0～P5.4 已完成；P5.5 首页视觉与中英文一致性等待用户确认。

## 验证结果

- `npm run lint` 通过。
- `npm run typecheck` 通过。
- `npm test -- --coverage` 通过：25 个测试文件、394 个测试。
- `npm run build` 通过。
- npm 包清单检查通过。
- `npm run size` 通过：115.49 kB Brotli，预算 120 kB。
- `npm run examples:check -- --profile release` 通过：46/46。
- `npm run benchmark -- --suite all --mode full` 通过：Node 与浏览器 Full Benchmark 均完成。
- `npm --prefix site run types:check` 通过。
- `npm run site:build` 通过：生成 246 个静态页面，检查 84 个 HTML 产物并复制 Playground。
- 应用内浏览器完成中文旧版首页桌面端、移动端、明暗主题，英文首页、双语文档和 Examples 分组验收。

## 已知非阻塞提示

- 外层工作区仍提示缺少 `./src/.umi/tsconfig.json`，不影响当前仓库构建结果。
- `@antv/layout` 第三方 sourcemap 缺失提示不影响构建与测试。

## 发布说明

- P5 实施和验收阶段未自动执行 git commit、push、分支发布或 npm publish。
- 后续提交与推送仅在用户单独确认后执行。
