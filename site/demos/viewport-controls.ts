import { Graph, type FitViewOptions } from '@antv/g6-lite';
import { createDemoPanel } from './demo-panel.ts';

export async function run(container: string | HTMLElement) {
  const host = typeof container === 'string' ? document.querySelector<HTMLElement>(container)! : container;
  const getFitOptions = (): FitViewOptions => {
    const panel = host.querySelector<HTMLElement>('.g6lite-demo-controls');
    return {
      padding: [32, panel && panel.offsetHeight > 60 ? panel.offsetWidth + 26 : 28, 78, 28],
      maxZoom: 1.4 * Math.min(2, window.devicePixelRatio || 1),
    };
  };
  const graph = new Graph({
    autoFit: getFitOptions(),
    container,
    data: {
      nodes: [
        { id: 'a', x: 60, y: 80, data: { label: 'A' } },
        { id: 'b', x: 420, y: 80, data: { label: 'B' } },
        { id: 'c', x: 240, y: 300, data: { label: 'C' } },
      ],
      edges: [
        { id: 'ab', source: 'a', target: 'b' },
        { id: 'bc', source: 'b', target: 'c' },
        { id: 'ca', source: 'c', target: 'a' },
      ],
    },
    node: { style: { size: 36, label: (node) => String(node.data?.label ?? node.id), labelPlacement: 'center', labelColor: '#fff' } },
    edge: { style: { endArrow: true } },
    behaviors: ['zoom-canvas', 'drag-canvas'],
  });
  await graph.render();

  const ui = createDemoPanel(container);
  const fit = () => graph.fitView(getFitOptions());

  const showCamera = (prefix: string) => {
    const camera = graph.getCamera();
    ui.setStatus(`${prefix}\nzoom=${camera.zoom.toFixed(3)} x=${camera.x.toFixed(1)} y=${camera.y.toFixed(1)}\nnodes=${graph.getNodes().length} edges=${graph.getEdges().length}`);
  };

  const addCameraAction = (label: string, action: string, run: () => void) => {
    ui.addAction(label, () => {
      run();
      showCamera(action);
    });
  };
  addCameraAction('zoomBy +', 'zoom-in', () => graph.zoomBy(1.25));
  addCameraAction('zoomBy −', 'zoom-out', () => graph.zoomBy(0.8));
  addCameraAction('fitView', 'fit', fit);
  addCameraAction('fitCenter', 'center', () => graph.fitCenter());
  addCameraAction('focus C', 'focus', () => graph.focusItem('c'));
  addCameraAction('setCamera', 'camera', () => graph.setCamera({ zoom: 1.1, x: 80, y: 40 }));
  addCameraAction('resetCamera', 'reset', () => graph.resetCamera());
  addCameraAction('setSize', 'resize', () => graph.setSize(720, 460));
  ui.addAction('坐标互转', () => {
    const position = graph.getNodePosition('a')!;
    const screen = graph.graphToScreen(position.x, position.y);
    const restored = graph.screenToGraph(screen.x, screen.y);
    ui.setStatus(`graph=(${position.x.toFixed(1)}, ${position.y.toFixed(1)})\nscreen=(${screen.x.toFixed(1)}, ${screen.y.toFixed(1)})\nrestored=(${restored.x.toFixed(1)}, ${restored.y.toFixed(1)})`);
  });

  if (host.clientWidth < 500) ui.gui.close();
  fit();
  graph.on('resize', fit);
  showCamera('ready');
  return {
    getData: () => graph.getData(),
    fitView() {
      fit();
      showCamera('fit');
    },
    destroy: () => {
      graph.off('resize', fit);
      graph.destroy();
      ui.destroy();
    },
  };
}
