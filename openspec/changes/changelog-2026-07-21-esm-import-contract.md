# ESM 构建与 import 契约

## 变更内容

- 正式确定 G6-GL 当前发布形态为 ESM-only。
- TypeScript 的 `module` 和 `moduleResolution` 改为 `NodeNext`。
- 源码相对 import 继续使用显式 `.js` 后缀。
- 构建前清理 `dist`，避免陈旧文件进入发布包。
- 库构建后增加 Node 原生 ESM 导入及运行时根出口检查。
- 新增 NodeNext、bundler、Vite Worker 和 npm pack manifest 消费检查。
- 本决策取代 `pre-stable-api-rebaseline` 中的 ESM/CJS 双产物要求。

## 原因

当前构建由 TypeScript 直接输出 ESM，Worker 依赖 `import.meta.url`。移除 `.js` 后缀会导致 Node 原生 ESM 无法解析生成文件。

扩展 registry、Node/Edge/Label/Decoration 缓存均为模块级状态。如果同时发布 ESM 和 CJS 两份物理实现，同一应用混用 `import` 与 `require` 时会产生两个 registry，出现扩展已注册但 Graph 无法找到的问题。因此在没有明确 CJS 消费需求和单例桥接设计前，不发布双产物。

## 影响

- 现有 ESM 消费方式不变。
- `.js` import 后缀不是待清理噪音，而是发布产物解析契约的一部分。
- CJS 支持延后为独立需求，不在本次 P1 中机械加入。
