# Use with React and Vue (/en/docs/getting-started/react)



Integrate G6Lite with React or Vue 3 by passing a real DOM element through a ref, creating the graph after mounting, and destroying it on unmount. The sections below cover components and data updates for each framework.

## Install dependencies [#install-dependencies]

Install G6Lite in an existing React or Vue 3 project:

```bash
npm install @antv/g6-lite
```

## Use with React [#use-with-react]

Create the instance in an effect and keep refs to the DOM element, graph instance, and first render Promise.

### Mount the graph [#mount-the-graph]

Save this component as `GraphView.tsx`. Refs keep the instance and its first render Promise available for later updates.

```tsx
import { Graph } from '@antv/g6-lite';
import { useEffect, useRef } from 'react';

export function GraphView() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const graphRef = useRef<Graph | null>(null);
  const renderRef = useRef<Promise<void> | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const graph = new Graph({
      container: containerRef.current,
      data: {
        nodes: [{ id: 'a' }, { id: 'b' }],
        edges: [{ source: 'a', target: 'b' }],
      },
      layout: { type: 'circular', radius: 120 },
      autoFit: { padding: 24, maxZoom: 1.5 },
      behaviors: ['zoom-canvas', 'drag-canvas', 'drag-node'],
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

### Update graph data [#update-graph-data]

To accept data through props, add a `data: GraphData` parameter to the component above, import the `GraphData` type from the package root, and add this effect after the mounting effect. Wait for the first `render()` to complete before calling `setData()`:

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

Pass a new data object to trigger updates. For fetched data, start with `{ nodes: [], edges: [] }` and update props when the request completes. Keep `data` out of the effect that creates the instance so data changes reuse the graph.

Use incremental APIs such as `setItemState()`, `hideItem()`, and `showItem()` for highlighting, selection, or visibility changes. See [data configuration](/en/docs/guides/data).

## Use with Vue [#use-with-vue]

In Vue 3, use a template ref to access the DOM container, create `Graph` in `onMounted`, and destroy it in `onBeforeUnmount`. This guide uses the Composition API and `<script setup lang="ts">`.

### Mount the graph [#mount-the-graph-1]

Save this single-file component as `GraphView.vue`, then import and use `<GraphView />` in a parent component:

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

Template refs become available after mounting. Store the `Graph` instance in a plain variable to avoid deep reactive proxies. Use `shallowRef` if the instance itself must be reactive. See [Vue template refs](https://vuejs.org/guide/essentials/template-refs) and [shallow reactivity](https://vuejs.org/api/reactivity-advanced.html#shallowref).

### Update graph data [#update-graph-data-1]

For data supplied through props, add these imports, declarations, and watcher inside `<script setup>`. Replace the initial data configuration with `data: props.data`, then reuse the instance as props change:

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

This watcher observes replacement of the data object. Pass a new object from the parent. For changes to nodes or edges within the same object, use incremental graph APIs or create a new object. Large graph datasets usually do not need a deep watcher.

Wait for the first `render()` to complete so updates during initialization are applied. For fetched data, start with `{ nodes: [], edges: [] }` and update props when the request completes. See [data configuration](/en/docs/guides/data).

## Handle container resizing [#handle-container-resizing]

Give the container explicit dimensions. Setting only `width: 100%` is insufficient. The example uses a height of `480`; flexible layouts can set a height or `min-height` through CSS.

G6Lite uses `ResizeObserver` to synchronize canvas dimensions and preserves the current camera by default. The example's `autoFit` option fits the graph after a resize while controlling padding and maximum zoom. See [Graph lifecycle](/en/docs/concepts/graph-lifecycle#container-resize).

The Vue example uses an inline height of `480px`. Percentage heights require a parent with a defined height. For hidden tabs or dialogs, create the instance once the container is visible and has a real size.

## Clean up on unmount [#clean-up-on-unmount]

### React [#react]

Call `graph.destroy()` in the effect cleanup to release the canvas, event listeners, observers, and layout tasks, then clear the stored refs.

React Strict Mode runs an extra effect setup and cleanup cycle during development. Pair each creation with cleanup to avoid leftover canvases and listeners. See [React's effect cleanup guidance](https://react.dev/reference/react/useEffect#my-effect-runs-twice-when-the-component-mounts).

### Vue [#vue]

Call `graph.destroy()` in `onBeforeUnmount` to release the canvas, event listeners, observers, and layout tasks, then clear the instance reference. Vue stops watchers created synchronously during setup when the component unmounts; the cleanup callback also prevents pending updates from starting. See [Vue lifecycle hooks](https://vuejs.org/api/composition-api-lifecycle#onbeforeunmount).

## Next steps [#next-steps]

* [Understand the Graph lifecycle](/en/docs/concepts/graph-lifecycle)
* [Configure interactions](/en/docs/guides/interactions)
* [Browse complete examples](/en/docs/examples)
