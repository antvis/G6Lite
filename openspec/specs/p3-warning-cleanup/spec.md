# P3 CI 与类型告警清理方案

> 状态：已确认并实施
>
> 日期：2026-07-23
>
> 目标：清理 PR #14 暴露的 ESLint 与官方 GitHub Actions 运行时告警，不改变核心运行时行为和公开 API 语义。

## 1. 背景

当前 `quality` 检查虽然成功，但本地完整执行 `npm run lint` 的结果为 0 error、198 warning：

- `src/`：36 条。
- `tests/`：162 条。
- `@typescript-eslint/no-explicit-any`：191 条。
- `@typescript-eslint/no-unused-vars`：7 条。

GitHub Actions 只将首批 ESLint 告警显示为 PR annotation，因此当前页面上的 4 条
`src/graph.ts` 告警并不代表全部问题。只修截图中的 4 行会继续暴露后续告警。

此外，仓库工作流仍使用 `actions/checkout@v4` 与 `actions/setup-node@v4`，其 Node.js 20
Action runtime 已产生弃用告警。

## 2. 范围与约束

本轮包含：

- 清理当前 lint 命令覆盖范围内的全部 198 条告警。
- 保持 `@typescript-eslint/no-explicit-any` 和 `no-unused-vars` 规则启用，不通过关闭规则、
  排除文件、增加全局 disable 或只隐藏输出的方式消警。
- 调整内部类型边界、测试夹具和断言类型，但不改变运行时逻辑、测试语义、覆盖率门槛与包体积门槛。
- 将仓库内官方 `actions/checkout`、`actions/setup-node`、`actions/upload-artifact` 升级到当前
  Node.js 24 runtime 的稳定版本，并覆盖 CI、Benchmark、Preview、Release 工作流。

本轮不包含：

- 不改变事件名称、事件参数的运行时结构或调用时序。
- 不调整 ESLint 严格度和 CI 通过标准。
- 不替换 `afc163/surge-preview`。其最新 `v1.13.0` 仍声明 `node20`，如需彻底消除该第三方
  Action runtime 告警，需要改为自建 Surge 部署与 PR 评论流程，单独评估。
- 不顺带重构布局、渲染、调度算法。

## 3. 类型清理方案

### 3.1 事件系统

`Handler` 是 PR #14 新增的根导出类型，当前仍使用 `any[]`。在合入前改为显式参数元组泛型：

```ts
export type Handler<Args extends unknown[]> = (...args: Args) => void;
```

`EventEmitter.on/off/once/emit` 与 `Graph.on/off/once` 使用同一泛型参数推导。内部事件容器使用
私有的擦除后 handler 类型，并仅在事件派发边界做受控类型转换。这样可以：

- 保留任意动态事件名称。
- 允许调用方从具体回调参数自动推导类型。
- 不把 `any` 暴露到新公开类型中。
- 不改变事件运行时行为。

增加类型测试，覆盖无参数事件、单 payload 事件、once/off 和错误参数调用。

### 3.2 Graph、DataModel 与 Renderer 数据边界

- `DataModel.replaceData` 使用现有 `LayoutNode[]` 与 `GraphEdge[]`（或等价的命名输入类型），
  替代 `nodes as any[]`、`edges as any[]`。
- `RendererData`、`InternalNode`、`InternalEdge` 之间使用结构化类型转换，不再通过 `any[]`
  传递。
- `Graph.setData()` 与 `Graph.layout()` 的两处重复数据替换路径使用同一类型安全入口。
- 保持数组引用复用和现有零拷贝路径，不引入额外 map/copy。

### 3.3 Behavior 配置

- 为 `hover-highlight`、`click-select`、`tooltip` 等内置 Behavior 建立名称到配置类型的映射。
- `BEHAVIORS` 的 factory 在注册处完成类型收窄，不再使用 `config as any`。
- 扩展 Behavior 继续接收开放的 `Record<string, unknown>` 配置，不限制第三方扩展字段。

### 3.4 Layout、Scheduler、Renderer 与 Routing

- Worker 消息数据使用 `GraphNode`、`GraphEdge`、布局节点和最小布局实例接口替代 `any`。
- `runLayout` 使用现有 `GraphData`/布局类型表达补齐坐标后的节点。
- Scheduler 到 Renderer 的数据传递对齐 `RendererData`，不改变刷新级别或调度策略。
- Renderer 中仅按实际需要声明带 `id` 的边类型、WebGL 参数类型和回调参数类型。
- 删除真正未使用的变量；为必须保留的接口参数使用 `_` 前缀并确认调用约定不变。

## 4. 测试告警清理

测试中的 162 条告警主要来自访问私有测试入口、构造局部 DOM/WebGL mock 和故意传入异常数据。
处理原则：

- 为重复的私有入口访问建立局部测试 harness 类型，不使用散落的 `as any`。
- DOM/WebGL mock 使用 `Pick`、`Partial`、`ReturnType` 或最小结构接口。
- 故意传入非法数据时，先声明为 `unknown`，再在测试边界转换到目标类型，明确表达该测试正在
  绕过静态约束。
- 删除未使用的测试变量，不删除断言或测试用例。
- 不在 tests 目录关闭 `no-explicit-any`。

## 5. GitHub Actions

- 将所有 `actions/checkout@v4`、`actions/setup-node@v4` 和 `actions/upload-artifact@v4`
  升级到 Node.js 24 runtime 版本。
- 保持项目测试矩阵中的 Node.js 20/22 不变；Action 自身运行时与被测试的 Node 版本是两件事。
- Preview 继续保留 `checks: read`、`contents: read`、`pull-requests: write` 最小权限。
- 重新验证 Surge 部署评论为 Ready，避免只检查 job conclusion。

## 6. 验收标准

- `npm run lint`：0 error、0 warning。
- `npm run typecheck`：通过。
- `npm test -- --coverage`：测试数量不减少，覆盖率门槛不降低。
- `npm run build`、`npm run size`、`npm run build:playground`、`npm run site:build`：通过。
- `npm pack --dry-run --json`：发布内容仍只包含预期的 `dist/`、`src/` 与包元数据。
- 不生成或提交任何 `package-lock.json`。
- PR #14 的 quality、test、build、benchmark、preview 全部通过。
- 官方 Actions 不再产生 Node.js 20 runtime 弃用告警；第三方 Surge Action 的已知告警单独记录。

## 7. 风险控制

- 事件 handler 类型是新公开类型，必须通过 package consumer type-test 验证常用订阅方式。
- 批量测试类型清理只允许修改类型表达和夹具，不改测试断言含义。
- 每完成一个责任域先执行对应测试，最后再跑完整 CI，避免一次性机械替换掩盖类型错误。
- 若某个 `any` 是外部库缺失类型造成的真实边界，使用最小局部接口或单行带原因的 ESLint
  例外，不扩大为文件级或目录级豁免。
