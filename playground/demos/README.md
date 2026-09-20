# G6Lite Playground Demos

本目录保存 Playground 的可运行案例。案例 ID、名称、分类、覆盖能力、截图策略、发布检查级别和官网选择统一定义在 [`catalog.json`](./catalog.json)，不要在 README、截图脚本或官网中再次维护独立名单。

## 运行

```bash
npm install
npm run dev
```

默认地址为 `http://localhost:5173`。使用 hash 可以直接打开案例，例如：

```text
http://localhost:5173/#fishbone
```

开发服务器直接加载 `src/`，修改核心源码或 demo 后由 Vite 即时刷新。切换案例和 HMR 更新时，Playground 会先调用当前案例的 `destroy()`。

## 案例类型

- `functional`：公开能力和常规使用路径。
- `regression`：历史缺陷或竞态的浏览器回归步骤。
- `scenario`：流程图、思维导图等完整场景。
- `performance`：合成数据与浏览器性能入口。
- `dataset`：真实数据集验证。

官网 Examples 只消费 catalog 中 `audiences` 包含 `site` 的案例。性能入口复用 `tests/perf/browser`，不在 Playground 维护第二套测量逻辑。

## 新增案例

1. 新建 `playground/demos/<demo-id>.ts` 并导出异步 `run(container)`。
2. `run` 返回带 `destroy()` 的对象，释放 Graph、RAF、Observer、timer、监听器和附加 DOM。
3. 在 `catalog.json` 新增一条元数据，声明分类、能力覆盖、发布检查和截图策略。
4. 运行：

```bash
npx vite build
node scripts/check-examples.mjs --profile smoke
```

Registry 使用 `import.meta.glob` 按需加载模块和 raw source，无需再增加手工 import。
