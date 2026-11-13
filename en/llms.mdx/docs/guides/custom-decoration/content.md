# Custom node decorations (/en/docs/guides/custom-decoration)





Use builtin-badge for existing counts, icons, and text badges. Register DecorationRenderer for custom content; the engine owns positioning, stacking, and overflow.

## Measure, draw, and register [#measure-draw-and-register]

measure returns full finite positive bounds. This example converts a fixed CSS font using DPR and caches calculations in layout.data. draw is centered on the decoration and explicitly sets fonts, colors, and alignment.



```ts
const pill: DecorationRenderer = {
  measure({ ctx, data, dpr }) {
    const text = String(data ?? '');
    ctx.font = 12 * dpr + 'px sans-serif';
    return { width: ctx.measureText(text).width + 12 * dpr, height: 22 * dpr, data: { text, unit: dpr } };
  },
  draw({ ctx, layout }) {
    const value = layout.data as { text: string; unit: number } | undefined;
    if (!value) return;
    ctx.fillStyle = '#e6f4ff';
    ctx.fillRect(-layout.width / 2, -layout.height / 2, layout.width, layout.height);
    ctx.font = 12 * value.unit + 'px sans-serif';
    ctx.fillStyle = '#0958d9';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(value.text, 0, 0);
  },
};
register('decoration', 'docs-pill', pill);
```

**Complete runnable code**

```ts
import { Graph, register, type DecorationRenderer } from '@antv/g6-lite';

// #region renderer
const pill: DecorationRenderer = {
  measure({ ctx, data, dpr }) {
    const text = String(data ?? '');
    ctx.font = 12 * dpr + 'px sans-serif';
    return { width: ctx.measureText(text).width + 12 * dpr, height: 22 * dpr, data: { text, unit: dpr } };
  },
  draw({ ctx, layout }) {
    const value = layout.data as { text: string; unit: number } | undefined;
    if (!value) return;
    ctx.fillStyle = '#e6f4ff';
    ctx.fillRect(-layout.width / 2, -layout.height / 2, layout.width, layout.height);
    ctx.font = 12 * value.unit + 'px sans-serif';
    ctx.fillStyle = '#0958d9';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(value.text, 0, 0);
  },
};
register('decoration', 'docs-pill', pill);
// #endregion renderer

export async function run(container: HTMLElement) {
  const graph = new Graph({
    container,
    data: {
      nodes: [{ id: 'A', x: 0, y: 0 }, { id: 'B', x: 260, y: 0 }],
      edges: [{ source: 'A', target: 'B' }],
    },
    node: {
      style: { size: 40, label: (node) => node.id, labelPlacement: 'center', labelColor: '#fff' },
      // #region placement
      decorations: [{
        renderer: 'docs-pill', placement: 'right', attachment: 'outside',
        layout: 'stack', sort: 'width-desc', itemGap: 4, maxVisible: 3,
        overflow: 'hover-expand', overflowData: (count: number) => '+' + count,
        items: (node) => node.id === 'A' ? ['CPU 42%', 'API', 'DB', 'Cache', 'Queue'] : ['Ready'],
        hideOnCollision: false,
      }],
      // #endregion placement
    },
    behaviors: ['zoom-canvas', 'drag-canvas'],
    autoFit: { padding: 96, maxZoom: 1 },
  });
  try { await graph.render(); return graph; }
  catch (error) { graph.destroy(); throw error; }
}
```



A has five items, B only Ready. A initially shows two items and +3. Hover its decoration region to expand all; leave to collapse. Expand full code for items and placement.

## Position and stack [#position-and-stack]

1. Match renderer to its registration. Use data for one item and items for a stack.
2. placement chooses the side; attachment chooses boundary or outside positioning.
3. layout: 'stack' enables vertical items; sort, maxVisible, and overflow control visibility. maxVisible includes the overflow item: 3 shows two items plus +3 here.
4. overflowData goes to the same renderer, which must also support that input.

Do not reimplement node positioning, sorting, or overflow inside the renderer. See [decoration configuration](/en/docs/api/options#config-node-decoration) for offsets, anchors, ratios, and defaults.

## Collisions and updates [#collisions-and-updates]

The example disables decoration collision hiding for comparison. In real data, choose by density; hideOnCollision: false can overlap and does not reserve decoration collision-grid space. minZoom is independent of label policy.

Update callback-driven items through public data methods, not shared renderer state. Input node dimensions are already in screen units. This example deliberately uses fixed CSS text and converts by dpr only. See [DecorationRenderer](/en/docs/api/extensions#decorationrenderer) for units.

## Common questions [#common-questions]

### Why is there no fallback text? [#why-is-there-no-fallback-text]

Unknown renderers, invalid measurements, and exceptions skip decoration content rather than using Label fallback. Check diagnostics, minZoom, hidden states, and collisions.

### Why did measurement not lead to drawing? [#why-did-measurement-not-lead-to-drawing]

Culling, collision, or overflow selection can skip draw. Keep measurement pure rather than treating invocation counts as business state.

### Can I use the built-in badge instead? [#can-i-use-the-built-in-badge-instead]

Yes; see [node badges](/en/docs/examples/decoration-badges). Reuse existing visuals before implementing a renderer.

**Related runnable examples**

* [Node badges](/en/docs/examples/decoration-badges)
