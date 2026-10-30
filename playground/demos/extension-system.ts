/**
 * Demo: public extension APIs working together without internal imports.
 */
import {
  extensionFactory,
  Graph,
  register,
  type BehaviorExtension,
  type BehaviorOptions,
  type DecorationRenderer,
  type ElementState,
  type ExtensionContext,
  type GraphData,
  type GraphNode,
  type LayoutExtension,
  type NodeBadgeItem,
  type PluginExtension,
  type PluginOptions,
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

const BUSINESS_CLICK_BEHAVIOR = 'business-click' as const;

interface BusinessClickBehaviorOptions extends BehaviorOptions<typeof BUSINESS_CLICK_BEHAVIOR> {
  state?: ElementState;
  compactSize?: number;
  expandedSize?: number;
}

function createBusinessClickBehavior(): BehaviorExtension<BusinessClickBehaviorOptions> {
  let context: ExtensionContext | undefined;
  let state: ElementState = 'selected';
  let compactSize = 32;
  let expandedSize = 68;

  return {
    init(nextContext, options) {
      context = nextContext;
      state = options.state ?? 'selected';
      compactSize = options.compactSize ?? 32;
      expandedSize = options.expandedSize ?? 68;
    },
    getEvents() {
      return {
        'node:click': ({ nodeId }) => {
          if (!context) return;
          context.state.set(nodeId, [state]);
          const node = context.data.getNode(nodeId);
          const currentSize = Number(node?.data?.size ?? 44);
          context.data.updateNode(nodeId, {
            size: currentSize >= expandedSize ? compactSize : expandedSize,
          });
        },
        'canvas:click': () => {
          if (!context) return;
          const stateMap = Object.fromEntries(context.data.getNodeIds().map((id) => [id, []]));
          context.state.setAll(stateMap);
        },
      };
    },
    destroy() {
      context = undefined;
    },
  };
}

const EXTENSION_HINT_PLUGIN = 'extension-hint' as const;

interface ExtensionHintPluginOptions extends PluginOptions<typeof EXTENSION_HINT_PLUGIN> {
  text?: string;
}

function createExtensionHintPlugin(): PluginExtension<ExtensionHintPluginOptions> {
  let hint: HTMLElement | undefined;
  let text = '点击节点切换 32px / 68px · 悬停 ··· 展开徽章';

  return {
    init(_context, options) {
      text = options.text ?? text;
    },
    mount(container) {
      hint = document.createElement('div');
      hint.className = 'g6lite-extension-demo-hint';
      hint.textContent = text;
      Object.assign(hint.style, {
        position: 'absolute',
        left: '12px',
        top: '12px',
        zIndex: '20',
        maxWidth: 'calc(100% - 24px)',
        color: '#64748b',
        font: '12px/1.4 system-ui, sans-serif',
        pointerEvents: 'none',
      });
      container.appendChild(hint);
    },
    destroy() {
      hint?.remove();
      hint = undefined;
    },
  };
}

register('decoration', 'external-name', externalNameRenderer);
register('edge', 'business-relation', {
  base: 'arc',
  style: { stroke: '#91caff', lineWidth: 2, curvature: 0.18, endArrow: true },
  stateStyles: { selected: { stroke: '#1677ff', lineWidth: 3 } },
});
register('layout', 'horizontal-business', extensionFactory(() => ({ ...horizontalLayout })));
register(
  'transform',
  'normalize-business-data',
  extensionFactory(() => ({ ...normalizeData })),
);
register('behavior', BUSINESS_CLICK_BEHAVIOR, extensionFactory(createBusinessClickBehavior));
register('plugin', EXTENSION_HINT_PLUGIN, extensionFactory(createExtensionHintPlugin));

export async function run(container: string | HTMLElement) {
  // Padding keeps the boundary badges (star, count pill) off the canvas edge.
  const viewPadding = 40;
  const graph = new Graph({
    autoFit: { padding: viewPadding, maxZoom: 1.5 },
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
    behaviors: [
      'drag-canvas',
      'zoom-canvas',
      {
        type: BUSINESS_CLICK_BEHAVIOR,
        state: 'selected',
        compactSize: 32,
        expandedSize: 68,
      } satisfies BusinessClickBehaviorOptions,
    ],
    plugins: [
      {
        type: EXTENSION_HINT_PLUGIN,
        text: '点击节点切换 32px / 68px · 悬停 ··· 展开徽章',
      } satisfies ExtensionHintPluginOptions,
    ],
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
          placement: (node: GraphNode) =>
            (node.data?.namePlacement as 'left' | 'right' | 'bottom' | undefined) ?? 'bottom',
          attachment: 'outside',
          data: (node: GraphNode) => String(node.data?.label ?? node.id),
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
  // The business-click behavior toggles node sizes between 32 and 68; refit
  // after each toggle so resized nodes and their badges stay inside the view.
  graph.on('node:click', () => {
    graph.fitView({ padding: viewPadding, maxZoom: 1.5 });
  });
  return graph;
}
