/**
 * Demo: constrain wheel zoom with sensitivity, minZoom, and maxZoom.
 */
import { Graph, type BuiltInBehaviorConfig, type FitViewOptions } from '@antv/g6-lite';
import { createDemoPanel } from './demo-panel.ts';

const NODE_SIZE = 11;
const SPAN_X = 108;
const SPAN_Y = 44;

export function getFitOptions(container?: HTMLElement): FitViewOptions {
  const controls = container?.querySelector<HTMLElement>('.g6lite-demo-controls');
  const top = Math.max(48, (controls?.offsetHeight ?? 0) + 26);
  const below: FitViewOptions = { padding: [top, 32, 64, 32] };
  if (!container || !controls) return below;

  const right = controls.offsetWidth + 26;
  const { clientWidth: width, clientHeight: height } = container;
  const scaleBelow = Math.min((width - 64) / (SPAN_X + NODE_SIZE), (height - top - 64) / (SPAN_Y + NODE_SIZE));
  const scaleBeside = Math.min((width - right - 32) / (SPAN_X + NODE_SIZE), (height - 112) / (SPAN_Y + NODE_SIZE));
  return scaleBeside > scaleBelow ? { padding: [48, right, 64, 32] } : below;
}

export async function run(container: string | HTMLElement) {
  // #region navigation
  const behaviors = [
    { type: 'zoom-canvas', sensitivity: 1.4, minZoom: 0.4, maxZoom: 2 },
    { type: 'drag-canvas', ignoreModifierKeys: true },
  ] satisfies [BuiltInBehaviorConfig, BuiltInBehaviorConfig];
  // #endregion navigation
  const [{ minZoom, maxZoom }] = behaviors;
  const graph = new Graph({
    autoFit: false,
    container,
    data: {
      nodes: [
        { id: 'a', x: 0, y: 22 },
        { id: 'b', x: 54, y: 0 },
        { id: 'c', x: 54, y: SPAN_Y },
        { id: 'd', x: SPAN_X, y: 22 },
      ],
      edges: [
        { source: 'a', target: 'b' },
        { source: 'a', target: 'c' },
        { source: 'b', target: 'd' },
        { source: 'c', target: 'd' },
      ],
    },
    node: { style: { size: NODE_SIZE, fill: '#5B8FF9', label: (node) => node.id.toUpperCase(), labelPlacement: 'center', labelColor: '#fff' } },
    label: { scaleWithZoom: false },
    edge: { style: { lineWidth: 3, stroke: '#8b9ec2' } },
    behaviors,
  });
  const ui = createDemoPanel(container);
  let referenceZoom = 1;
  const getScale = () => graph.getZoom() / referenceZoom;
  const report = () => {
    ui.setStatus(`Zoom ${getScale().toFixed(2)}× · ${minZoom}–${maxZoom}×`);
  };
  const host = typeof container === 'string' ? document.querySelector<HTMLElement>(container)! : container;
  let reportFrame: number | undefined;
  const onWheel = () => {
    if (reportFrame !== undefined) cancelAnimationFrame(reportFrame);
    reportFrame = requestAnimationFrame(() => { reportFrame = undefined; report(); });
  };
  host.addEventListener('wheel', onWheel, { passive: true });

  const fitView = graph.fitView.bind(graph);
  const fitAtScale = (options: number | FitViewOptions, scale: number) => {
    // Base the demo's 2× preset on the fitted camera. On larger displays,
    // cap the reference so these four nodes stay comfortably sized.
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const maxCssPixelsPerGraphUnit = 6;
    fitView(typeof options === 'number' ? options : { ...options, maxZoom: maxCssPixelsPerGraphUnit * dpr });
    referenceZoom = graph.getZoom() / maxZoom;
    const zoomLimits = { minZoom: minZoom * referenceZoom, maxZoom: maxZoom * referenceZoom };
    graph.updateOptions({
      behaviors: [
        { ...behaviors[0], ...zoomLimits },
        behaviors[1],
      ],
    });
    if (scale < maxZoom) graph.zoomTo(scale * referenceZoom, zoomLimits);
    report();
  };
  const fitCurrentScale = () => fitAtScale(getFitOptions(host), getScale());
  const panelObserver = new ResizeObserver(fitCurrentScale);
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => {
    panelObserver.disconnect();
    host.removeEventListener('wheel', onWheel);
    if (reportFrame !== undefined) cancelAnimationFrame(reportFrame);
    ui.destroy();
    destroy();
  };
  try {
    await graph.render();
    const setScale = (scale: number) => fitAtScale(getFitOptions(host), scale);
    ui.addAction(`${minZoom}×`, () => setScale(minZoom));
    ui.addAction('1×', () => setScale(1));
    ui.addAction(`${maxZoom}×`, () => setScale(maxZoom));
    if (host.clientWidth < 500) ui.gui.close();
    setScale(1.8);
    graph.fitView = (options = getFitOptions(host)) => fitAtScale(options, maxZoom);
    graph.on('resize', fitCurrentScale);
    panelObserver.observe(ui.gui.domElement);
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}
