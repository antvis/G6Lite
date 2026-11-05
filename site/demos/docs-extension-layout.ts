import { Graph, extensionFactory, register, type ExtensionContext, type LayoutExtension } from '@antv/g6-lite';
import { buttonStyle } from './demo-panel.ts';

interface ColumnOptions extends Record<string, unknown> { gap?: number; delay?: number }
function pause(signal: AbortSignal | undefined, delay: number) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) { reject(new DOMException('Canceled', 'AbortError')); return; }
    const abort = () => { clearTimeout(timer); reject(new DOMException('Canceled', 'AbortError')); };
    const timer = setTimeout(() => { signal?.removeEventListener('abort', abort); resolve(); }, delay);
    signal?.addEventListener('abort', abort, { once: true });
  });
}
// #region layout
export function createColumnLayout(): LayoutExtension<ColumnOptions> {
  let context: ExtensionContext | undefined;
  return {
    init(next) { context = next; },
    async execute(data, { width, height, signal, options }) {
      const gap = Number(options.gap ?? 100);
      const nodes = [];
      for (const [index, node] of data.nodes.entries()) {
        await pause(signal, Number(options.delay ?? 0));
        if (signal?.aborted || context?.isDestroyed()) throw new DOMException('Canceled', 'AbortError');
        nodes.push({ ...node, x: width / 2 + (index - (data.nodes.length - 1) / 2) * gap, y: height / 2 });
      }
      return { nodes };
    },
    destroy() { context = undefined; },
  };
}
register('layout', 'docs-column', extensionFactory(createColumnLayout));
// #endregion layout

export async function run(container: HTMLElement) {
  const graph = new Graph({
    container,
    data: { nodes: ['A', 'B', 'C', 'D', 'E', 'F'].map((id) => ({ id })), edges: [] },
    layout: { type: 'docs-column', gap: 100 },
    node: { style: { size: 30, label: (node) => node.id } },
    behaviors: ['zoom-canvas', 'drag-canvas'],
    autoFit: { padding: 56, maxZoom: 1 },
  });
  let revision = 0;
  const controls = document.createElement('div');
  controls.style.cssText = 'position:absolute;top:12px;left:12px;z-index:20;display:flex;gap:6px;flex-wrap:wrap;';
  const status = document.createElement('div');
  status.setAttribute('role', 'status');
  status.style.cssText = 'position:absolute;bottom:12px;left:12px;font:12px system-ui;color:#334155;background:white;padding:4px;';
  const apply = async (mode: string) => {
    const request = ++revision;
    status.textContent = mode === 'slow' ? 'Running slow layout…' : 'Running…';
    if (mode === 'grid') graph.cancelLayout();
    graph.setLayout(mode === 'grid' ? { type: 'grid' } : { type: 'docs-column', gap: 100, delay: mode === 'slow' ? 180 : 0 });
    await graph.layout();
    if (graph.destroyed || request !== revision) return;
    graph.fitView({ padding: 56, maxZoom: 1 });
    status.textContent = mode === 'grid' ? 'Canceled old run; grid' : 'Column layout complete';
  };
  for (const [mode, label] of [['column', 'Layout again'], ['slow', 'Slow layout'], ['grid', 'Cancel + grid']]) {
    const button = document.createElement('button'); button.type = 'button';
    button.textContent = label; button.style.cssText = buttonStyle;
    button.addEventListener('click', () => { void apply(mode).catch((error) => { if (!graph.destroyed) status.textContent = String(error); }); });
    controls.append(button);
  }
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => { revision++; controls.remove(); status.remove(); destroy(); };
  try { await graph.render(); status.textContent = 'Column layout complete'; container.append(controls, status); return graph; }
  catch (error) { graph.destroy(); throw error; }
}
