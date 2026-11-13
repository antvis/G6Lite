# Selection and dragging (/en/docs/guides/events/selection-drag)





Clicking or brushing changes selected states; dragging changes positions. Try the interaction before connecting results to your application.

## Select and move nodes [#select-and-move-nodes]

Click to select, Shift-click to add, and drag empty space to brush. Dragging a selected node moves the selection. The status displays the final node set.



```ts
import { Graph, type BehaviorName, type BuiltInBehaviorConfig } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  // #region behavior-options
  const behaviors = [
    { type: 'zoom-canvas', minZoom: 0.5, maxZoom: 2 },
    'drag-node',
    { type: 'click-select', multiple: true, trigger: 'shift' },
    { type: 'brush-select', key: null },
  ] satisfies Array<BehaviorName | BuiltInBehaviorConfig>;
  // #endregion behavior-options
  const graph = new Graph({
    container,
    data: {
      nodes: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((id, i) => ({
        id, x: (i % 4) * 120, y: Math.floor(i / 4) * 100,
      })),
      edges: [{ id: 'A-B', source: 'A', target: 'B' }, { id: 'D-H', source: 'D', target: 'H' }],
    },
    node: {
      style: { size: 30, label: (node) => node.id, labelOffsetY: 8 },
      stateStyles: { selected: { fill: '#873BF4', stroke: '#5B21B6', strokeWidth: 2, haloWidth: 12 } },
    },
    behaviors,
    autoFit: { padding: 60, maxZoom: 1 },
  });
  const status = document.createElement('div');
  status.style.cssText = 'position:absolute;left:12px;bottom:12px;z-index:20;background:white;color:#334155;padding:6px 10px;border-radius:6px;font:12px system-ui;';
  status.setAttribute('role', 'status');
  const updateStatus = () => {
    status.textContent = `selected nodes: ${graph.findNodesByState('selected').join(', ') || 'none'}`;
  };
  graph.on('node:selectchange', updateStatus);
  graph.on('selection:clear', updateStatus);
  graph.on('brush:end', updateStatus);
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => { status.remove(); destroy(); };
  try {
    await graph.render();
    updateStatus();
    container.append(status);
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}
```



## Synchronize selection [#synchronize-selection]

Enable click-select, brush-select / lasso-select, or drag-node in Graph behaviors first; see [interaction combinations](/en/docs/guides/behaviors). To synchronize business selection, query the final set from the completion events of each source:

```ts
import type { Graph } from '@antv/g6-lite';

export function observeSelection(
  graph: Graph,
  onChange: (nodes: string[], edges: string[]) => void,
) {
  const sync = () => onChange(
    graph.findNodesByState('selected'), graph.findEdgesByState('selected'),
  );
  const events = ['node:selectchange', 'edge:selectchange', 'selection:clear', 'brush:end', 'lasso:end'] as const;
  for (const event of events) graph.on(event, sync);
  sync();
  return () => { for (const event of events) graph.off(event, sync); };
}
```

One action can invoke the callback more than once, such as clearing before selecting. Coalesce expensive UI updates in the application. Synchronize UI explicitly after programmatic state changes too; brushing does not emit node:selectchange per node.

## Persist drag results [#persist-drag-results]

Persist drag results at dragend, reading positions for every nodeIds entry. Move-stage dx/dy is cumulative graph-coordinate displacement from gesture start. This helper returns cleanup; implement network calls and error handling in the application save function:

```ts
import type { Graph, GraphEventMap } from '@antv/g6-lite';

export function observeDrag(graph: Graph, save: (positions: Array<{ id: string; x: number; y: number }>) => void) {
  const onEnd = ({ nodeIds }: GraphEventMap['node:dragend'][0]) => {
    save(nodeIds.flatMap((id) => {
      const position = graph.getElementPosition(id);
      return position ? [{ id, ...position }] : [];
    }));
  };
  graph.on('node:dragend', onEnd);
  return () => graph.off('node:dragend', onEnd);
}
```

Combo and edge dragging have different payloads; see the [drag reference](/en/docs/api/graph/events#event-drag). Applications must validate and write back drag-edge endpoint proposals.

## Cleanup and performance [#cleanup-and-performance]

Call the functions returned by observeSelection / observeDrag on unmount or subscription replacement. Handle persistence throttling, cancellation, and failures in your application.

[Back to event basics](/en/docs/guides/events) · [Selection payloads](/en/docs/api/graph/events#event-selection) · [Drag payloads](/en/docs/api/graph/events#event-drag)。
