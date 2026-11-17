import { Graph, type FitViewOptions } from '@antv/g6-lite';
import { createDemoPanel } from './demo-panel.ts';

const COLUMNS = 4;
const NODES = Array.from({ length: 12 }, (_, index) => ({
  id: `service-${index + 1}`,
  x: (index % COLUMNS) * 160,
  y: Math.floor(index / COLUMNS) * 110,
  data: {
    label: `S${String(index + 1).padStart(2, '0')}`,
    fill: ['#5B8FF9', '#5AD8A6', '#F6BD16'][Math.floor(index / COLUMNS)],
  },
}));

const ROUTE = [0, 1, 2, 3, 7, 6, 5, 4, 8, 9, 10, 11];
const EDGES = ROUTE.slice(1).map((nodeIndex, index) => ({
  id: `route-${index + 1}`,
  source: NODES[ROUTE[index]].id,
  target: NODES[nodeIndex].id,
  data: { label: `R${String(index + 1).padStart(2, '0')}` },
}));

export async function run(
  container: string | HTMLElement,
  fitPreview?: (graph: Graph, options: FitViewOptions) => void,
) {
  const root =
    typeof container === 'string' ? (document.querySelector(container)! as HTMLElement) : container;
  const compact = root.clientWidth < 500;
  const graph = new Graph({
    autoFit: { padding: 40 },
    container: root,
    data: { nodes: NODES, edges: EDGES },
    label: {
      scaleWithZoom: true,
      hideOnLowZoom: true,
      hideOnCollision: true,
    },
    node: {
      style: {
        size: 34,
        fill: (node) => String(node.data?.fill ?? '#5B8FF9'),
        stroke: '#fff',
        strokeWidth: 2,
        label: (node) => String(node.data?.label ?? node.id),
        labelPlacement: 'bottom',
        labelFontSize: 15,
        labelColor: '#1e293b',
        labelBackground: 'rgba(255,255,255,0.9)',
        labelBackgroundPadding: 3,
      },
    },
    edge: {
      style: {
        stroke: '#94a3b8',
        endArrow: true,
        label: (_source, _target, edge) => String(edge.data?.label ?? edge.id ?? ''),
        labelFontSize: 13,
        labelColor: '#475569',
        labelBackground: 'rgba(255,255,255,0.88)',
        labelBackgroundPadding: 2,
      },
    },
    behaviors: ['zoom-canvas', 'drag-canvas'],
  });
  await graph.render();

  const ui = createDemoPanel(root);

  let allLabels = false;
  let zoomPreset: number | undefined;
  let wheelFrame = 0;

  const updateStatus = () => {
    ui.setStatus(
      `${allLabels ? '全部标签' : '默认策略'} · zoom=${graph.getZoom().toFixed(2)}` +
        (allLabels && graph.getZoom() < 0.5 ? '\n低缩放时文字可能重叠' : ''),
    );
  };

  const fit = () => {
    const options: FitViewOptions = zoomPreset === undefined
      ? {}
      : { maxZoom: zoomPreset };
    if (fitPreview) {
      fitPreview(graph, options);
    } else {
      graph.fitView({ padding: [ui.gui.domElement.offsetHeight + 20, 36, 84, 36], ...options });
    }
    updateStatus();
  };

  const setZoom = (nextZoom?: number) => {
    zoomPreset = nextZoom;
    fit();
  };

  const setLabelPolicy = (showAll: boolean) => {
    allLabels = showAll;
    graph.updateOptions({
      label: {
        scaleWithZoom: !showAll,
        hideOnLowZoom: !showAll,
        hideOnCollision: !showAll,
      },
    });
    updateStatus();
  };

  ui.addAction('全部标签', () => setLabelPolicy(true));
  ui.addAction('默认策略', () => setLabelPolicy(false));
  ui.addAction('zoom 0.2', () => setZoom(0.2));
  ui.addAction('zoom 0.4', () => setZoom(0.4));
  ui.addAction('适应画布', () => setZoom());

  if (compact) ui.gui.close();
  fit();
  const observer = new ResizeObserver(fit);
  observer.observe(ui.gui.domElement);
  graph.on('resize', fit);
  const canvas = graph.getCanvas();
  const onWheel = () => {
    cancelAnimationFrame(wheelFrame);
    wheelFrame = requestAnimationFrame(updateStatus);
  };
  canvas.addEventListener('wheel', onWheel, { passive: true });

  return {
    getData: () => graph.getData(),
    fitView: () => setZoom(),
    destroy() {
      observer.disconnect();
      graph.off('resize', fit);
      canvas.removeEventListener('wheel', onWheel);
      cancelAnimationFrame(wheelFrame);
      graph.destroy();
      ui.destroy();
    },
  };
}
