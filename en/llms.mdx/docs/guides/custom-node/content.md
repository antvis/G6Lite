# Custom nodes (/en/docs/guides/custom-node)



```ts
import { register } from '@antv/g6-lite';

register('node', 'status-node', {
  type: 'rect',
  style: { width: 96, height: 34, borderRadius: 8 },
});
```

Prefer `node.style` and `stateStyles` when only color, size, stroke, label, or state appearance changes. `BaseNode` and `registerNode()` remain beta compatibility APIs; new extensions should use `register('node', ...)`.
