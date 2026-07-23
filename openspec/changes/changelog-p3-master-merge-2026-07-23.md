# P3 合并远端 master 冲突处理（2026-07-23）

## 变更内容

- 合并 `origin/master` 的最新提交，包括 GitHub About 清理和站点部署工作流。
- 保留 P3 已验证的 `ci.yml`，不引入引用已删除 `test:cov` 脚本的重复 `build.yml`。
- 保留统一的 `benchmark.yml`，继续覆盖 PR 快速基准、手动运行和定时完整基准；删除重复的 `performance.yml`。
- 保留现有 release 驱动、带版本校验和 dry-run 的发布流程；不引入 tag push 直接发布的重复 `publish.yml`。
- 接受 `master` 对 `CODE_OF_CONDUCT.md`、Issue Template 和 PR Template 的删除。
- 保留新增的站点部署工作流，并统一使用 Actions v7、无 lockfile 安装方式和根 `site:build` 入口。

## 原因

远端 `master` 与 P3 分支同时调整了工作流和治理文件，GitHub 无法自动合并。直接保留双方文件会产生重复 CI、重复发布入口和失效脚本引用，因此按已确认的 P3 方案统一职责并消除重复。

## 影响

- PR 合并冲突消除后，质量检查、测试、构建、Benchmark、预览、站点部署和发布仍各有唯一入口。
- 站点部署会安装根目录与 `site/` 依赖，并在部署前生成 TypeDoc API 文档。
- 不改变核心库运行时 API 或 npm 包文件清单。

## 验证

- `npm run ci`：通过，25 个测试文件、394 项测试通过，size-limit 为 115.49 kB / 120 kB。
- `npm run site:build`：通过，生成 147 个静态页面。
- 全部 `.github/workflows/*.yml` YAML 解析通过。
- `git diff --cached --check`：通过。
