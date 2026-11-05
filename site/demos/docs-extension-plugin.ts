import { Graph, extensionFactory, register, type PluginExtension, type PluginOptions } from '@antv/g6-lite';
import { buttonStyle } from './demo-panel.ts';

const NAME = 'docs-counter' as const;
interface CounterOptions extends PluginOptions<typeof NAME> {
  caption?: string;
  subscribe?: (listener: () => void) => () => void;
}
// #region plugin
export function createCounter(): PluginExtension<CounterOptions> {
  let panel: HTMLDivElement | undefined;
  let button: HTMLButtonElement | undefined;
  let output: HTMLSpanElement | undefined;
  let unsubscribe: (() => void) | undefined;
  let subscribe: CounterOptions['subscribe'];
  let caption = 'Clicks';
  let count = 0;
  const increment = () => { count++; if (output) output.textContent = caption + ': ' + count; };
  return {
    init(_context, options) { caption = options.caption ?? 'Clicks'; subscribe = options.subscribe; },
    mount(container) {
      panel = document.createElement('div');
      panel.style.cssText = 'position:absolute;top:12px;left:12px;z-index:20;display:flex;align-items:center;gap:8px;background:white;color:#334155;padding:6px;font:12px system-ui;';
      button = document.createElement('button');
      button.type = 'button'; button.textContent = 'Plugin +1'; button.style.cssText = buttonStyle;
      output = document.createElement('span'); output.setAttribute('role', 'status');
      output.textContent = caption + ': 0';
      button.addEventListener('click', increment);
      unsubscribe = subscribe?.(increment);
      panel.append(button, output); container.append(panel);
    },
    destroy() {
      unsubscribe?.(); unsubscribe = undefined;
      button?.removeEventListener('click', increment);
      panel?.remove(); panel = undefined; button = undefined; output = undefined; subscribe = undefined;
    },
  };
}
register('plugin', NAME, extensionFactory(createCounter));
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
    } satisfies CounterOptions],
    // #endregion activate
    behaviors: ['zoom-canvas', 'drag-canvas'],
    autoFit: { padding: 64, maxZoom: 1 },
  });
  const button = document.createElement('button'); button.type = 'button'; button.textContent = 'Render again';
  button.style.cssText = 'position:absolute;bottom:12px;left:12px;z-index:20;' + buttonStyle;
  button.addEventListener('click', () => { void graph.render().catch(console.error); });
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => { button.remove(); destroy(); };
  try { await graph.render(); container.append(button); return graph; }
  catch (error) { graph.destroy(); throw error; }
}
