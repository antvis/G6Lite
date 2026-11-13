# Vue 接入 (/docs/getting-started/vue)





## 在 Vue 中使用 [#在-vue-中使用]

在页面中引入 `GraphView` 组件。

```vue
<script setup lang="ts">
import GraphView from './GraphView.vue';
</script>

<template>
  <GraphView />
</template>
```

<span id="准备两组数据" style="{ display: 'block', scrollMarginTop: '8rem' }" />

<span id="vue用-watch-同步数据" style="{ display: 'block', scrollMarginTop: '8rem' }" />

### 定义 GraphView [#定义-graphview]

将下面的代码保存为 `GraphView.vue`。组件挂载后创建图，切换数据时调用 `setData()`，卸载时销毁实例。

```vue
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { Graph, type GraphData } from '@antv/g6-lite';

const basicData: GraphData = {
  nodes: [{ id: 'Alice' }, { id: 'Bob' }, { id: 'Carol' }],
  edges: [
    { source: 'Alice', target: 'Bob' },
    { source: 'Alice', target: 'Carol' },
  ],
};

const expandedData: GraphData = {
  nodes: [...basicData.nodes, { id: 'David' }],
  edges: [...basicData.edges, { source: 'Bob', target: 'David' }],
};

const fitView = { padding: 32, maxZoom: 1 };
const containerRef = ref<HTMLDivElement | null>(null);
const ready = ref(false);
let graph: Graph | undefined;

onMounted(async () => {
  if (!containerRef.value) return;

  const instance = new Graph({
    container: containerRef.value,
    data: basicData,
    layout: { type: 'circular', radius: 120 },
    node: { style: { size: 24, label: (node) => node.id, labelPlacement: 'bottom' } },
    edge: { style: { endArrow: true } },
    autoFit: fitView,
    behaviors: ['zoom-canvas', 'drag-canvas', 'drag-node', 'hover-highlight'],
  });
  graph = instance;

  try {
    await instance.render();
    if (!instance.destroyed) ready.value = true;
  } catch (error) {
    if (!instance.destroyed) {
      instance.destroy();
      console.error(error);
    }
  }
});

onBeforeUnmount(() => graph?.destroy());

async function changeData(event: Event) {
  const instance = graph;
  if (!ready.value || !instance || instance.destroyed) return;

  const { value } = event.target as HTMLSelectElement;
  const data = value === 'expanded' ? expandedData : basicData;
  try {
    await instance.setData(data, { fitView });
  } catch (error) {
    if (!instance.destroyed) console.error(error);
  }
}
</script>

<template>
  <div>
    <select aria-label="关系图数据" :disabled="!ready" @change="changeData">
      <option value="basic">基础关系</option>
      <option value="expanded">扩展关系</option>
    </select>
    <div ref="containerRef" style="width: 100%; height: 360px" />
  </div>
</template>
```

## 运行效果 [#数据变化时更新图]

选择「扩展关系」会添加 David 节点和 Bob → David 连线。切回「基础关系」即可恢复。

<QuickStartExample locale="zh" variant="framework-data" />
