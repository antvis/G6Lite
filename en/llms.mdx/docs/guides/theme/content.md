# Themes (/en/docs/guides/theme)



```ts
theme: 'dark';
```

Override only the tokens your product needs:

```ts
theme: {
  type: 'light',
  nodeFill: '#1783FF',
  edgeStroke: '#AAB7C4',
  canvasBackground: '#F7F9FC',
}
```

Explicit node and edge styles take precedence over theme defaults. Keep application design tokens in one place and map them to G6Lite theme tokens.

## Default visual semantics [#default-visual-semantics]

G6Lite uses the light preset when `theme` is omitted:

* The default node size is `24` and the primary AntV color is `#1783FF`.
* The light canvas is white with low-contrast blue-gray edges. The dark canvas is `#1a1a1a` with brighter blue-gray edges.
* `active`, `selected`, and `highlight` use emphasis colors, outlines, or halos without changing node size or base edge width.
* `inactive` and `disabled` reduce opacity while preserving graph context.
* Labels are opt-in and render only when `node.style.label` or `edge.style.label` is configured.

Open [Default themes and interaction states](/en/docs/examples/default-theme) to inspect both presets and all six built-in states side by side.
