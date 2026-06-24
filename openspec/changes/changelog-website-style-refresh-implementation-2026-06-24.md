# 官网样式美化实施变更记录

> 日期：2026-06-24
> 类型：官网视觉优化
> 关联方案：`openspec/specs/website-style-refresh/spec.md`

## 变更内容

- 参考 AntV Infographic 官网风格，重构官网首页首屏为白底大留白、玫红强调、轻演示卡片和真实布局缩略图区。
- 将原先的极光光斑、终端式首屏和旋转跑马灯弱化为更克制的产品官网表达。
- 移动端布局缩略图改为横向滚动，避免首屏过长和纵向堆叠。
- 功能卡片从 emoji 改为 `lucide-react` 图标，统一卡片、按钮、标签和数据面板视觉。
- 调整 `StatsBand`、代码块窗口和性能卡片样式，使其与首页整体风格一致。
- 更新全局品牌 token，引入玫红强调色，同时保留 AntV 蓝用于图可视化能力表达。

## 变更原因

用户确认以 `https://infographic.antv.vision/` 为参考，对 G6Lite 官网进行样式美化。目标是提升品牌质感，同时保持文档站清爽、克制、可扫描。

## 影响

- 影响范围集中在 `website/` 首页和全局样式，不涉及 `src/` 核心库代码。
- 官网浅色模式主强调色从蓝青转为玫红；文档链接和导航 hover 也会继承新的主色。
- 本地验证通过：
  - `npm --prefix website run lint`
  - `npm --prefix website run types:check`
  - `npm --prefix website run build`
- 构建仍存在项目既有 warning：根 `tsconfig` 引用 `./src/.umi/tsconfig.json` 不存在、Next.js workspace root 推断多个 lockfile。这些 warning 非本次改动引入。
