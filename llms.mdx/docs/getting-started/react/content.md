# 在框架中使用 (/docs/getting-started/react)



G6Lite 可以直接集成到 React 和 Vue 3 中。通过框架的 ref 传入真实 DOM，在挂载后创建图实例，并在卸载时销毁。下面分别介绍两个框架的组件写法和数据更新方式。

## 安装依赖 [#安装依赖]

在已有 React 或 Vue 3 项目中安装 G6Lite：

```bash
npm install @antv/g6-lite
```

## 在 React 中使用 [#在-react-中使用]

在 `useEffect` 中创建实例，通过 `useRef` 保存 DOM、图实例和首次渲染的 Promise。

### 挂载图实例 [#挂载图实例]

下面的组件可保存为 `GraphView.tsx`。用 `useRef` 保存实例和首次渲染的 Promise，后续更新时可以复用同一个图。

```tsx
import { useEffect, useRef } from 'react';
import { Graph } from '@antv/g6-lite';

export function GraphView() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const graphRef = useRef<Graph | null>(null);
  const renderRef = useRef<Promise<void> | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const graph = new Graph({
      container: containerRef.current,
      data: {
        nodes: [
          { id: 'a', data: { label: 'A' } },
          { id: 'b', data: { label: 'B' } },
        ],
        edges: [{ source: 'a', target: 'b' }],
      },
      node: {
        style: {
          size: 18,
          label: (node) => (node.data?.label as string) ?? node.id,
          labelPlacement: 'bottom',
        },
      },
      edge: { style: { endArrow: true } },
      layout: { type: 'circular', radius: 120 },
      autoFit: { padding: 24, maxZoom: 1.5 },
      behaviors: ['zoom-canvas', 'drag-canvas', 'drag-node', 'click-select'],
    });

    graphRef.current = graph;
    const rendered = graph.render();
    renderRef.current = rendered;
    void rendered.catch(console.error);

    return () => {
      graph.destroy();
      graphRef.current = null;
      renderRef.current = null;
    };
  }, []);

  return <div ref={containerRef} style={{ width: '100%', height: 480 }} />;
}
```

### 更新图数据 [#更新图数据]

若数据来自 props，为上面的组件增加 `data: GraphData` 参数，从包根导入 `GraphData` 类型，并在挂载 effect 之后添加以下 effect。先等待首次 `render()` 完成，再调用 `setData()`：

```tsx
// import type { GraphData } from '@antv/g6-lite';
// export function GraphView({ data }: { data: GraphData }) { ... }
useEffect(() => {
  const graph = graphRef.current;
  const rendered = renderRef.current;
  if (!graph || !rendered) return;
  let cancelled = false;

  const update = async () => {
    await rendered;
    if (cancelled || graph.destroyed) return;
    await graph.setData(data);
  };
  void update().catch(console.error);

  return () => {
    cancelled = true;
  };
}, [data]);
```

用新的数据对象触发更新，避免在原对象上修改后继续传入同一个引用。数据来自请求时，可以先传入 `{ nodes: [], edges: [] }`，待请求完成后更新 props。不要把 `data` 加入创建实例的 effect 依赖，否则每次数据变化都会销毁并重建图。

如果只是高亮、选中或隐藏元素，优先使用 `setItemState()`、`hideItem()`、`showItem()` 等增量 API。更多方式见[数据配置](/docs/guides/data)。

## 在 Vue 中使用 [#在-vue-中使用]

在 Vue 3 中，通过模板 ref 获取真实 DOM，在 `onMounted` 中创建 `Graph`，并在 `onBeforeUnmount` 中销毁实例。以下示例使用 Composition API 和 `<script setup lang="ts">`。

### 挂载图实例 [#挂载图实例-1]

将下面的单文件组件保存为 `GraphView.vue`，在父组件中导入并使用 `<GraphView />`：

