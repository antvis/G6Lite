# P5：README、文档与官网验收收口方案

## 文档状态

- 状态：主体实施完成，首页优化待单独确认
- 日期：2026-07-24
- 目标版本：命名、公开 API、Benchmark 与案例体系完成冻结后的首个稳定发布阶段
- 确认时间：2026-07-24

## 1. 结论

P5 **技术可行，且已有基础足以采用“验收与收口”方式实施，不需要重建官网**。

但当前不满足直接进入完整实施的条件。建议先完成四项发布口径冻结，再按“正确性与信息架构 → README → 示例与指标 → SEO/多语言 → 首页视觉”的顺序推进。

当前最主要的风险不是页面开发难度，而是 README、官网首页和文档已经引用了尚未稳定或相互矛盾的公开信息。如果先调整视觉和文案，后续命名、API 或 Benchmark 再变化，会造成重复返工和错误宣传。

## 2. 当前基础与问题评估

### 2.1 已具备的基础

- 根 README 已包含安装、最小示例、扩展边界、文档、Playground、构建与治理入口。
- 官网已迁移到 Next.js + Fumadocs，并采用静态导出。
- 已有快速开始、核心概念、配置、布局、交互、进阶、示例、指标、API、FAQ 和 Changelog 等内容，共 47 个 MDX 页面。
- API 文档已通过 TypeDoc 从 `src/index.ts` 的包根公开入口生成。
- Playground 已建立 `catalog.json` 单一案例清单，现有 47 个案例，其中 8 个已进入官网示例。
- 示例检查脚本已校验案例 ID、源码、能力覆盖、截图和官网材料的一致性。
- Benchmark 已有 Node、浏览器、报告生成和 GitHub Actions 运行框架。
- 官网已有静态 HTML、OG 图片、LLM 文本和 GitHub Pages 部署链路。

### 2.2 进入 P5 前需要解决的问题

#### 命名与版本口径

- 产品和包名主要使用 `G6-GL` / `@antv/g6-gl`，仓库名和部分内部标识使用 `G6Lite`，需要明确哪些是品牌名、包名和仓库名，避免被误判为两个产品。
- `package.json` 当前版本为 `0.1.0-beta.22`，首页却硬编码为 `v0.1.0`。
- 部署写入的正式域名是 `g6-gl.antv.vision`，站点默认 metadata URL 仍是 `https://antvis.github.io/G6Lite`，`package.json#homepage` 仍指向 GitHub README。

#### API 稳定性

- 包根导出、公开类型契约测试和 TypeDoc 已建立，基础较好。
- `src/index.ts` 仍明确声明公开 API 正在 beta 阶段重新基线化。
- `BaseNode`、`registerNode()`、`context.graph` 等兼容能力仍处于 deprecated / beta 迁移状态。
- Combo 仍标记为 experimental，API 在 `0.1.x` 内可能微调。

因此 P5 不应重新设计 API，只能在 API 冻结后准确呈现最终公开入口、稳定能力和兼容边界。

#### Benchmark 稳定性

- 新 Benchmark 运行器和 CI 已存在，但公开性能文档仍主要引用 2025-05-09 的旧数据。
- 性能文档声称完整端到端 Benchmark “正在整理”，与仓库现有运行器不一致。
- 文档要求执行的 `scripts/bench-layout-5k.mjs` 已不存在。
- `tests/perf/baselines/` 尚无审核后的公开基线文件。
- 首页和 README 硬编码了 `~0ms`、`0.1ms`、`5k`、`~117 KB` 等数据，缺少统一的数据来源和更新机制。

因此公开指标必须以可复现、带环境信息、经过审核的基线为唯一来源，首页只引用经过批准的少量指标。

#### 文档信息架构

- 当前同时存在 `guide/` 和 `guides/` 两套配置文档，以及两份快速开始页面。
- 首页、FAQ 和旧指南大量链接到 `/docs/guide/*`，新文档入口使用 `/docs/guides/*`。
- `layouts`、`interactions`、`advanced` 与“配置指南 / 技术指标 / 兼容性”的目标结构存在交叉。
- API 文档已超过 7500 行，适合作为自动生成参考，不适合作为新用户的主学习入口。

#### 示例组织

- Playground 的 `category` 同时承担能力分类、场景分类和回归分类，不完全等同于用户理解的 API 概念。
- 官网示例当前为平铺网格，只展示 8 个案例，没有按数据、元素、布局、交互、扩展等 API 概念分组。
- 回归和性能案例适合保留在 Playground 与发布检查中，不应全部暴露为用户学习示例。

