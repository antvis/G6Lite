# Default themes and interaction states (/en/docs/examples/default-theme)





Inspect the light and dark presets together with built-in node and edge states.

## Try it

Switch node and edge shapes, isolate one preset, and use smooth wheel zoom.

## Data

Six nodes and six edges cover default, active, selected, highlight, inactive, and disabled states.

## Complete runnable code

```ts
// Local presentation helpers in this repository are used only for the example controls.
/**
 * Demo: default light/dark theme, built-in states, node shapes, and edge shapes.
 */
import {
  Graph,
  type EdgeLabelPlacement,
  type EdgeState,
  type NodeState,
} from '@antv/g6-lite';
import { createDemoPanel } from './demo-panel.ts';

type NodeType = 'circle' | 'rect';
type EdgeType = 'line' | 'arc' | 'cubic' | 'polyline';
type ThemeName = 'light' | 'dark';

const nodeStates: Array<{ state: NodeState; label: string }> = [
  { state: 'default', label: 'Default' },
  { state: 'active', label: 'Active' },
  { state: 'selected', label: 'Selected' },
  { state: 'highlight', label: 'Highlight' },
  { state: 'inactive', label: 'Inactive' },
  { state: 'disabled', label: 'Disabled' },
];

const edgeStates: EdgeState[] = ['default', 'selected', 'highlight', 'inactive', 'disabled', 'active'];
const edgeLabelPlacements: EdgeLabelPlacement[] = ['end', 'center', 'start'];

const data = {
  nodes: [
    ...nodeStates.map(({ state, label }, index) => ({
      id: `node-${state}`,
      data: { label },
      x: index % 2 === 0 ? 60 : 260,
      y: 48 + Math.floor(index / 2) * 200,
      states: state === 'default' ? undefined : [state],
    })),
    ...edgeStates.flatMap((state, index) => [
      {
        id: `edge-${state}-source`,
        data: { sampleAnchor: true },
        x: 340,
        y: 48 + index * 62,
      },
      {
        id: `edge-${state}-target`,
        data: { sampleAnchor: true },
        x: 520,
        y: 48 + index * 62,
      },
    ]),
  ],
  edges: edgeStates.map((state, index) => ({
    id: `edge-${state}`,
    source: `edge-${state}-source`,
    target: `edge-${state}-target`,
    data: {
      label: state === 'default' ? 'Default edge' : state,
      placement: edgeLabelPlacements[index % edgeLabelPlacements.length],
    },
    states: state === 'default' ? undefined : [state],
  })),
};

export async function run(container: string | HTMLElement) {
  const root =
    typeof container === 'string' ? document.querySelector<HTMLElement>(container)! : container;
  root.replaceChildren();
  root.style.cssText =
    'position:relative;display:flex;width:100%;height:100%;min-height:0;overflow:hidden;background:#fff;font-family:system-ui;';

  const grid = document.createElement('div');
  grid.style.cssText =
    'flex:1;min-height:0;display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:48px 12px 12px;';
  root.append(grid);

  const graphCards = new Map<ThemeName, { card: HTMLElement; surface: HTMLElement }>();
  for (const theme of ['light', 'dark'] as const) {
    const card = document.createElement('section');
    card.style.cssText =
      'min-width:0;min-height:0;display:flex;flex-direction:column;overflow:hidden;border:1px solid #cbd5e1;border-radius:12px;background:#fff;box-shadow:0 8px 24px rgba(15,23,42,.08);';
    const cardHeader = document.createElement('div');
    cardHeader.style.cssText =
      'height:38px;flex:none;display:flex;align-items:center;gap:10px;padding:0 13px;background:#fff;color:#0f172a;font-size:12px;';
    cardHeader.innerHTML = `<strong>${theme === 'light' ? 'Light preset' : 'Dark preset'}</strong><code style="color:#64748b">theme: '${theme}'</code>`;
    const surface = document.createElement('div');
    surface.style.cssText = 'position:relative;flex:1;min-height:0;';
    card.append(cardHeader, surface);
    grid.appendChild(card);
    graphCards.set(theme, { card, surface });
  }

  let graphs: Graph[] = [];
  let nodeType: NodeType = 'circle';
  let edgeType: EdgeType = 'line';

  const renderGraphs = async () => {
    graphs.forEach((graph) => graph.destroy());
    graphs = [];
    for (const theme of ['light', 'dark'] as const) {
      const surface = graphCards.get(theme)!.surface;
      surface.replaceChildren();
      const graph = new Graph({
        autoFit: true,
        container: surface,
        data,
        node: {
          type: nodeType,
          style: {
            size: 44,
            opacity: (node) => (node.data?.sampleAnchor === true ? 0 : 1),
            label: (node) =>
              node.data?.sampleAnchor === true ? false : String(node.data?.label ?? node.id),
            labelPlacement: 'bottom',
            labelColor: theme === 'light' ? '#334155' : '#dbeafe',
          },
        },
        edge: {
          type: edgeType,
          style: {
            curvature: edgeType === 'arc' ? 0.22 : 0,
            curveOffset: edgeType === 'cubic' ? 42 : 0,
            radius: edgeType === 'polyline' ? 10 : 0,
            label: (_source, _target, edge) => String(edge.data?.label ?? edge.id),
            labelPlacement: (_source, _target, edge) =>
              (edge.data?.placement as EdgeLabelPlacement | undefined) ?? 'center',
            labelColor: theme === 'light' ? '#475569' : '#dbeafe',
            labelBackground:
              theme === 'light' ? 'rgba(255,255,255,0.9)' : 'rgba(26,26,26,0.9)',
          },
        },
        label: { scaleWithZoom: false, hideOnLowZoom: false },
        behaviors: ['zoom-canvas', 'drag-canvas'],
        theme,
      });
      await graph.render();
      graph.fitView({ padding: 24 });
      graphs.push(graph);
    }
  };

  const fitGraphs = () => {
    graphs.forEach((graph) => graph.fitView({ padding: 24 }));
  };

  const updateView = (view: string) => {
    for (const theme of ['light', 'dark'] as const) {
      graphCards.get(theme)!.card.style.display =
        view === 'light + dark' || view === theme ? 'flex' : 'none';
    }
    grid.style.gridTemplateColumns = view === 'light + dark' ? '1fr 1fr' : '1fr';
  };

  await renderGraphs();
  updateView('light + dark');
  const ui = createDemoPanel(root);
  ui.addChoice<NodeType>('Node', ['circle', 'rect'], nodeType, (value) => {
    nodeType = value;
    void renderGraphs();
  });
  ui.addChoice<EdgeType>('Edge', ['line', 'arc', 'cubic', 'polyline'], edgeType, (value) => {
    edgeType = value;
    void renderGraphs();
  });
  ui.addChoice('View', ['light + dark', 'light', 'dark'], 'light + dark', updateView);

  return {
    getData: () => ({ views: graphs.map((graph) => graph.getData()) }),
    fitView() {
      fitGraphs();
    },
    destroy() {
      ui.destroy();
      graphs.forEach((graph) => graph.destroy());
      graphs = [];
      root.replaceChildren();
    },
  };
}
```


## Related documentation

- [Theme guide](/en/docs/guides/theme)
- [State methods](/en/docs/api/graph#graph-states)