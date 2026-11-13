# Custom Label Renderer (/en/docs/guides/custom-label-renderer)





Use LabelRenderer for multiline, rich, or custom-truncated content; prefer [label configuration](/en/docs/guides/label) for ordinary text. One renderer below draws node names/cities and edge protocols/types.

## Register and activate [#register-and-activate]

1. measure sets its font and calculates full bounds including background padding; cache lines in layout.data.
2. draw explicitly sets fonts and colors and paints near the origin, without relying on Canvas state left by measure.
3. Register a label name, set node.labelRenderer / edge.labelRenderer, and provide nonempty label text.



```ts
const multilineRenderer: LabelRenderer<MultilineLayoutData> = {
  measure({ ctx, text, style }) {
    ctx.font = `${style.labelFontWeight} ${style.labelFontSize}px ${style.labelFontFamily}`;
    const lines = text.split('\n');
    const lineHeight = style.labelFontSize * 1.2;
    const contentWidth = Math.max(...lines.map((line) => ctx.measureText(line).width));
    const padding = style.labelBackgroundPadding;
    return {
      width: contentWidth + padding * 2,
      height: lines.length * lineHeight + padding * 2,
      data: { lines, lineHeight, contentWidth },
    };
  },
  draw({ ctx, style, layout }) {
    const data = layout.data;
    if (!data) return;
    if (style.labelBackground) {
      ctx.fillStyle = style.labelBackground;
      ctx.fillRect(-layout.width / 2, -layout.height / 2, layout.width, layout.height);
    }
    ctx.font = `${style.labelFontWeight} ${style.labelFontSize}px ${style.labelFontFamily}`;
    ctx.fillStyle = style.labelColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    data.lines.forEach((line, index) => {
      const y = (index - (data.lines.length - 1) / 2) * data.lineHeight;
      ctx.fillText(line, 0, y);
    });
  },
};

register('label', 'demo-multiline', multilineRenderer);
```

**Complete runnable code**

```ts
/**
 * Demo: unified custom node/edge LabelRenderer lifecycle.
 * The multiline behavior lives entirely in this demo, not in G6Lite core.
 */
import { Graph, register, type LabelRenderer } from '@antv/g6-lite';

interface MultilineLayoutData {
  lines: string[];
  lineHeight: number;
  contentWidth: number;
}

// #region renderer
const multilineRenderer: LabelRenderer<MultilineLayoutData> = {
  measure({ ctx, text, style }) {
    ctx.font = `${style.labelFontWeight} ${style.labelFontSize}px ${style.labelFontFamily}`;
    const lines = text.split('\n');
    const lineHeight = style.labelFontSize * 1.2;
    const contentWidth = Math.max(...lines.map((line) => ctx.measureText(line).width));
    const padding = style.labelBackgroundPadding;
    return {
      width: contentWidth + padding * 2,
      height: lines.length * lineHeight + padding * 2,
      data: { lines, lineHeight, contentWidth },
    };
  },
  draw({ ctx, style, layout }) {
    const data = layout.data;
    if (!data) return;
    if (style.labelBackground) {
      ctx.fillStyle = style.labelBackground;
      ctx.fillRect(-layout.width / 2, -layout.height / 2, layout.width, layout.height);
    }
    ctx.font = `${style.labelFontWeight} ${style.labelFontSize}px ${style.labelFontFamily}`;
    ctx.fillStyle = style.labelColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    data.lines.forEach((line, index) => {
      const y = (index - (data.lines.length - 1) / 2) * data.lineHeight;
      ctx.fillText(line, 0, y);
    });
  },
};

register('label', 'demo-multiline', multilineRenderer);
// #endregion renderer

export async function run(container: string | HTMLElement) {
  const graph = new Graph({
    // Labels are two lines and hang below nodes (labelPlacement: 'bottom');
    // the bottom padding reserves their height so they stay inside the view.
    autoFit: { padding: [24, 48, 64, 48] },
    container,
    data: {
      nodes: [
        { id: 'source', data: { label: 'Source Service\nShanghai' } },
        { id: 'gateway', data: { label: 'API Gateway\nPrimary' } },
        { id: 'target', data: { label: 'Target Store\nHangzhou' } },
      ],
      edges: [
        { source: 'source', target: 'gateway', data: { label: 'HTTPS\nrequest' } },
        { source: 'gateway', target: 'target', data: { label: 'RPC\nresponse' } },
      ],
    },
    layout: { type: 'dagre', rankdir: 'LR', nodeSize: 32, ranksep: 180 },
    behaviors: ['zoom-canvas', 'drag-canvas', 'drag-node'],
    // #region node-label
    node: {
      labelRenderer: 'demo-multiline',
      style: {
        size: 32,
        label: (node) => String(node.data?.label ?? node.id),
        labelPlacement: 'bottom',
        labelFontSize: 12,
        labelBackground: 'rgba(255,255,255,0.92)',
        labelBackgroundPadding: 4,
      },
    },
    // #endregion node-label
    // #region edge-label
    edge: {
      type: 'arc',
      labelRenderer: 'demo-multiline',
      style: {
        label: (_source, _target, edge) => String(edge.data?.label ?? ''),
        labelFontSize: 10,
        labelBackground: 'rgba(255,255,255,0.9)',
        labelBackgroundPadding: 3,
        labelAutoRotate: true,
      },
    },
    // #endregion edge-label
  });
  await graph.render();
  return graph;
}
```



Drag nodes or zoom to inspect both lines and backgrounds. Expand the complete source for both activation configurations. The engine handles position, rotation, scale policy, and collisions.

## Protocol [#protocol]

Inputs include text, resolved style, ctx, dpr, and zoom. type='node' provides node; type='edge' provides edge / source / target. Narrow type before using category-specific fields. See [LabelRenderer](/en/docs/api/extensions#labelrenderer).

Font sizes, offsets, and padding in style already use backing-store pixels; do not multiply by DPR or zoom. The draw origin is the label center and edge rotation is already applied.

Return finite positive dimensions covering all content. layout.data caches only this measurement. Culling or collisions may skip drawing; measure should not change business state. Implement backgrounds and truncation yourself; labelMaxWidth does not automatically clip custom text.

## Common questions [#common-questions]

### Why was text skipped? [#why-was-text-skipped]

Check nonempty label, hidden states, low-zoom thresholds, and collisions before assuming failure. Temporarily disable policies for diagnosis, then restore useful density limits.

### What happens for invalid dimensions or drawing errors? [#what-happens-for-invalid-dimensions-or-drawing-errors]

The current label falls back to default single-line rendering with diagnostics. Do not return 0, NaN, or infinite dimensions. Decoration failures behave differently; see [drawing contracts](/en/docs/api/extensions#extension-drawing).

### Do edge labels always follow the rendered path? [#do-edge-labels-always-follow-the-rendered-path]

Current polyline / cubic positions and rotations use the endpoint chord and may not follow routed paths. See [edge labels](/en/docs/guides/edge#edge-labels).

See the complete [custom label example](/en/docs/examples/custom-label-renderer) and [registration](/en/docs/api/graph#extension-registration) for shared caching.

**Related runnable examples**

* [Custom label renderer](/en/docs/examples/custom-label-renderer)
