# Site Surge Preview

## 目标

为涉及网站内容或其依赖的 Pull Request 自动构建静态网站，并通过 Surge 发布预览链接；复用仓库现有的 `SURGE_TOKEN`。

## 方案

- 扩展 `.github/workflows/preview.yml`，保留 Playground 预览，并增加网站预览 job。
- 网站预览监听 `site/**`、`src/**` 及 Playground 相关变更。
- 安装根目录和 `site` 依赖后运行 `npm run site`，将 `site/out` 发布到 Surge。
- 网站预览复用 `secrets.SURGE_TOKEN`、`secrets.GITHUB_TOKEN` 和 `afc163/surge-preview@v1`。
- 在 workflow 级设置按 Pull Request 编号区分的 concurrency group，并取消同一 PR 较旧的运行。

## 验收标准

- 相关 Pull Request 变更会触发网站构建与 Surge 预览。
- Playground 预览行为保持不变。
- 网站和 Playground 预览复用同一个 workflow concurrency group 和 Surge secret。
- 网站构建失败时不会发布预览。
