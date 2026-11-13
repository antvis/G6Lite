# Themes (/en/docs/guides/theme)





Use `theme` for default node, edge, and canvas colors. Choose light / dark, then override brand tokens; assign style functions to fields in `node.style` or `edge.style` for data-driven colors. All fields and defaults are in the [Theme reference](/en/docs/api/options#options-theme).

## Use a preset [#use-a-preset]

The complete code below renders the canvas above it. Choose light, dark, or brand to compare backgrounds, node sizes, and selection. Reset restores light. Switching calls updateOptions on the same graph instance.



```ts
import { Graph, resolveTheme, type ThemeOption } from '@antv/g6-lite';
import GUI from 'lil-gui';

export async function run(container: HTMLElement) {
  // #region theme-options
  const themes: Record<string, ThemeOption> = {
    light: 'light',
    dark: 'dark',
    brand: {
      type: 'light', nodeFill: '#00A876', nodeSize: 36,
      edgeStroke: '#00A876', edgeLineWidth: 2, canvasBackground: '#F1F8F5',
      nodeStateStyles: {
        ...resolveTheme('light').nodeStateStyles,
        selected: { stroke: '#005C41', strokeWidth: 3, haloWidth: 12 },
      },
    },
  };
  // #endregion theme-options
  const graph = new Graph({
    container,
    theme: themes.light,
    data: {
      nodes: [
        { id: 'Default', x: 0, y: 0 },
        { id: 'Selected', x: 160, y: 0, states: ['selected'] },
        { id: 'Disabled', x: 320, y: 0, states: ['disabled'] },
      ],
      edges: [{ source: 'Default', target: 'Selected' }, { source: 'Selected', target: 'Disabled' }],
    },
    node: { style: { label: (node) => node.id, labelColor: '#334155', labelOffsetY: 8 } },
    behaviors: [],
    autoFit: { padding: 56, maxZoom: 1 },
  });
  const ui = createDemoPanel(container);
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => { ui.destroy(); destroy(); };
  try {
    await graph.render();
    ui.addChoice('Theme', Object.keys(themes), 'light', (value) => {
      graph.updateOptions({
        theme: themes[value],
        node: { style: { labelColor: value === 'dark' ? '#E2E8F0' : '#334155' } },
      });
      // Keep non-white theme backgrounds accurate inside the dotted docs canvas.
      graph.getCanvas().style.mixBlendMode = value === 'light' ? 'multiply' : 'normal';
    });
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}


export function createDemoPanel(container: string | HTMLElement, description = '') {
  const host = typeof container === 'string' ? document.querySelector<HTMLElement>(container)! : container;
  if (getComputedStyle(host).position === 'static') host.style.position = 'relative';

  let gui: GUI | undefined;
  const getGui = () => {
    if (!gui) {
      gui = new GUI({ container: host, width: 160 });
      gui.domElement.classList.add('g6lite-demo-controls');
      gui.domElement.dataset.captureIgnore = '';
      Object.assign(gui.domElement.style, {
        position: 'absolute',
        top: '10px',
        right: '10px',
        zIndex: '30',
        maxWidth: 'calc(100% - 20px)',
        maxHeight: 'calc(100% - 20px)',
      });
    }
    return gui;
  };

  let status: HTMLDivElement | undefined;
  const setStatus = (message: string) => {
    if (!status) {
      status = document.createElement('div');
      status.setAttribute('role', 'status');
      status.dataset.role = 'status';
      status.dataset.captureIgnore = '';
      status.style.cssText =
        'position:absolute;left:12px;bottom:10px;z-index:20;max-width:min(28rem,calc(100% - 24px));color:#64748b;font:12px/1.45 system-ui,sans-serif;pointer-events:none;white-space:pre-wrap;';
      host.append(status);
    }
    status.textContent = message;
  };
  if (description) setStatus(description);

  return {
    get gui() {
      return getGui();
    },
    addAction(label: string, action: () => void, folder = getGui()) {
      return folder.add({ [label]: action }, label);
    },
    addChoice<T extends string>(
      label: string,
      choices: readonly T[] | Record<string, T>,
      value: T,
      onChange: (value: T) => void,
    ) {
      const options = Array.isArray(choices) ? [...choices] : choices;
      return getGui().add({ value }, 'value', options).name(label).onChange(onChange);
    },
    setStatus,
    destroy() {
      gui?.destroy();
      status?.remove();
    },
  };
}
```



## Override tokens [#override-tokens]

Map application brand colors to a ThemeOption and pass it as new Graph's theme. Include only tokens you need to change:

```ts
import type { ThemeOption } from '@antv/g6-lite';

const brandTheme: ThemeOption = {
  type: 'light',
  nodeFill: '#00A876',
  nodeSize: 36,
  edgeStroke: '#00A876',
  edgeLineWidth: 2,
  canvasBackground: '#F1F8F5',
};
```

State maps are replaced in full. To retain preset states such as disabled, construct a new map using the [spread pattern](/en/docs/api/options#precedence).

## Precedence [#precedence]

Both nodes' explicit green fill overrides the theme's blue. Selected uses the orange outline from node.stateStyles.selected. That entire state object is chosen, without filling in the theme's purple selected fill, so the node stays green.



```ts
import { Graph } from '@antv/g6-lite';

export async function run(container: HTMLElement) {
  const graph = new Graph({
    container,
    data: {
      nodes: [
        { id: 'Base style', x: 0, y: 0 },
        { id: 'Selected', x: 180, y: 0, states: ['selected'] },
      ],
      edges: [{ source: 'Base style', target: 'Selected' }],
    },
    theme: {
      type: 'light', nodeFill: '#1783FF',
      nodeStateStyles: { selected: { fill: '#873BF4', stroke: '#873BF4' } },
    },
    node: {
      style: { fill: '#00A876', size: 36, label: (node) => node.id, labelOffsetY: 8 },
      stateStyles: { selected: { stroke: '#F08F56', strokeWidth: 3 } },
    },
    behaviors: [],
    autoFit: { padding: 56, maxZoom: 1 },
  });
  try {
    await graph.render();
    return graph;
  } catch (error) {
    graph.destroy();
    throw error;
  }
}
```



## Switch themes [#switch-themes]

Update the theme and label colors together on an existing graph instance:

```ts
graph.updateOptions({
  theme: 'dark',
  node: { style: { labelColor: '#E2E8F0' } },
  edge: { style: { labelColor: '#E2E8F0' } },
});
```

Each theme replaces the previous theme option. To retain brand tokens, pass `{ ...brandTheme, type: 'dark', canvasBackground: '#1a1a1a' }`; those explicit brand tokens will also continue to override the dark preset.

Switching refreshes styles while preserving graph data, states, and the camera. It does not rerun layout or fit the graph. Synchronize system dark mode, page CSS, and Combo styles in the application; check contrast for label backgrounds, icons, and decorations too.

## Default visual semantics [#default-visual-semantics]

Omitting theme selects light, with default node size 24. Labels require configured text, and their colors do not automatically follow the theme. See the [Theme reference](/en/docs/api/options#state-presets) for defaults and state styles, or compare all built-in states in [Default themes and interaction states](/en/docs/examples/default-theme).

## Common questions [#common-questions]

### Why did changing nodeFill leave the nodes unchanged? [#why-did-changing-nodefill-leave-the-nodes-unchanged]

Check node.style.fill and custom extension defaults first: they take precedence over theme defaults. For selected or other states, also check that state's fill.

### Why is text hard to read after switching to dark? [#why-is-text-hard-to-read-after-switching-to-dark]

Themes have no label-color token. Update node/edge.style.labelColor too; custom labels and backgrounds also need colors suitable for the dark canvas.

### Why did disabled lose its dimming when I changed only selected? [#why-did-disabled-lose-its-dimming-when-i-changed-only-selected]

Passing nodeStateStyles replaces the entire preset map. Spread the original map before changing selected. Do not mutate shared state objects in the resolveTheme result.

## Related [#related]

* [Theme reference](/en/docs/api/options#options-theme): tokens, presets, precedence, and resolveTheme.
* [Nodes](/en/docs/guides/node) · [Edges](/en/docs/guides/edge): data-driven appearance.
* [Labels and icons](/en/docs/guides/label) · [Combos](/en/docs/guides/combo): coordinate other visual elements.

**Related runnable examples**

* [Default themes and interaction states](/en/docs/examples/default-theme)
