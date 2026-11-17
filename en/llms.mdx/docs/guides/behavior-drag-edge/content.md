# Drag edge endpoints (/en/docs/guides/behavior-drag-edge)





Drag an endpoint of an existing edge and use the drop event to read the proposed connection.

## Configuration [#configuration]

Start dragging on the edge near an endpoint. The example uses `edge:drag` to draw a dashed preview that follows the pointer. On release, `edge:dragend` reports the proposed connection. Call `updateEdgeData()` to apply it.

## Example [#example]



```ts
graph.on('edge:dragend', ({ edgeId, source, target, reconnected }) => {
  if (reconnected && edgeId) {
    graph.updateEdgeData([{ id: edgeId, source, target }]);
  }
  ui.setStatus(`dragend reconnected=${reconnected}\n${edgeId ?? '-'}: ${source} → ${target}`);
});
```

**Complete runnable code**

```ts
import { Graph, type GraphEventMap } from '@antv/g6-lite';
import GUI from 'lil-gui';

export async function run(container: string | HTMLElement) {
  const nodeSize = 38;
  const activeColor = '#5366ad';
  const graph = new Graph({
    autoFit: { padding: 48 },
    container,
    data: {
      nodes: [
        { id: 'a', x: 120, y: 160, data: { label: 'A' } },
        { id: 'b', x: 340, y: 80, data: { label: 'B' } },
        { id: 'c', x: 340, y: 240, data: { label: 'C' } },
        { id: 'd', x: 560, y: 160, data: { label: 'D' } },
      ],
      edges: [
        { id: 'editable-edge', source: 'a', target: 'b' },
        { id: 'reference-edge', source: 'c', target: 'd' },
      ],
    },
    node: { style: { size: nodeSize, label: (node) => String(node.data?.label ?? node.id), labelPlacement: 'center', labelColor: '#fff' } },
    label: { hideOnLowZoom: false },
    edge: {
      style: {
        stroke: (_source, _target, edge) => edge.id === 'editable-edge' ? activeColor : '#94a3b8',
        lineWidth: 4,
        hitAreaWidth: 36,
        endArrow: true,
        label: (_source, _target, edge) => edge.id === 'editable-edge' ? '●' : false,
        labelPlacement: 'end',
        labelFontSize: 18,
        labelColor: activeColor,
        labelBackground: false,
        labelAutoRotate: false,
      },
      stateStyles: { inactive: { opacity: 0.25 } },
    },
    behaviors: ['zoom-canvas', 'drag-canvas', 'drag-edge'],
  });
  const ui = createDemoPanel(container);
  const canvas = graph.getCanvas();
  const preview = document.createElement('div');
  preview.dataset.edgeDragPreview = '';
  preview.setAttribute('aria-hidden', 'true');
  preview.hidden = true;
  preview.style.cssText = `position:absolute;pointer-events:none;z-index:1;height:0;border-top:2px dashed ${activeColor};transform-origin:left center;`;
  canvas.parentElement!.append(preview);

  const drawPreview = ({ source, target, dragEnd, event }: GraphEventMap['edge:drag'][0]) => {
    const stationary = graph.getNodePosition(dragEnd === 'source' ? target : source);
    if (!stationary) return;
    const { x, y } = graph.graphToScreen(stationary.x, stationary.y);
    const dx = event.clientX - x;
    const dy = event.clientY - y;
    const length = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx);
    const radius = graph.graphToScreen(stationary.x + nodeSize / 2, stationary.y).x - x;
    const bounds = canvas.getBoundingClientRect();
    preview.style.left = `${x + radius * Math.cos(angle) - bounds.left}px`;
    preview.style.top = `${y + radius * Math.sin(angle) - bounds.top}px`;
    preview.style.width = `${Math.max(0, length - radius)}px`;
    preview.style.transform = `rotate(${angle}rad)`;
    preview.hidden = false;
  };
  graph.on('edge:pointerenter', () => {
    if (preview.hidden) canvas.style.cursor = 'grab';
  });
  graph.on('edge:pointerleave', () => {
    if (preview.hidden) canvas.style.cursor = '';
  });
  graph.on('edge:dragstart', (payload) => {
    canvas.style.cursor = 'grabbing';
    if (payload.edgeId) graph.setItemState(payload.edgeId, 'inactive', true);
    drawPreview(payload);
    ui.setStatus(`dragstart ${payload.edgeId ?? '-'} (${payload.dragEnd})`);
  });
  graph.on('edge:drag', drawPreview);
  graph.on('edge:dragend', ({ edgeId }) => {
    preview.hidden = true;
    canvas.style.cursor = '';
    if (edgeId) graph.setItemState(edgeId, 'inactive', false);
  });
  // #region reconnect
  graph.on('edge:dragend', ({ edgeId, source, target, reconnected }) => {
    if (reconnected && edgeId) {
      graph.updateEdgeData([{ id: edgeId, source, target }]);
    }
    ui.setStatus(`dragend reconnected=${reconnected}\n${edgeId ?? '-'}: ${source} → ${target}`);
  });
  // #endregion reconnect

  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => {
    preview.remove();
    ui.destroy();
    destroy();
  };
  try {
    await graph.render();
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}


export function createDemoPanel(container: string | HTMLElement, description = '') {
  const host = typeof container === 'string' ? document.querySelector<HTMLElement>(container)! : container;
  if (getComputedStyle(host).position === 'static') host.style.position = 'relative';

  let gui: GUI | undefined;
  const getGui = () => {
    if (!gui) {
      gui = new GUI({ container: host, width: 160 });
      gui.domElement.classList.add('g6lite-demo-controls');
      gui.domElement.dataset.captureIgnore = '';
      Object.assign(gui.domElement.style, {
        position: 'absolute',
        top: '10px',
        right: '10px',
        zIndex: '30',
        maxWidth: 'calc(100% - 20px)',
        maxHeight: 'calc(100% - 20px)',
      });
    }
    return gui;
  };

  let status: HTMLDivElement | undefined;
  const setStatus = (message: string) => {
    if (!status) {
      status = document.createElement('div');
      status.setAttribute('role', 'status');
      status.dataset.role = 'status';
      status.dataset.captureIgnore = '';
      status.style.cssText =
        'position:absolute;left:12px;bottom:10px;z-index:20;max-width:min(28rem,calc(100% - 24px));color:#64748b;font:12px/1.45 system-ui,sans-serif;pointer-events:none;white-space:pre-wrap;';
      host.append(status);
    }
    status.textContent = message;
  };
  if (description) setStatus(description);

  return {
    get gui() {
      return getGui();
    },
    addAction(label: string, action: () => void, folder = getGui()) {
      return folder.add({ [label]: action }, label);
    },
    addChoice<T extends string>(
      label: string,
      choices: readonly T[] | Record<string, T>,
      value: T,
      onChange: (value: T) => void,
    ) {
      const options = Array.isArray(choices) ? [...choices] : choices;
      return getGui().add({ value }, 'value', options).name(label).onChange(onChange);
    },
    setStatus,
    destroy() {
      gui?.destroy();
      status?.remove();
    },
  };
}
```



[Options and defaults](/en/docs/api/options#navigation-and-dragging)
