# Worker layout guide (/en/docs/guides/layout-worker)





A Worker moves layout computation off the main thread so the canvas can stay responsive. See [Common layout options](/en/docs/guides/layout) for algorithm parameters.

## Enable a Worker [#enable-a-worker]

```ts
layout: { type: 'force-atlas2', worker: true, maxIteration: 100 },
```

| layout.worker | Graph behavior                                                                                                                      |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Omitted       | Attempts a Worker at ≥ 1000 nodes; main thread below that threshold                                                                 |
| true          | Attempts a Worker for library layouts; registered extensions and three built-in tree layouts still execute on the main thread first |
| false         | Explicitly disables Workers, including for large graphs                                                                             |

Standalone runLayout has no node-count-based automatic switch. Worker failures fall back to the same main-thread algorithm. See the [layout reference](/en/docs/guides/layout#worker) for execution order and iteration defaults.

## Code and rendered result [#code-and-rendered-result]

The initial grid has 160 nodes. Run Worker requests ForceAtlas2; Grid restores the grid. Start + cancel starts a longer task, cancels after 20ms, then rearranges as a grid. The final status should remain cancelled → grid ready without being overwritten by stale results.



```ts
import { Graph, type LayoutConfig } from '@antv/g6-lite';
import GUI from 'lil-gui';

export async function run(container: HTMLElement) {
  const grid: LayoutConfig = { type: 'grid', rows: 10, cols: 16, width: 400, height: 200, worker: false };
  const graph = new Graph({
    container,
    data: {
      nodes: Array.from({ length: 160 }, (_, i) => ({ id: String(i) })),
      edges: Array.from({ length: 320 }, (_, i) => ({
        source: String(i % 160), target: String((i * 17 + 11) % 160),
      })).filter((edge) => edge.source !== edge.target),
    },
    layout: grid,
    node: { style: { size: 6 } },
    edge: { style: { endArrow: false, opacity: 0.2 } },
    behaviors: [],
    autoFit: { padding: 48, maxZoom: 1 },
  });
  const ui = createDemoPanel(container);
  let generation = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const arrange = async (config: LayoutConfig, name: string) => {
    const current = ++generation;
    ui.setStatus(`${name} running`);
    graph.setLayout(config);
    try {
      await graph.layout();
      if (current !== generation || graph.destroyed) return;
      graph.fitView({ padding: 48, maxZoom: 1 });
      ui.setStatus(`${name} ready`);
    } catch {
      if (current === generation && !graph.destroyed) ui.setStatus('layout failed');
    }
  };
  const force = (maxIteration: number): LayoutConfig => ({
    type: 'force-atlas2', worker: true, maxIteration, barnesHut: true, prune: false,
  });
  const destroy = graph.destroy.bind(graph);
  graph.destroy = () => { generation++; clearTimeout(timer); ui.destroy(); destroy(); };
  try {
    await graph.render();
    ui.setStatus('grid ready');
    ui.addAction('Run Worker', () => {
      clearTimeout(timer);
      void arrange(force(80), 'worker requested');
    });
    ui.addAction('Start + cancel', () => {
      clearTimeout(timer);
      void arrange(force(2000), 'worker requested');
      timer = setTimeout(() => {
        graph.cancelLayout();
        void arrange(grid, 'cancelled → grid');
      }, 20);
    });
    ui.addAction('Grid', () => {
      clearTimeout(timer);
      graph.cancelLayout();
      void arrange(grid, 'grid');
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



Completion indicates that the layout call finished. Check assets and threads below to establish whether a Worker actually ran.

## Transfer and fallback [#transfer-and-fallback]

Worker layout configuration, node data, and edge data must be structured-cloneable. Functions, DOM nodes, and similar values can make transfer fail. Explicitly use worker: false for algorithm callbacks. Node and edge style functions are not part of this transfer and can still control rendering.

The Worker receives only node id/x/y/data and edge source/target/data. Graph handles fx/fy when applying results; do not depend on omitted fields inside the Worker algorithm.

Creation, asset loading, postMessage cloning, or computation failures can trigger main-thread fallback. worker: true, layout:end, or a resolved await alone does not establish which thread performed computation.

## Cancellation and cleanup [#cancellation-and-cleanup]

After rendering, graph.cancelLayout() can terminate that instance's active Worker and discard results. It neither rolls back completed layouts nor affects another Graph's Worker. To continue, setLayout again and await layout.

The example's generation check also protects application-side completion messages and fitView from stale calls. Call graph.destroy() on unmount, and clean up your own controls, timers, and subscriptions.

## Deploy and verify [#deploy-and-verify]

1. npm ESM output includes layoutWorker.js and dependencies. Preserve their relative paths rather than deploying index.js alone.
2. Your bundler must recognize the module Worker's new URL entry. In Network, check successful Worker and algorithm asset requests with JavaScript responses, not an HTML fallback page.
3. Confirm a Worker in developer tools' thread list. For CSP-restricted applications, configure worker-src and script policy for actual asset origins; successful layout alone is insufficient.
4. The current UMD entry does not guarantee usable standalone Worker assets and can fall back. Prefer ESM and verify emitted assets when off-thread execution is required.

## Common questions [#common-questions]

### Why does the page still stall? [#why-does-the-page-still-stall]

Check for main-thread fallback, then measure computation and drawing separately. Transfer, rendering, and many labels are not eliminated by the worker option. Limit iterations and test representative data.

### Why do callbacks behave differently on small and large graphs? [#why-do-callbacks-behave-differently-on-small-and-large-graphs]

Large graphs can automatically attempt a Worker. Functions in layout configuration cannot be cloned, causing fallback. Explicitly disable Workers when callbacks are required to keep the path predictable.

### Does cancelLayout throw AbortError? [#does-cancellayout-throw-aborterror]

Graph discards cancelled task results; ordinary cancellation usually does not surface as an AbortError. A resolved Promise does not prove positions were applied. Check application task generations or destroyed state too.

Continue with the [Layout guide](/en/docs/guides/layout), [layout methods](/en/docs/api/graph#layout), or [Performance tuning](/en/docs/metrics/performance#performance-tuning).

**Related runnable examples**

* [Worker layout](/en/docs/examples/layout-worker)
