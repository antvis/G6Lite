import {
  Graph, extensionFactory, register,
  type BehaviorExtension, type BehaviorOptions, type ElementState, type ExtensionContext,
} from '@antv/g6-lite';

export const BUSINESS_SELECT = 'docs-business-select' as const;
export interface BusinessSelectOptions extends BehaviorOptions<typeof BUSINESS_SELECT> {
  state?: ElementState;
}

export function createBusinessSelect(): BehaviorExtension<BusinessSelectOptions> {
  let context: ExtensionContext | undefined;
  let state: ElementState = 'active';
  const select = (nodeId?: string) => {
    if (!context || context.isDestroyed()) return;
    const next: Record<string, ElementState[]> = {};
    for (const id of context.data.getNodeIds()) {
      const retained = context.state.get(id).filter((value) => value !== state);
      next[id] = id === nodeId ? [...retained, state] : retained;
    }
    context.state.setAll(next);
  };
  return {
    init(nextContext, options) { context = nextContext; state = options.state ?? 'active'; },
    getEvents() {
      return {
        'node:click': ({ nodeId, nativeEvent }) => {
          if (nativeEvent.button === 0) select(nodeId);
        },
        'canvas:click': () => select(),
      };
    },
    destroy() { context = undefined; },
  };
}

// #region registration
export function registerBusinessSelect() {
  register('behavior', BUSINESS_SELECT, extensionFactory(createBusinessSelect));
}
// #endregion registration

export async function run(container: HTMLElement) {
  registerBusinessSelect();
  const graph = new Graph({
    container,
    data: {
      nodes: [
        { id: 'A', x: 0, y: 0, states: ['selected'] },
        { id: 'B', x: 160, y: 0 }, { id: 'C', x: 320, y: 0 },
      ],
      edges: [{ source: 'A', target: 'B' }, { source: 'B', target: 'C' }],
    },
    node: {
      style: { size: 32, label: (node) => node.id, labelOffsetY: 8 },
      stateStyles: { active: { fill: '#F08F56', stroke: '#914C1D', strokeWidth: 2 } },
    },
    behaviors: [{ type: BUSINESS_SELECT, state: 'active' } satisfies BusinessSelectOptions],
    autoFit: { padding: 56, maxZoom: 1 },
  });
  const status = document.createElement('div');
  status.style.cssText = 'position:absolute;left:12px;bottom:12px;z-index:20;background:white;color:#334155;padding:6px 10px;border-radius:6px;font:12px system-ui;';
  status.setAttribute('role', 'status');
  const updateStatus = () => {
    status.textContent = `active: ${graph.findNodesByState('active').join(', ') || 'none'} | selected: ${graph.findNodesByState('selected').join(', ') || 'none'}`;
  };
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => { status.remove(); destroy(); };
  try {
    await graph.render();
    graph.on('node:click', updateStatus);
    graph.on('canvas:click', updateStatus);
    updateStatus();
    container.append(status);
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}
