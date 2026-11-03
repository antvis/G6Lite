# G6Lite Examples

本目录保存官网可运行的示例。案例 ID、名称、分类、覆盖能力、截图策略和官网可见性统一定义在 [`catalog.json`](./catalog.json)，不要在 README 或其他文档中再次维护独立名单。

## 运行

示例由文档站点直接渲染，不需要单独的服务：

```bash
npm install
npm --prefix site install
npm run dev
```

打开 `http://localhost:3000/docs/examples` 选择案例，单个案例地址形如 `http://localhost:3000/docs/examples/<demo-id>`。

示例源码通过 `@antv/g6-lite` 引用仓库的 `src/`，修改核心源码或示例后由 Next.js 热更新。

## 案例类型

- `functional`：公开能力和常规使用路径。
- `regression`：历史缺陷或竞态的浏览器回归步骤。
- `scenario`：流程图、思维导图等完整场景。
- `performance`：合成数据与浏览器性能入口。
- `dataset`：真实数据集验证。

官网 Examples 只消费 catalog 中 `audiences` 包含 `site` 的案例。

## 新增案例

1. 新建 `site/demos/<demo-id>.ts` 并导出异步 `run(container)`。
2. `run` 返回带 `destroy()` 的对象，释放 Graph、RAF、Observer、timer、监听器和附加 DOM。
3. 在 `catalog.json` 新增一条元数据，声明分类、能力覆盖和截图策略。
4. 在 `site/src/lib/example-runtime.ts` 的 `loaders` 中注册该案例的模块路径。
5. `audiences` 含 `site` 时，还需要补齐 `site/content/docs/zh/examples/<demo-id>.mdx`、`site/content/docs/en/examples/<demo-id>.mdx` 和 `site/public/examples/<demo-id>.png`。