```vue
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { Graph } from '@antv/g6-lite';

const containerRef = ref<HTMLDivElement | null>(null);
let graph: Graph | undefined;
let rendered: Promise<void> | undefined;

onMounted(() => {
  if (!containerRef.value) return;

  graph = new Graph({
    container: containerRef.value,
    data: {
      nodes: [
        { id: 'a', data: { label: 'A' } },
        { id: 'b', data: { label: 'B' } },
      ],
      edges: [{ source: 'a', target: 'b' }],
    },
    node: {
      style: {
        size: 18,
        label: (node) => (node.data?.label as string) ?? node.id,
        labelPlacement: 'bottom',
      },
    },
    edge: { style: { endArrow: true } },
    layout: { type: 'circular', radius: 120 },
    autoFit: { padding: 24, maxZoom: 1.5 },
    behaviors: ['zoom-canvas', 'drag-canvas', 'drag-node', 'click-select'],
  });

  rendered = graph.render();
  void rendered.catch(console.error);
});

onBeforeUnmount(() => {
  graph?.destroy();
  graph = undefined;
  rendered = undefined;
});
</script>

<template>
  <div ref="containerRef" style="width: 100%; height: 480px" />
</template>
```

模板 ref 在挂载后才可用。`Graph` 实例保存在普通变量中，避免被 Vue 深度响应式代理；如需响应式保存实例，可以使用 `shallowRef`。参见 [Vue 模板 ref](https://vuejs.org/guide/essentials/template-refs) 和[浅层响应式 API](https://vuejs.org/api/reactivity-advanced.html#shallowref)。

### 更新图数据 [#更新图数据-1]

若数据来自 props，在上面的 `<script setup>` 中增加以下导入和声明，再添加 `watch`。首次挂载的数据改为 `data: props.data`，后续替换 props 时复用图实例：

```ts
import { watch } from 'vue';
import type { GraphData } from '@antv/g6-lite';

const props = defineProps<{ data: GraphData }>();

watch(
  () => props.data,
  async (data, _previous, onCleanup) => {
    const current = graph;
    const ready = rendered;
    if (!current || !ready) return;
    let cancelled = false;
    onCleanup(() => {
      cancelled = true;
    });

    try {
      await ready;
      if (cancelled || current.destroyed) return;
      await current.setData(data);
    } catch (error) {
      console.error(error);
    }
  },
);
```

这个 watcher 监听数据对象的替换。父组件应传入新的对象；如果直接修改原对象的节点或边，优先调用增量 API，或生成新对象后再传入。通常不必对大规模图数据使用深度监听。

先等待首次 `render()` 完成，避免初始化期间的更新被忽略。数据来自请求时，可以先传入 `{ nodes: [], edges: [] }`，再更新 props。更多方式见[数据配置](/docs/guides/data)。

## 适配容器尺寸 [#适配容器尺寸]

容器必须有明确宽高，只有 `width: 100%` 不够。上面的示例使用固定高度 `480`；在弹性布局中，也可以用 CSS 设置高度或 `min-height`。

G6Lite 通过 `ResizeObserver` 同步 canvas 尺寸，默认保留用户当前的缩放和平移。示例中的 `autoFit` 会在尺寸变化时重新适配图，并限制 padding 和最大缩放。配置详情见[Graph 生命周期](/docs/concepts/graph-lifecycle#容器尺寸变化)。

Vue 示例使用内联样式设置 `480px` 高度。使用百分比高度时，父容器也需要确定的高度。图组件放在隐藏页签或弹窗中时，建议在容器显示且尺寸确定后再创建实例。

## 卸载与清理 [#卸载与清理]

### React [#react]

在 effect 的 cleanup 中调用 `graph.destroy()`，释放 canvas、事件监听、观察器和布局任务，同时清空保存的引用。

React Strict Mode 在开发环境会额外执行一次 effect 的创建与清理。保留 cleanup，让每次创建都对应一次销毁，避免残留画布或事件监听。参见 [React 的 effect 清理说明](https://react.dev/reference/react/useEffect#my-effect-runs-twice-when-the-component-mounts)。

### Vue [#vue]

在 `onBeforeUnmount` 中调用 `graph.destroy()`，释放 canvas、事件监听、观察器和布局任务，并清空实例引用。Vue 会在组件卸载时停止同步创建的 watcher；示例中的清理回调也会阻止尚未开始的数据更新。参见 [Vue 生命周期钩子](https://vuejs.org/api/composition-api-lifecycle#onbeforeunmount)。

## 下一步 [#下一步]

* [理解 Graph 生命周期](/docs/concepts/graph-lifecycle)
* [配置交互行为](/docs/guides/interactions)
* [查看完整示例](/docs/examples)
