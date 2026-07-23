# P3 CI 与类型告警清理实施记录

> 日期：2026-07-23
> 类型：工程治理与类型安全
> 状态：已完成

## 变更内容

- 将完整 ESLint 结果从 0 error、198 warning 收敛为 0 error、0 warning。
- 使用参数元组泛型重构 `Handler`、`EventEmitter` 与 `Graph` 事件订阅签名，移除公开事件类型中的显式 `any`。
- 清理 Graph/DataModel、Behavior、Layout、Renderer、Scheduler 和 Routing 的类型边界与未使用变量。
- 使用局部测试 harness、最小结构接口和 `unknown` 边界替代测试及性能脚本中的 162 处显式 `any`，未关闭 lint 规则。
- 增加事件 handler 的 package public API 类型契约测试。
- 将官方 `actions/checkout`、`actions/setup-node`、`actions/upload-artifact` 升级至 v7，使用 Node.js 24 Action runtime。
- 保留 `afc163/surge-preview@v1`；其最新版本仍使用 Node.js 20 runtime，后续如需消除该第三方告警需单独替换部署流程。

## 原因与影响

- GitHub 只展示首批 ESLint annotations，原页面上的少量告警掩盖了实际 198 条类型与未使用变量告警。
- 类型清理后，CI 页面不再因仓库代码产生黄色 lint annotation，且不通过降低规则严格度换取通过。
- 事件名称、payload 运行时结构、渲染与布局行为保持不变。
- npm 发布内容仍包含 `dist/` 与 `src/`，不包含测试、性能工具、Playground 或内部方案。

## 验证结果

- `npm run lint`：通过，0 error、0 warning。
- `npm run typecheck`：通过，包括公开 API 与性能脚本类型检查。
- `npm test -- --coverage`：25 个测试文件、394 项测试全部通过，覆盖率门槛通过。
- `npm run build`：通过。
- `npm run size`：通过，115.49 kB / 120 kB。
- `npm run build:playground`：通过，627 个模块完成构建。
- `npm run site:build`：通过，147 个静态页面生成完成。
- `npm pack --dry-run --json`：通过，共 403 个文件；包含 `dist/index.js`、`dist/index.d.ts`、`src/index.ts`，无非预期目录。
- GitHub Actions workflow YAML：解析通过。
- 未生成根目录或 `site/` 的 `package-lock.json`。

## 已知非阻断输出

- 本地上级 `/Users/pearl/Develop/tsconfig.json` 引用缺失的 `.umi` 配置，测试与构建仍会输出既有 warning。
- `@antv/layout` 发布包的部分 sourcemap 指向缺失源码，Vitest 会输出既有 warning。
- `afc163/surge-preview@v1.13.0` 仍声明 Node.js 20 Action runtime，未在本轮替换第三方部署 Action。
