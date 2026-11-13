# React 接入 (/docs/getting-started/react)





## 在 React 中使用 [#在-react-中使用]

在页面中引入 `GraphView` 组件。

```tsx
import GraphView from './GraphView';

export default function App() {
  return <GraphView />;
}
```

<span id="准备两组数据" style="{ display: 'block', scrollMarginTop: '8rem' }" />

<span id="react响应数据依赖变化" style="{ display: 'block', scrollMarginTop: '8rem' }" />

### 定义 GraphView [#定义-graphview]

将下面的代码保存为 `GraphView.tsx`。组件挂载后创建图，切换数据时调用 `setData()`，卸载时销毁实例。

```tsx
'use client';

import { useEffect, useRef, useState } from 'react';
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

export default function GraphView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Graph | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const graph = new Graph({
      container: containerRef.current,
      data: basicData,
      layout: { type: 'circular', radius: 120 },
      node: { style: { size: 24, label: (node) => node.id, labelPlacement: 'bottom' } },
      edge: { style: { endArrow: true } },
      autoFit: fitView,
      behaviors: ['zoom-canvas', 'drag-canvas', 'drag-node', 'hover-highlight'],
    });

    graph.render().then(() => {
      if (graph.destroyed) return;
      graphRef.current = graph;
      setReady(true);
    }).catch((error) => {
      if (!graph.destroyed) {
        graph.destroy();
        console.error(error);
      }
    });

    return () => {
      graphRef.current = null;
      graph.destroy();
    };
  }, []);

  async function changeData(data: GraphData) {
    const graph = graphRef.current;
    if (!graph) return;
    try {
      await graph.setData(data, { fitView });
    } catch (error) {
      if (!graph.destroyed) console.error(error);
    }
  }

  return (
    <div>
      <select
        aria-label="关系图数据"
        defaultValue="basic"
        disabled={!ready}
        onChange={(event) => void changeData(event.target.value === 'expanded' ? expandedData : basicData)}
      >
        <option value="basic">基础关系</option>
        <option value="expanded">扩展关系</option>
      </select>
      <div ref={containerRef} style={{ width: '100%', height: 360 }} />
    </div>
  );
}
```

## 运行效果 [#数据变化时更新图]

选择「扩展关系」会添加 David 节点和 Bob → David 连线。切回「基础关系」即可恢复。

<QuickStartExample locale="zh" variant="framework-data" />

<span id="在-vue-中使用" style="{ display: 'block', scrollMarginTop: '8rem' }" />

<span id="vue用-watch-同步数据" style="{ display: 'block', scrollMarginTop: '8rem' }" />