#### 官网功能与 SEO

- 顶部仍展示搜索入口，静态搜索索引约 3 MB；当前需求明确要求移除不可用搜索。
- 文档页仍使用 `ViewOptionsPopover`，其中包含不适用于当前发布方式的操作入口；应改为明确的复制 Markdown / 查看源码入口。
- 当前没有 sitemap、robots、favicon 和 manifest 产物。
- 尚未建立官网多语言路由、`hreflang` 和语言切换。
- 首页实现约 654 行 TSX、全站样式约 4045 行，信息密度和重复表达较高；性能值还存在重复渲染的问题，不适合继续叠加模块。

## 3. P5 进入门槛

P5 实施前必须完成以下四项确认。未通过时只允许修正文档错误，不进行大规模视觉和内容包装。

### G0：命名冻结

推荐口径：

- 产品 / 官网品牌：`G6-GL`
- npm 包：`@antv/g6-gl`
- GitHub 仓库：`antvis/G6Lite`
- 中文描述：`基于 WebGL 的高性能轻量图可视化引擎`
- 正式站点：`https://g6-gl.antv.vision`

输出一份命名映射，README、package metadata、站点 metadata、首页、文档和案例只使用映射中的名称。

### G1：公开 API 冻结

- 确认 `package.json#exports` 与包根导出是唯一公开 API。
- 确认稳定、deprecated、experimental 三类 API 清单。
- 确认 README 最小代码只使用稳定 API。
- `npm run typecheck`、公开 API 类型契约和包消费测试通过。
- TypeDoc 生成结果不包含内部模块或未计划公开的入口。

### G2：Benchmark 基线冻结

- 使用当前 `tests/perf/` 运行器生成审核后的基线。
- 记录版本、commit、Node、Chromium、操作系统、CPU/GPU、视口、DPR、数据规模和配置。
- 明确首页允许展示的 2～3 个指标及其适用条件。
- 移除无法复现、已经过期或没有环境说明的数据。
- 包体积以 `size-limit` 的实际构建结果为准。

### G3：案例冻结

- `catalog.json` 的 ID、源码、能力覆盖、发布检查与截图策略稳定。
- `npm run examples:check -- --profile release` 通过。
- 确认哪些案例进入官网，哪些只用于回归、性能或内部发布检查。
- 每个官网案例都能从静态站点打开，并有对应源码、截图和适用 API 概念。

## 4. 目标信息架构

官网一级文档导航收敛为以下七组：

1. 快速开始
2. 核心概念
3. 配置指南
4. API
5. 示例
6. 技术指标
7. 兼容性

FAQ、Changelog、贡献指南作为次级入口，不占据主要学习链路。

### 4.1 路由与内容归并建议

- `getting-started/`：安装、第一个图、React 使用。
- `concepts/`：生命周期、数据模型、渲染与更新心智。
- `guides/`：数据、节点、边、标签、Combo、主题、布局、交互、状态、视口、扩展。
- `api/`：TypeDoc 自动生成的包根 API 参考。
- `examples/`：按 API 概念组织的可运行示例。
- `metrics/`：性能、包体积、测试方法和性能调优。
- `compatibility/`：浏览器、ESM、G6 v5 迁移、deprecated / experimental 说明。

现有 `guide/` 与 `guides/` 只保留一套正文，推荐以当前新结构 `guides/` 为准。由于站点仍处于稳定版前阶段，优先一次性更新内部链接并删除重复正文，避免长期维护重定向和重复 SEO 内容。

`layouts/`、`interactions/` 与 `advanced/` 中的页面按上述归属迁移，不再作为一级导航并列存在。

## 5. README 方案

### 5.1 文件组织

- `README.md`：中文主 README。
- `README.en-US.md`：英文 README。
- 两份 README 顶部互相提供语言切换链接。
- 两份 README 采用相同章节和相同可运行代码，避免内容漂移。

### 5.2 内容顺序

1. 徽章：npm、CI、license、bundle size；只保留可自动更新或可验证的徽章。
2. 主视觉：复用真实 G6-GL 渲染结果，避免独立维护与产品能力无关的装饰图。
3. 一句话定位。
4. 3～4 条核心价值：WebGL 批渲染、增量交互、AntV 布局、受控扩展。
5. 安装与最小可运行代码。
6. 文档、示例、技术指标和兼容性入口。
7. 贡献与 License。

