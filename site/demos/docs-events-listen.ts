import { Graph, type GraphElementEvent, type GraphEventMap } from '@antv/g6-lite';
import { createDemoPanel } from './demo-panel.ts';

export async function run(container: HTMLElement) {
  const graph = new Graph({
    container,
    data: {
      nodes: [{ id: 'A', x: 0, y: 0 }, { id: 'B', x: 160, y: 0 }, { id: 'C', x: 320, y: 0 }],
      edges: [{ id: 'A-B', source: 'A', target: 'B' }],
    },
    node: { style: { size: 32, label: (node) => node.id, labelOffsetY: 8 } },
    edge: { style: { hitAreaWidth: 12 } },
    behaviors: [],
    autoFit: { padding: 60, maxZoom: 1 },
  });
  const ui = createDemoPanel(container);
  const status = document.createElement('div');
  status.setAttribute('role', 'status');
  status.style.cssText = 'position:absolute;bottom:12px;left:12px;right:12px;padding:8px;background:white;color:#334155;font:12px/1.6 system-ui;white-space:pre-line;pointer-events:none;z-index:20;';
  let latest = 'Click a node, edge, or empty canvas';
  let onceResult = 'once: not armed';
  const update = () => { status.textContent = `${latest}\n${onceResult}`; };
  const point = ({ x, y }: { x: number; y: number }) => `${Math.round(x)}, ${Math.round(y)}`;
  // #region listeners
  const onClick = (event: GraphElementEvent) => {
    latest = [
      `${event.targetType}: ${event.targetId ?? 'empty'}`,
      `client (${point(event.client)})`,
      `canvas (${point(event.canvas)})`,
      `graph (${point(event.graph)})`,
    ].join(' | ');
    update();
  };
  const clickEvents = ['node:click', 'edge:click', 'canvas:click'] as const;
  for (const event of clickEvents) graph.on(event, onClick);
  // #endregion listeners
  const onOnce = ({ nodeId }: GraphEventMap['node:click'][0]) => {
    onceResult = `once: ${nodeId} (consumed)`;
    update();
  };
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => {
    for (const event of clickEvents) graph.off(event, onClick);
    graph.off('node:click', onOnce);
    ui.destroy();
    status.remove();
    destroy();
  };
  try {
    await graph.render();
    update();
    ui.gui.add({ listening: true }, 'listening').name('Listening').onChange((listening: boolean) => {
      for (const event of clickEvents) {
        if (listening) graph.on(event, onClick);
        else graph.off(event, onClick);
      }
    });
    ui.addAction('Arm once', () => {
      graph.off('node:click', onOnce);
      graph.once('node:click', onOnce);
      onceResult = 'once: waiting for a node click';
      update();
    });
    container.append(status);
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}
