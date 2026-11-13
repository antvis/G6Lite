# Zoom range and sensitivity (/en/docs/examples/zoom-options)





Limit wheel zoom with sensitivity, minimum zoom, and maximum zoom.

## Try it

Zoom with the wheel, or jump to the minimum, 1x, and maximum zoom.

## Data

Wheel zoom is limited to the range 0.4–2.

## Complete runnable code

```ts
// Local presentation helpers in this repository are used only for the example controls.
/**
 * Demo: constrain wheel zoom with sensitivity, minZoom, and maxZoom.
 */
import { Graph, type BuiltInBehaviorConfig } from '@antv/g6-lite';
import { createDemoPanel } from './demo-panel.ts';

export async function run(container: string | HTMLElement) {
  // #region navigation
  const behaviors = [
    { type: 'zoom-canvas', sensitivity: 1.4, minZoom: 0.4, maxZoom: 2 },
    { type: 'drag-canvas', ignoreModifierKeys: true },
  ] satisfies [BuiltInBehaviorConfig, BuiltInBehaviorConfig];
  // #endregion navigation
  const [{ minZoom, maxZoom }] = behaviors;
  const graph = new Graph({
    autoFit: true,
    container,
    data: {
      nodes: [
        { id: 'a', x: 180, y: 180 },
        { id: 'b', x: 340, y: 120 },
        { id: 'c', x: 340, y: 250 },
        { id: 'd', x: 500, y: 180 },
      ],
      edges: [
        { source: 'a', target: 'b' },
        { source: 'a', target: 'c' },
        { source: 'b', target: 'd' },
        { source: 'c', target: 'd' },
      ],
    },
    node: { style: { size: 28, fill: '#5B8FF9' } },
    behaviors,
  });
  const ui = createDemoPanel(container);
  const report = () => {
    ui.setStatus(`Zoom ${graph.getZoom().toFixed(2)}× · ${minZoom}–${maxZoom}×`);
  };
  const host = typeof container === 'string' ? document.querySelector<HTMLElement>(container)! : container;
  let reportFrame: number | undefined;
  const onWheel = () => {
    if (reportFrame !== undefined) cancelAnimationFrame(reportFrame);
    reportFrame = requestAnimationFrame(() => { reportFrame = undefined; report(); });
  };
  host.addEventListener('wheel', onWheel, { passive: true });

  const fitView = graph.fitView.bind(graph);
  graph.fitView = (options) => { fitView(options); report(); };
  const zoomTo = graph.zoomTo.bind(graph);
  graph.zoomTo = (zoom, options) => { zoomTo(zoom, options); report(); };
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => {
    host.removeEventListener('wheel', onWheel);
    if (reportFrame !== undefined) cancelAnimationFrame(reportFrame);
    ui.destroy();
    destroy();
  };
  try {
    await graph.render();
    ui.addAction(`${minZoom}×`, () => graph.zoomTo(minZoom));
    ui.addAction('1×', () => graph.zoomTo(1));
    ui.addAction(`${maxZoom}×`, () => graph.zoomTo(maxZoom));
    report();
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}
```


## Related documentation

- [Viewport guide](/en/docs/guides/viewport)
- [Viewport methods](/en/docs/api/graph#graph-viewport)