Roadmap、beta 迁移细节和较长的架构解释移入官网或 Changelog，README 不承担完整手册职责。

### 5.3 最小代码约束

- 只从 `@antv/g6-gl` 包根导入。
- 只使用冻结后的稳定 API。
- 代码可直接复制到一个有固定宽高容器的页面运行。
- README、快速开始和官网首页复用同一份代码来源或接受自动一致性检查。

## 6. Examples 方案

保留 Playground 当前的 `category`、`kind`、`coverage` 和 `releaseCheck`，新增面向文档的可选字段 `docsGroup`，避免为了官网展示破坏 P4 已建立的发布与回归分类。

推荐的 `docsGroup`：

- `getting-started`
- `data-and-lifecycle`
- `node-edge-label-combo`
- `layout`
- `interaction-state-viewport`
- `extension`
- `scenario-and-dataset`

官网只消费 `audiences` 包含 `site` 的案例，并按 `docsGroup` 分组展示。性能案例进入技术指标页面；回归案例默认不进入用户示例页。

每个官网示例需包含：适用概念、最小说明、在线运行、源码、关键配置和相关 API 链接。在线运行入口必须经过静态部署验证；不再提供无法工作的“本地运行”按钮。

## 7. SEO、静态输出与多语言

### 7.1 SEO 与静态输出

- 以 `https://g6-gl.antv.vision` 作为 canonical 站点 URL。
- 增加静态 `sitemap.xml`、`robots.txt`、favicon、站点 icon 和 manifest。
- 首页和文档页补齐 canonical、Open Graph、Twitter card 和结构化描述。
- sitemap 只收录 canonical 页面，排除重复旧路由、搜索接口和内部产物。
- 保持 `output: 'export'`，部署产物不依赖 Node 服务端。
- 增加静态链接检查，禁止导航和正文链接指向不存在页面。

### 7.2 多语言

- 中文为默认语言，英文使用 `/en` 路由前缀。
- 首页、七组一级入口和公开文档均提供中英文对应页。
- TypeDoc 的代码标识和签名共用，标题、说明和导航按语言提供。
- 增加语言切换和 `hreflang`，切换时优先落到当前页面的对应语言。
- 不提交只翻译标题、正文为空的占位页面。

多语言可以分批交付，但 P5 完成验收时不能出现主要导航中中英文覆盖不一致的情况。

## 8. 移除不可用入口

- 关闭 HomeLayout 和移动端导航中的搜索入口。
- 删除自定义 SearchDialog、静态搜索 Route Handler 和只为搜索存在的依赖。
- 移除文档页 `ViewOptionsPopover`；保留明确可用的“复制 Markdown”和“在 GitHub 查看源码”。
- 示例页只保留构建产物中实际存在的在线 Playground 地址。
- 清理 `site/README.md` 中 Create Fumadocs 的模板说明，改为本项目真实的开发、构建和部署说明。

## 9. 首页视觉收口

首页视觉放在内容和数据稳定后处理，避免先做包装再反复改口径。

建议将首页收敛为五个主要区块：

1. Hero：品牌、定位、快速开始、GitHub、真实主视觉。
2. 核心价值：3～4 条，不重复堆叠性能话术。
3. API 最小代码与开发体验。
4. 精选案例与经过审核的技术指标。
5. 文档 / 示例 CTA 与页脚。

统一内容最大宽度、标题层级、卡片圆角、间距、按钮样式和中英文排版。删除注释掉的旧区块、重复性能模块和硬编码版本信息。首页指标必须从审核后的数据源生成或集中维护，禁止分散硬编码。

## 10. 分阶段实施计划

### P5.0：发布口径冻结

- 完成 G0～G3。
- 输出命名、API、Benchmark、官网案例清单。
- 修正明显错误信息，但不进行视觉重构。

### P5.1：文档信息架构与正确性

- 合并 `guide/` 与 `guides/`。
- 按七组结构归并页面和导航。
- 更新全部内部链接。
- 修正过期 Benchmark 命令、版本、域名和 API 描述。
- 增加静态链接与文档结构检查。

### P5.2：README 中英文

- 完成中英文 README、徽章、主视觉、核心价值和最小代码。
- 建立 README 与快速开始代码的一致性检查。

### P5.3：API、Examples 与技术指标

- 收口 TypeDoc 展示与稳定性标识。
- 为官网案例增加 `docsGroup` 并按 API 概念展示。
- 基于审核后的 Benchmark 与 size-limit 更新指标页面。

