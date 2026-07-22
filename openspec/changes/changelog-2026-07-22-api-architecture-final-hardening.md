# P1 API 与技术架构最终收口

## 变更内容

- 修复 Graph `render()`、`setData()`、`layout()` 的 generation 重入与销毁竞态，并在浏览器让帧、扩展初始化和布局 await 后重新校验当前代次。
- 修复 Combo 删除节点/边后的 membership 与结构性 hidden ownership 清理；空 Combo 折叠/展开使用 draw-only 刷新。
- Worker 布局改为请求级隔离，单个 Graph 的取消不会终止其他 Graph 的布局。
- Label renderer 在销毁后阻止 pending 图片回调继续写缓存或触发 redraw。
- ExtensionContext 返回只读节点/边快照并公开对应类型；legacy plain object 递归克隆 enumerable 状态，零参数 class instance 重新构造。
- Node/Edge 的 `getStyle`、Node 的 `drawOverlay` 与 `getBoundaryAnchor` 进入统一错误隔离。
- Layout runtime 暴露只读 options，明确 Graph 管理与独立 `runLayout()` 的生命周期差异，并在异步阶段检查 AbortSignal。
- 构建和 CI 补齐完整声明、NodeNext、bundler、Vite Worker、npm pack 与包根出口验证；初始化 Changesets beta prerelease 流程。
- 发布 sourcemap 内联源码内容，避免 npm 包只包含 `dist` 时映射到缺失的仓库 `src/`。

## 原因

P1 主体边界已经建立，但最终审查仍发现重入取消、Combo 隐藏引用、异步图片回调、legacy 扩展实例和布局上下文语义等边界情况。若不在 API 冻结前收口，这些问题会直接影响测试、示例、README、官网和后续扩展实现。

## 影响

- `new Graph(options)`、现有 Graph 方法名和 ESM-only 消费方式不变。
- 核心有状态模块继续使用 class；用户扩展仍以 function/factory/config 为推荐范式。
- 新增有状态扩展应使用 `extensionFactory()`；对象和 constructor 注册只作为 beta 兼容层。
- Layout、Transform 与 ExtensionContext 的当前数据语义更明确，取消后的旧结果不会覆盖新渲染代次。
- 本次未提交、未推送代码，等待完整终检后由维护者决定提交方式。
