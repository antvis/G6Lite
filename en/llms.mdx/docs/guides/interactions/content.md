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