### P5.4：SEO、多语言与不可用功能清理

- 完成中文 / 英文路由、语言切换和 hreflang。
- 增加 sitemap、robots、favicon、manifest 和 canonical metadata。
- 移除搜索、本地运行和模板残留。

### P5.5：首页视觉与 UI 一致性

- 当前按用户确认回退中文默认首页到 P5 前版本，本批次暂停实施。
- 后续方案见 `homepage-optimization.md`，确认后再开始修改首页。
- 收敛首页区块和信息密度。
- 统一最大宽度、排版、卡片、按钮与响应式行为。
- 完成桌面端、移动端、明暗主题和中英文视觉验收。

每一阶段单独形成变更记录，避免一个 PR 同时混合文档迁移、数据更新、依赖删除和大规模样式调整。

## 11. 预计影响范围

- `README.md`、新增 `README.en-US.md`
- `package.json`、站点依赖与 metadata
- `site/content/docs/**`
- `site/src/app/**`
- `site/src/components/**`
- `site/src/lib/**`
- `site/public/**`
- `playground/demos/catalog.json`
- `scripts/` 下的文档链接、README 一致性与站点产物检查脚本
- `.github/workflows/deploy.yml` 和与文档站相关的校验步骤
- `openspec/changes/**`

不会修改核心图引擎实现；如果实施中发现 API、Benchmark 或案例本身仍需调整，应回到对应阶段处理，不在 P5 中顺带修改核心能力。

## 12. 验证方案

按阶段执行与变更范围匹配的验证，最终交付至少包括：

```bash
npm run lint
npm run typecheck
npm test -- --coverage
npm run build
npm run size
npm run examples:check -- --profile release
npm run site:build
npm --prefix site run types:check
```

同时验证：

- `npm pack --dry-run` 或包清单检查中不包含 site、playground、tests、performance 和 openspec。
- 中文和英文 README 的最小代码通过类型检查。
- 站点无失效内部链接、重复 canonical 和孤立页面。
- sitemap、robots、favicon、manifest、OG 图片和语言切换在静态产物中存在。
- 正式域名与 GitHub Pages 子路径两种构建配置不产生错误资源路径。
- 搜索和不可用本地运行入口不再出现在桌面端与移动端。
- 首页指标均能追溯到审核后的基线或 size-limit 输出。

## 13. 验收标准

- README 中英文结构一致，首屏包含有效徽章、主视觉、3～4 条核心价值和可运行代码。
- 官网主导航严格收敛为七组，学习路径连续且无重复正文。
- API 文档只呈现包根公开能力，并标识 deprecated / experimental 状态。
- Examples 按 API 概念分组，所有公开示例可运行、可查看源码。
- 技术指标可复现，环境、版本和适用条件完整，无失效命令。
- 兼容性独立成组，覆盖浏览器、ESM、迁移和 API 稳定性边界。
- 中文 / 英文路由、canonical、hreflang、sitemap、robots 和 favicon 完整。
- 无不可用搜索、本地运行入口和站点模板残留。
- 首页信息密度、最大宽度、按钮、卡片和明暗主题一致。
- 全部工程验证通过，发布包清单未扩大。

## 14. 明确不在本阶段实施的内容

- AI 单页。
- Codex / Agent Skill。
- 新的核心图引擎 API、布局、交互、渲染能力或 Benchmark 算法。
- 与 P5 无关的工具链重构。
- npm publish、git commit、push 或正式发布操作。

AI 单页和 Skill 在基础使用链路、文档信息架构、中英文内容和公开指标稳定后另立方案。

## 15. 待确认项

若无额外调整，实施将采用以下推荐默认值：

- 品牌使用 `G6-GL`，`G6Lite` 仅作为仓库名。
- 正式 canonical 域名使用 `https://g6-gl.antv.vision`。
- 中文默认、英文 `/en`。
- 以 `guides/` 为唯一配置指南正文，稳定版前直接清理重复旧路由。
- P5 分五个实施批次交付，每批均独立验证和记录变更。

## 16. 当前实施结论

- P5.0～P5.4 已完成实施和验证。
- 中文默认首页已回退到 P5 前视觉版本，仅修正失效文档链接和动态版本号。
- P5.5 不计入本轮完成验收，等待 `homepage-optimization.md` 确认。
- P5 前没有英文首页，`/en` 暂保留已完成的英文基础页；中英文首页视觉统一纳入 P5.5。
