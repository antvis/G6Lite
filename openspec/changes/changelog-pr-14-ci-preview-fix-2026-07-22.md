# PR #14 CI 与预览部署修复记录

> 日期：2026-07-22
> 类型：工程治理修复
> 状态：已完成

## 变更内容

- 将 Prettier 固定为 `3.9.6`，避免不提交 lock 文件时因浮动版本导致本地与 CI 格式规则不一致。
- 按 Prettier `3.9.6` 的规则更新 4 个源码文件的格式。
- 为 Surge Preview 工作流补充 `checks: read` 权限，使预览 Action 可以读取提交检查结果，避免 GitHub API 返回 403。

## 原因与影响

- CI 全新安装解析到 Prettier `3.9.6`，而原版本范围 `^3.8.3` 无法保证格式检查可复现。
- `afc163/surge-preview@v1` 需要读取 check-runs；显式声明最小只读权限后，不再因权限不足误报部署失败。
- 变更不影响库的运行时行为和 npm 发布内容。

## 验证结果

- `npm run lint`：通过，0 error；保留 198 项既有 warning。
- `npm run ci`：通过，包括类型检查、394 项测试、覆盖率、构建和 size-limit。
- Preview workflow YAML：解析通过。
- `git diff --check`：通过。
- 未生成或提交 `package-lock.json`。
