import { Graph, register, type GraphData, type TransformExtension } from '@antv/g6-lite';
import { createDemoPanel } from './demo-panel.ts';

type Phase = 'init' | 'update' | 'run' | 'destroy';
interface NormalizeOptions { prefix?: string; onPhase?: (phase: Phase) => void }
// #region transform
export function createNormalize(): TransformExtension<NormalizeOptions> {
  let prefix = 'Svc';
  let report: NormalizeOptions['onPhase'];
  const configure = (options: Readonly<Partial<NormalizeOptions>>) => {
    prefix = options.prefix ?? 'Svc';
    report = options.onPhase;
  };
  return {
    init(_context, options) { configure(options); report?.('init'); },
    update(options) { configure(options); report?.('update'); },
    beforeRender(data) {
      report?.('run');
      return { ...data, nodes: data.nodes.map((node) => ({
        ...node, data: { ...node.data, label: prefix + ': ' + String(node.data?.name ?? node.id) },
      })) };
    },
    destroy() { report?.('destroy'); report = undefined; },
  };
}
register('transform', 'docs-normalize', () => createNormalize());
// #endregion transform

export async function run(container: HTMLElement) {
  const counters: Record<Phase, number> = { init: 0, update: 0, run: 0, destroy: 0 };
  const status = document.createElement('div');
  status.setAttribute('role', 'status');
  status.style.cssText = 'position:absolute;bottom:12px;left:12px;font:12px system-ui;color:#334155;background:white;padding:4px;';
  const updateStatus = () => {
    status.textContent = 'init=' + counters.init + ' update=' + counters.update + ' run=' + counters.run;
  };
  let revision = 0;
  const input = (): GraphData => ({
    nodes: [
      { id: 'A', x: 0, y: 0, data: { name: revision % 2 ? 'New API' : 'API' } },
      { id: 'B', x: 240, y: 0, data: { name: 'DB' } },
    ],
    edges: [{ id: 'A-B', source: 'A', target: 'B' }],
  });
  const graph = new Graph({
    container, data: input(),
    // #region config-transforms
    transforms: [{ type: 'docs-normalize', options: { prefix: 'Svc', onPhase: (phase: Phase) => { counters[phase]++; updateStatus(); } } }],
    // #endregion config-transforms
    node: { style: { size: 32, label: (node) => String(node.data?.label ?? node.id) } },
    behaviors: ['zoom-canvas', 'drag-canvas'],
    autoFit: { padding: 64, maxZoom: 1 },
  });
  const ui = createDemoPanel(container);
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => { ui.destroy(); status.remove(); destroy(); };
  try {
    await graph.render();
    updateStatus();
    ui.addAction('Reload data', () => {
      revision++;
      void graph.setData(input(), { fitView: false }).catch((error) => { status.textContent = String(error); });
    });
    ui.addAction('Update name', () => {
      graph.updateNodeData('A', { name: 'Raw name' });
      updateStatus();
    });
    container.append(status);
    return graph;
  }
  catch (error) { graph.destroy(); throw error; }
}
