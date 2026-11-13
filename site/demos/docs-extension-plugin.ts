import { Graph, register, type PluginExtension, type PluginOptions } from '@antv/g6-lite';
import { createDemoPanel } from './demo-panel.ts';

const NAME = 'docs-counter' as const;
interface CounterOptions extends PluginOptions<typeof NAME> {
  caption?: string;
  subscribe?: (listener: () => void) => () => void;
  onRenderAgain?: () => void;
}
// #region plugin
export function createCounter(): PluginExtension<CounterOptions> {
  let ui: ReturnType<typeof createDemoPanel> | undefined;
  let unsubscribe: (() => void) | undefined;
  let settings: CounterOptions | undefined;
  let count = 0;
  const report = () => ui?.setStatus(`${settings?.caption ?? 'Clicks'}: ${count}`);
  const increment = () => { count++; report(); };
  return {
    init(_context, options) { settings = options; },
    mount(container) {
      ui = createDemoPanel(container);
      ui.addAction('Plugin +1', increment);
      if (settings?.onRenderAgain) ui.addAction('Render again', settings.onRenderAgain);
      report();
      unsubscribe = settings?.subscribe?.(increment);
    },
    destroy() {
      unsubscribe?.(); unsubscribe = undefined;
      ui?.destroy();
      ui = undefined;
      settings = undefined;
    },
  };
}
register('plugin', NAME, () => createCounter());
// #endregion plugin

export async function run(container: HTMLElement) {
  const graph = new Graph({
    container,
    data: { nodes: [{ id: 'A', x: 0, y: 0 }, { id: 'B', x: 200, y: 0 }], edges: [] },
    node: { style: { size: 32, label: (node) => node.id } },
    // #region activate
    plugins: [{
      type: NAME, caption: 'Clicks',
      subscribe(listener: () => void) {
        graph.on('node:click', listener);
        return () => graph.off('node:click', listener);
      },
      onRenderAgain() { void graph.render().catch(console.error); },
    } satisfies CounterOptions],
    // #endregion activate
    behaviors: ['zoom-canvas', 'drag-canvas'],
    autoFit: { padding: 64, maxZoom: 1 },
  });
  try { await graph.render(); return graph; }
  catch (error) { graph.destroy(); throw error; }
}
