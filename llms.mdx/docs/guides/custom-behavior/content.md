# 自定义交互 (/docs/guides/custom-behavior)





自定义交互可以把业务操作封装起来。例如，点击节点时只激活当前节点，点击空白时清除激活状态。示例中的 A 原有的选中状态会保留。

## 公共类型范式 [#公共类型范式]

为名称声明字面量 type，为业务选项声明独立类型；在激活处用 satisfies 检查。完整泛型、事件映射和生命周期签名统一见 [Behavior 契约](/docs/api/options#自定义交互契约)。

## 推荐文件与导出 [#推荐文件与导出]

可复用模块导出行为名称、options 类型和显式注册函数；应用在创建 Graph 前注册。使用包或业务前缀，避免覆盖全局注册表中的其他名称。不要依赖导入副作用决定注册顺序。

## 完整实现 [#完整实现]

事件处理函数写在 `getEvents()` 的返回值里。示例监听节点和画布的点击，通过 `context.state` 更新激活状态。



```ts
import {
  Graph, register,
  type BehaviorExtension, type BehaviorOptions, type ElementState, type ExtensionContext,
} from '@antv/g6-lite';

export const BUSINESS_SELECT = 'docs-business-select' as const;
export interface BusinessSelectOptions extends BehaviorOptions<typeof BUSINESS_SELECT> {
  state?: ElementState;
}

export function createBusinessSelect(): BehaviorExtension<BusinessSelectOptions> {
  let context: ExtensionContext | undefined;
  let state: ElementState = 'active';
  const select = (nodeId?: string) => {
    if (!context || context.isDestroyed()) return;
    const next: Record<string, ElementState[]> = {};
    for (const id of context.data.getNodeIds()) {
      const retained = context.state.get(id).filter((value) => value !== state);
      next[id] = id === nodeId ? [...retained, state] : retained;
    }
    context.state.setAll(next);
  };
  return {
    init(nextContext, options) { context = nextContext; state = options.state ?? 'active'; },
    getEvents() {
      return {
        'node:click': ({ nodeId, nativeEvent }) => {
          if (nativeEvent.button === 0) select(nodeId);
        },
        'canvas:click': () => select(),
      };
    },
    destroy() { context = undefined; },
  };
}

// #region registration
export function registerBusinessSelect() {
  register('behavior', BUSINESS_SELECT, () => createBusinessSelect());
}
// #endregion registration

export async function run(container: HTMLElement) {
  registerBusinessSelect();
  const graph = new Graph({
    container,
    data: {
      nodes: [
        { id: 'A', x: 0, y: 0, states: ['selected'] },
        { id: 'B', x: 160, y: 0 }, { id: 'C', x: 320, y: 0 },
      ],
      edges: [{ source: 'A', target: 'B' }, { source: 'B', target: 'C' }],
    },
    node: {
      style: { size: 32, label: (node) => node.id, labelOffsetY: 8 },
      stateStyles: { active: { fill: '#F08F56', stroke: '#914C1D', strokeWidth: 2 } },
    },
    behaviors: [{ type: BUSINESS_SELECT, state: 'active' } satisfies BusinessSelectOptions],
    autoFit: { padding: 56, maxZoom: 1 },
  });
  const status = document.createElement('div');
  status.style.cssText = 'position:absolute;left:12px;bottom:12px;z-index:20;background:white;color:#334155;padding:6px 10px;border-radius:6px;font:12px system-ui;';
  status.setAttribute('role', 'status');
  const updateStatus = () => {
    status.textContent = `active: ${graph.findNodesByState('active').join(', ') || 'none'} | selected: ${graph.findNodesByState('selected').join(', ') || 'none'}`;
  };
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => { status.remove(); destroy(); };
  try {
    await graph.render();
    graph.on('node:click', updateStatus);
    graph.on('canvas:click', updateStatus);
    updateStatus();
    container.append(status);
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}
```



## 注册并激活 [#注册并激活]

示例 run 中先调用 registerBusinessSelect，再创建 Graph，配置对象用 satisfies BusinessSelectOptions。字符串名称也可激活，init 收到的 options 会包含 type，缺省 state 使用 active。

多个 Graph 可以复用同一注册工厂；每个已挂载 Behavior 持有自己的 context 和 state。后注册同名定义不会替换已经挂载的实例，更换配置的边界见[挂载与更新](/docs/api/options#挂载与更新)。

## 事件类型 [#事件类型]

getEvents 的事件名从 GraphEventMap 推导参数元组。例如 node:click 的 nodeId、nativeEvent 都有类型；destroy 是零参数事件。需要扩展消费端事件类型时，可交叉组合：

```ts
import type { BehaviorExtension, BehaviorOptions, GraphEventMap } from '@antv/g6-lite';

interface BusinessEventMap {
  'business:reset': [payload: { source: 'toolbar' | 'shortcut' }];
}
type BusinessBehavior = BehaviorExtension<
  BehaviorOptions<'business-select'>,
  GraphEventMap & BusinessEventMap
>;
```

应用可用 `graph.emit('business:reset', { source: 'toolbar' })` 触发这个处理函数。需要在调用处校验载荷时，用模块扩充把业务事件加入 `GraphEventMap`。见[自定义事件示例](/docs/guides/events/custom)。

## 生命周期与清理 [#生命周期与清理]

引擎执行 create → init → getEvents，卸载时解绑事件并调用 destroy。[`setBehaviors()`](/docs/api/graph#setbehaviors) 和 `updateOptions({ behaviors })` 会销毁旧行为，再按新列表创建。即使名称相同，新配置也交给新实例的 init。Readonly options 是类型约束，运行时不保证冻结。

getEvents 返回的监听由引擎清理。自己创建的 window 监听、timer、Observer 和 DOM 要在 destroy 中清理。切换行为时 Graph 仍存活，异步任务需用行为自己的 AbortController 或卸载标记停止，并处理 Promise 拒绝。

## 在项目中使用 [#边界与覆盖规则]

自定义交互通过 `context.state` 修改元素状态，通过 `context.data.updateNode()` 或 `updateEdge()` 修改业务数据。注册时给交互取一个独立的名称，例如 `docs-business-select`，避免覆盖内置交互。 [扩展上下文 API](/docs/api/extensions#extensioncontext) · [注册规则](/docs/api/extensions#注册规则)

在上方示例中点击 B，再点击空白处。B 的 `active` 状态会先添加再清除，A 的 `selected` 状态始终保留。完整代码中的 `select()` 展示了如何只修改当前交互管理的状态。 [试用示例](#完整实现)

继续阅读：[交互总览](/docs/guides/behavior-overview) · [交互通用配置项](/docs/guides/behaviors) · [扩展体系](/docs/guides/extensions)。

**相关可运行示例**

* [注册自定义交互](/docs/examples/custom-behavior)
