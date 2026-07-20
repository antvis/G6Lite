/**
 * Demo: public extension APIs working together without internal imports.
 */
import {
  Graph,
  register,
  type BehaviorExtension,
  type DecorationRenderer,
  type GraphData,
  type LayoutExtension,
  type NodeBadgeItem,
  type PluginExtension,
  type TransformExtension,
} from '../../src/index.ts';

const externalNameRenderer: DecorationRenderer<string> = {
  measure({ ctx, data }) {
    ctx.font = 'bold 11px sans-serif';
    return { width: ctx.measureText(data).width, height: 14 };
  },
  draw({ ctx, data }) {
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#1f1f1f';
    ctx.fillText(data, 0, 0);
  },
};

const horizontalLayout: LayoutExtension = {
  execute(data) {
    return {
      nodes: data.nodes.map((node, index) => ({ ...node, x: 120 + index * 180, y: 180 })),
    };
  },
};

const normalizeData: TransformExtension = {
  beforeRender(data: GraphData) {
    return {
      ...data,
      nodes: data.nodes.map((node) => ({
        ...node,
        data: { score: 0, ...node.data },
      })),
    };
  },
};

const clickBehavior: BehaviorExtension = {
  init(context) {
    this.context = context;
  },
  getEvents() {
    return {
      'node:click': (event) => {
        if (!event.targetId) return;
        const graph = this.context?.graph;
        if (!graph) return;
        graph.setElementStates(event.targetId, ['selected']);
        const node = graph.getNodeData(event.targetId);
        const currentSize = Number(node?.data?.size ?? 44);
        graph.updateNodeData(event.targetId, { size: currentSize >= 60 ? 32 : 68 });
      },
      'canvas:click': () => {
        const graph = this.context?.graph;
        if (!graph) return;
        const stateMap = Object.fromEntries(graph.getNodes().map((node) => [node.id, []]));
        graph.setElementStates(stateMap);
      },
    };
  },
} as BehaviorExtension & { context?: Parameters<NonNullable<BehaviorExtension['init']>>[0] };

const extensionHintPlugin: PluginExtension = {
  mount(container) {
    const hint = document.createElement('div');
    hint.className = 'g6lite-extension-demo-hint';
    hint.textContent = '点击节点切换 32px / 68px，悬停 ··· 展开';
    Object.assign(hint.style, {
      position: 'absolute',
      left: '12px',
      top: '12px',
      padding: '6px 10px',
      border: '1px solid #d9d9d9',
      borderRadius: '6px',
      background: '#fff',
      color: '#595959',
      fontSize: '12px',
      pointerEvents: 'none',
    });
    container.appendChild(hint);
    this.hint = hint;
  },
  destroy() {
    this.hint?.remove();
  },
} as PluginExtension & { hint?: HTMLElement };

register('decoration', 'external-name', externalNameRenderer);
register('edge', 'business-relation', {
  base: 'arc',
  style: { stroke: '#91caff', lineWidth: 2, curvature: 0.18, endArrow: true },
  stateStyles: { selected: { stroke: '#1677ff', lineWidth: 3 } },
});
register('layout', 'horizontal-business', () => ({ ...horizontalLayout }));
register('transform', 'normalize-business-data', () => ({ ...normalizeData }));
register('behavior', 'business-click', () => ({ ...clickBehavior }));
register('plugin', 'extension-hint', () => ({ ...extensionHintPlugin }));

export async function run(container: string | HTMLElement) {
  const graph = new Graph({
    container,
    data: {
      nodes: [
        {
          id: 'customer',
          data: {
            label: '客户',
            size: 44,
            namePlacement: 'bottom',
            badges: [
              { kind: 'text', text: '待问题排查' },
              { kind: 'count', value: 12 },
              { kind: 'warning' },
              { kind: 'favorite' },
              { kind: 'lock' },
            ] satisfies NodeBadgeItem[],
          },
        },
        {
          id: 'order',
          data: {
            label: '订单',
            size: 44,
            namePlacement: 'right',
            badges: [
              { kind: 'lock' },
              { kind: 'text', text: '待排查' },
            ] satisfies NodeBadgeItem[],
          },
        },
        {
          id: 'product',
          data: {
            label: '商品',
            size: 44,
            namePlacement: 'left',
            badges: [
              { kind: 'favorite' },
              { kind: 'icon', icon: '★' },
            ] satisfies NodeBadgeItem[],
          },
        },
      ],
      edges: [
        { id: 'customer-order', source: 'customer', target: 'order' },
        { id: 'order-product', source: 'order', target: 'product' },
      ],
    },
    transforms: ['normalize-business-data'],
    layout: { type: 'horizontal-business' },
    behaviors: ['drag-canvas', 'zoom-canvas', 'business-click'],
    plugins: [{ type: 'extension-hint' }],
    node: {
      style: {
        size: (node) => Number(node.data?.size ?? 44),
        fill: '#e6f4ff',
        stroke: '#1677ff',
        label: (node) => String(node.data?.label ?? node.id),
        labelPlacement: 'center',
      },
      stateStyles: { selected: { fill: '#bae0ff', strokeWidth: 3 } },
      decorations: [
        {
          renderer: 'external-name',
          placement: (node) =>
            (node.data?.namePlacement as 'left' | 'right' | 'bottom' | undefined) ?? 'bottom',
          attachment: 'outside',
          data: (node) => String(node.data?.label ?? node.id),
        },
        {
          renderer: 'builtin-badge',
          placement: (node) => (node.data?.namePlacement === 'left' ? 'left' : 'right'),
          attachment: 'boundary',
          anchor: 'start',
          boundaryOverlap: 'half-badge',
          crossOffsetRatio: 0,
          layout: 'stack',
          sort: 'width-desc',
          maxVisible: 3,
          overflow: 'hover-expand',
          itemGap: 2,
          overflowData: { kind: 'text', text: '···' },
          items: (node) => (node.data?.badges as NodeBadgeItem[] | undefined) ?? [],
        },
      ],
    },
    edge: { type: 'business-relation' },
  });
  await graph.render();
  return graph;
}
