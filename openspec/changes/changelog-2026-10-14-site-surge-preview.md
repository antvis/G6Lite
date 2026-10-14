# 网站 Surge 预览 — 2026-10-14

## 变更内容

- Pull Request 修改网站、源码或 Playground 时，构建静态网站并使用 Surge 发布预览。
- 网站与 Playground 预览共用按 PR 编号区分的 concurrency group，同一 PR 新运行会取消旧运行。
- 网站预览复用已有的 `SURGE_TOKEN` 和 `GITHUB_TOKEN`。

## 变更原因

为网站改动提供 Pull Request 预览，便于在合并前检查静态导出效果。

## 影响

- 扩展现有 `.github/workflows/preview.yml`，原有 Playground 预览保持不变。
- 网站预览产物来自 `npm run site` 生成的 `site/out`。
