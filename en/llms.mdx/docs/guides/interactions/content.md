# Interaction configuration (/en/docs/guides/interactions)



Without an explicit list, G6-GL enables zoom and canvas dragging. Passing `behaviors: []` disables the defaults.

```ts
behaviors: [
  'zoom-canvas',
  'drag-canvas',
  'drag-node',
  'click-select',
  'hover-highlight',
  'tooltip',
];
```

Each behavior can be a string or an object with options. Picking and element event dispatch are shared, so behaviors consume one consistent interaction stream. See [events](/en/docs/guides/events).

`BuiltInBehaviorOptionsMap` maps each built-in name to its supported object configuration, while `BuiltInBehaviorConfig` is the union of all built-in configurations. Custom Behaviors should declare a literal `type`, a dedicated options type, and use `satisfies` at activation sites.

## Built-in Behaviors [#built-in-behaviors]

* `zoom-canvas`: wheel zoom.
* `drag-canvas`: canvas panning.
* `drag-node`: node movement and Combo group dragging.
* `drag-edge`: edge endpoint reconnection.
* `click-select`: node and edge selection.
* `hover-highlight`, `highlight-node`, and `highlight-edge`: analytical highlighting.
* `brush-select` and `lasso-select`: area selection.
* `tooltip`: hover- or click-triggered information overlay.

## Event dispatch [#event-dispatch]

The internal interaction dispatcher performs one shared pick and emits normalized events in node → edge → combo → canvas priority. Click, double-click, context-menu, wheel, and hover events can be observed without enabling a separate click Behavior.

```ts
graph.on('node:click', ({ nodeId }) => {
  console.log(nodeId);
});
```

See [Custom Behavior](/en/docs/guides/custom-behavior) for the typed factory and registration pattern, and [Extension system](/en/docs/guides/extensions) for category boundaries and lifecycle rules.
