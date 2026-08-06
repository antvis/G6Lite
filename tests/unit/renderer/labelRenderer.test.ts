import { afterEach, describe, expect, it, vi } from 'vitest';
import type { DecorationRenderer } from '@src/extensions/contracts.js';
import { registerDecoration } from '@src/extensions/decoration.js';
import { registerLabelRenderer } from '@src/extensions/label.js';
import { registerNode } from '@src/extensions/node.js';
import { createQuadraticPath } from '@src/renderer/edgePath.js';
import {
  getBuiltInNodeBoundaryAnchor,
  getCustomNodeLabelAnchor,
  getLabelZoom,
  getNodeDecorationAnchor,
  isValidLabelLayout,
  LabelLayerRenderer,
  resolveEdgeLabelStyle,
  resolveNodeLabelStyle,
  toLabelScreenPx,
} from '@src/renderer/labelRenderer.js';
import type { EdgeConfig, GraphEdge, LabelRenderer, LayoutNode, NodeConfig } from '@src/types.js';

function makeContext() {
  const ctx = {
    clearRect: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    measureText: vi.fn((text: string) => ({ width: text.length * 10 })),
    fillRect: vi.fn(),
    fillText: vi.fn(),
    drawImage: vi.fn(),
    font: '',
    fillStyle: '',
    textAlign: 'start' as CanvasTextAlign,
    textBaseline: 'alphabetic' as CanvasTextBaseline,
    shadowColor: '',
    shadowBlur: 0,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
  } as unknown as CanvasRenderingContext2D;
  return ctx;
}

function createLayer(ctx: CanvasRenderingContext2D, dpr = 1) {
  Object.defineProperty(window, 'devicePixelRatio', { value: dpr, configurable: true });
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctx);
  const container = document.createElement('div');
  container.getBoundingClientRect = () => {
    return {
      left: 0,
      top: 0,
      width: 400,
      height: 300,
      right: 400,
      bottom: 300,
      x: 0,
      y: 0,
      toJSON() {},
    } as DOMRect;
  };
  const mainCanvas = document.createElement('canvas');
  const backingScale = Math.min(2, dpr);
  mainCanvas.width = 400 * backingScale;
  mainCanvas.height = 300 * backingScale;
  container.appendChild(mainCanvas);
  return new LabelLayerRenderer(container, mainCanvas);
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  Object.defineProperty(window, 'devicePixelRatio', { value: 1, configurable: true });
});

describe('LabelLayerRenderer construction', () => {
  it('fails clearly without leaving an overlay when a 2D context is unavailable', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    const container = document.createElement('div');
    const mainCanvas = document.createElement('canvas');
    container.appendChild(mainCanvas);

    expect(() => new LabelLayerRenderer(container, mainCanvas)).toThrow(/label canvas 2D context/);
    expect(container.children).toHaveLength(1);
  });
});

describe('LabelRenderer zoom scaling helpers', () => {
  it('clamps label zoom to a readable screen-space range', () => {
    expect(getLabelZoom(0.1)).toBe(0.25);
    expect(getLabelZoom(0.5)).toBe(0.5);
    expect(getLabelZoom(1)).toBe(1);
    expect(getLabelZoom(1.5)).toBe(1.5);
    expect(getLabelZoom(4)).toBe(2);
    expect(getLabelZoom(Number.NaN)).toBe(1);
  });

  it('converts label dimensions through dpr and clamped zoom', () => {
    expect(toLabelScreenPx(12, 2, 1)).toBe(12);
    expect(toLabelScreenPx(12, 2, 2)).toBe(24);
    expect(toLabelScreenPx(12, 2, 4)).toBe(48);
    expect(toLabelScreenPx(12, 2, 0.1)).toBe(6);
  });

  it('resolves label dimensions in screen space at neutral zoom', () => {
    const resolved = resolveNodeLabelStyle(
      {
        labelFontSize: 12,
        labelOffsetX: 3,
        labelBackgroundPadding: 2,
        labelMaxWidth: 80,
      },
      { id: 'n1' },
      2,
      1,
    );

    expect(resolved).toMatchObject({
      labelFontSize: 24,
      labelOffsetX: 6,
      labelBackgroundPadding: 4,
      labelMaxWidth: 160,
    });
  });
});

describe('LabelLayerRenderer rendering policies', () => {
  it('keeps low-zoom labels hidden by default and draws them when configured', () => {
    const ctx = makeContext();
    const layer = createLayer(ctx);
    const nodes: LayoutNode[] = [
      { id: 'source', x: 100, y: 100 },
      { id: 'target', x: 300, y: 100 },
    ];
    const edges: GraphEdge[] = [{ id: 'edge', source: 'source', target: 'target' }];
    const nodeConfig: NodeConfig = {
      style: { label: (node) => (node.id === 'source' ? 'node' : false) },
    };
    const edgeConfig: EdgeConfig = { style: { label: 'edge' } };
    const nodeIdToIndex = new Map([
      ['source', 0],
      ['target', 1],
    ]);

    layer.draw(nodes, edges, { x: 0, y: 0, zoom: 0.1 }, nodeConfig, edgeConfig, nodeIdToIndex);
    expect(ctx.fillText).not.toHaveBeenCalled();

    layer.draw(
      nodes,
      edges,
      { x: 0, y: 0, zoom: 0.1 },
      nodeConfig,
      edgeConfig,
      nodeIdToIndex,
      undefined,
      undefined,
      undefined,
      { hideOnLowZoom: false, hideOnCollision: false },
    );

    expect(vi.mocked(ctx.fillText).mock.calls.map(([text]) => text)).toEqual(['node', 'edge']);
    layer.destroy();
  });

  it('supports independent node and edge minimum zoom thresholds', () => {
    const ctx = makeContext();
    const layer = createLayer(ctx);
    const nodes: LayoutNode[] = [
      { id: 'source', x: 100, y: 100 },
      { id: 'target', x: 300, y: 100 },
    ];
    const edges: GraphEdge[] = [{ id: 'edge', source: 'source', target: 'target' }];
    const nodeConfig: NodeConfig = {
      style: { label: (node) => (node.id === 'source' ? 'node' : false) },
    };
    const edgeConfig: EdgeConfig = { style: { label: 'edge' } };
    const nodeIdToIndex = new Map([
      ['source', 0],
      ['target', 1],
    ]);

    layer.draw(
      nodes,
      edges,
      { x: 0, y: 0, zoom: 0.49 },
      nodeConfig,
      edgeConfig,
      nodeIdToIndex,
      undefined,
      undefined,
      undefined,
      { nodeMinZoom: 0.5, edgeMinZoom: 0.5, hideOnCollision: false },
    );
    expect(ctx.fillText).not.toHaveBeenCalled();

    layer.draw(
      nodes,
      edges,
      { x: 0, y: 0, zoom: 0.5 },
      nodeConfig,
      edgeConfig,
      nodeIdToIndex,
      undefined,
      undefined,
      undefined,
      { nodeMinZoom: 0.5, edgeMinZoom: 0.5, hideOnCollision: false },
    );
    expect(vi.mocked(ctx.fillText).mock.calls.map(([text]) => text)).toEqual(['node', 'edge']);

    vi.mocked(ctx.fillText).mockClear();
    layer.draw(
      nodes,
      edges,
      { x: 0, y: 0, zoom: 0.1 },
      nodeConfig,
      edgeConfig,
      nodeIdToIndex,
      undefined,
      undefined,
      undefined,
      {
        hideOnLowZoom: false,
        nodeMinZoom: 0.9,
        edgeMinZoom: 0.9,
        hideOnCollision: false,
      },
    );
    expect(vi.mocked(ctx.fillText).mock.calls.map(([text]) => text)).toEqual(['node', 'edge']);
    layer.destroy();
  });

  it('keeps default node labels at a fixed screen font size when configured', () => {
    const ctx = makeContext();
    const layer = createLayer(ctx, 2);
    const nodeConfig: NodeConfig = { style: { label: 'node', labelFontSize: 12 } };

    layer.draw(
      [{ id: 'n1', x: 100, y: 100 }],
      [],
      { x: 0, y: 0, zoom: 0.1 },
      nodeConfig,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      { scaleWithZoom: false, hideOnLowZoom: false },
    );
    expect(ctx.font).toContain('24px');

    layer.draw(
      [{ id: 'n1', x: 100, y: 100 }],
      [],
      { x: 0, y: 0, zoom: 2 },
      nodeConfig,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      { scaleWithZoom: false },
    );
    expect(ctx.font).toContain('24px');
    layer.destroy();
  });

  it('passes fixed screen dimensions to custom node renderers when configured', () => {
    const ctx = makeContext();
    const layer = createLayer(ctx, 2);
    const measure = vi.fn(() => ({ width: 40, height: 20 }));
    registerLabelRenderer('test-fixed-node-label', { measure, draw: vi.fn() });

    layer.draw(
      [{ id: 'n1', x: 100, y: 100 }],
      [],
      { x: 0, y: 0, zoom: 0.1 },
      {
        labelRenderer: 'test-fixed-node-label',
        style: {
          label: 'node',
          labelFontSize: 12,
          labelOffsetX: 3,
          labelBackgroundPadding: 2,
          labelMaxWidth: 80,
        },
      },
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      { scaleWithZoom: false, hideOnLowZoom: false },
    );

    expect(measure.mock.calls[0][0].style).toMatchObject({
      labelFontSize: 24,
      labelOffsetX: 6,
      labelBackgroundPadding: 4,
      labelMaxWidth: 160,
    });
    layer.destroy();
  });

  it('draws colliding default node labels when collision hiding is disabled', () => {
    const ctx = makeContext();
    const layer = createLayer(ctx);
    const nodes: LayoutNode[] = [
      { id: 'n1', x: 100, y: 100 },
      { id: 'n2', x: 100, y: 100 },
    ];
    const nodeConfig: NodeConfig = { style: { label: (node) => node.id } };

    layer.draw(nodes, [], { x: 0, y: 0, zoom: 1 }, nodeConfig);
    expect(ctx.fillText).toHaveBeenCalledTimes(1);

    vi.mocked(ctx.fillText).mockClear();
    layer.draw(
      nodes,
      [],
      { x: 0, y: 0, zoom: 1 },
      nodeConfig,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      { hideOnCollision: false },
    );
    expect(ctx.fillText).toHaveBeenCalledTimes(2);
    layer.destroy();
  });

  it('draws colliding default edge labels when collision hiding is disabled', () => {
    const ctx = makeContext();
    const layer = createLayer(ctx);
    const nodes: LayoutNode[] = [
      { id: 'source', x: 100, y: 100 },
      { id: 'target', x: 300, y: 100 },
    ];
    const edges: GraphEdge[] = [
      { id: 'edge-1', source: 'source', target: 'target' },
      { id: 'edge-2', source: 'source', target: 'target' },
    ];
    const edgeConfig: EdgeConfig = { style: { label: (_source, _target, edge) => edge.id } };
    const nodeIdToIndex = new Map([
      ['source', 0],
      ['target', 1],
    ]);

    layer.draw(nodes, edges, { x: 0, y: 0, zoom: 1 }, undefined, edgeConfig, nodeIdToIndex);
    expect(ctx.fillText).toHaveBeenCalledTimes(1);

    vi.mocked(ctx.fillText).mockClear();
    layer.draw(
      nodes,
      edges,
      { x: 0, y: 0, zoom: 1 },
      undefined,
      edgeConfig,
      nodeIdToIndex,
      undefined,
      undefined,
      undefined,
      { hideOnCollision: false },
    );
    expect(ctx.fillText).toHaveBeenCalledTimes(2);
    layer.destroy();
  });
});

describe('custom label helpers', () => {
  it('computes circle and rounded-rect decoration anchors from the real outline', () => {
    const circle = getBuiltInNodeBoundaryAnchor('circle', 'right', 40, 40, 0.25);
    expect(circle.x).toBeCloseTo(Math.sqrt(300));
    expect(circle.y).toBe(10);

    const rounded = getBuiltInNodeBoundaryAnchor('rect', 'right', 40, 40, 0.45, 5);
    expect(rounded.x).toBeCloseTo(19);
    expect(rounded.y).toBe(18);
  });

  it('positions decorations on the node boundary by default', () => {
    expect(
      getNodeDecorationAnchor(
        100,
        100,
        40,
        30,
        { width: 20, height: 10 },
        'top',
        'boundary',
        'center',
        4,
      ),
    ).toEqual({ x: 100, y: 85 });
    expect(
      getNodeDecorationAnchor(
        100,
        100,
        40,
        30,
        { width: 20, height: 10 },
        'right',
        'boundary',
        'center',
        4,
      ),
    ).toEqual({ x: 120, y: 100 });
  });

  it('supports outside and inside decoration attachment', () => {
    expect(
      getNodeDecorationAnchor(
        100,
        100,
        40,
        30,
        { width: 20, height: 10 },
        'top',
        'outside',
        'center',
        4,
      ),
    ).toEqual({ x: 100, y: 76 });
    expect(
      getNodeDecorationAnchor(
        100,
        100,
        40,
        30,
        { width: 20, height: 10 },
        'right',
        'inside',
        'center',
        4,
      ),
    ).toEqual({ x: 110, y: 100 });
  });

  it('aligns a right-side decoration start edge to the node boundary', () => {
    expect(
      getNodeDecorationAnchor(
        100,
        100,
        40,
        30,
        { width: 20, height: 10 },
        'right',
        'boundary',
        'start',
        4,
        -0.2,
      ),
    ).toEqual({ x: 130, y: 94 });
    expect(
      getNodeDecorationAnchor(
        100,
        100,
        40,
        30,
        { width: 20, height: 10 },
        'right',
        'boundary',
        'start',
        4,
        -0.2,
        4,
      ),
    ).toEqual({ x: 126, y: 94 });
  });

  it('resolves node function styles into final Canvas pixels', () => {
    const node: LayoutNode = { id: 'n1', x: 0, y: 0, data: { size: 14 } };
    const style: NonNullable<NodeConfig['style']> = {
      labelFontSize: (current) => Number(current.data?.size),
      labelOffsetX: 3,
      labelBackgroundPadding: 2,
      labelPlacement: 'top',
    };

    const resolved = resolveNodeLabelStyle(style, node, 2, 0.5);

    expect(resolved.labelFontSize).toBe(14);
    expect(resolved.labelOffsetX).toBe(3);
    expect(resolved.labelBackgroundPadding).toBe(2);
    expect(resolved.labelPlacement).toBe('top');
  });

  it('resolves edge function styles with source, target, and edge context', () => {
    const source: LayoutNode = { id: 'source', x: 0, y: 0 };
    const target: LayoutNode = { id: 'target', x: 10, y: 0 };
    const edge: GraphEdge = { source: source.id, target: target.id, data: { size: 11 } };
    const style: NonNullable<EdgeConfig['style']> = {
      labelFontSize: (currentSource, currentTarget, currentEdge) =>
        currentSource.id === 'source' && currentTarget.id === 'target'
          ? Number(currentEdge.data?.size)
          : 0,
      labelPlacement: 'end',
    };

    const resolved = resolveEdgeLabelStyle(style, source, target, edge, 2);

    expect(resolved.labelFontSize).toBe(22);
    expect(resolved.labelPlacement).toBe('end');
  });

  it('positions custom node layouts on every node side', () => {
    const baseStyle = resolveNodeLabelStyle({}, { id: 'n1' }, 1, 1);
    const layout = { width: 40, height: 20 };

    expect(
      getCustomNodeLabelAnchor(
        100,
        100,
        60,
        40,
        layout,
        {
          ...baseStyle,
          labelPlacement: 'top',
        },
        4,
      ),
    ).toEqual({ x: 100, y: 68.8 });
    expect(
      getCustomNodeLabelAnchor(
        100,
        100,
        60,
        40,
        layout,
        {
          ...baseStyle,
          labelPlacement: 'bottom',
        },
        4,
      ),
    ).toEqual({ x: 100, y: 131.2 });
    expect(
      getCustomNodeLabelAnchor(
        100,
        100,
        60,
        40,
        layout,
        {
          ...baseStyle,
          labelPlacement: 'left',
        },
        4,
      ),
    ).toEqual({ x: 46, y: 100 });
    expect(
      getCustomNodeLabelAnchor(
        100,
        100,
        60,
        40,
        layout,
        {
          ...baseStyle,
          labelPlacement: 'right',
        },
        4,
      ),
    ).toEqual({ x: 154, y: 100 });
  });

  it('rejects invalid custom measurements', () => {
    expect(isValidLabelLayout({ width: 10, height: 20 })).toBe(true);
    expect(isValidLabelLayout({ width: 0, height: 20 })).toBe(false);
    expect(isValidLabelLayout({ width: Number.NaN, height: 20 })).toBe(false);
    expect(isValidLabelLayout({ width: 10, height: Number.POSITIVE_INFINITY })).toBe(false);
    expect(isValidLabelLayout(undefined)).toBe(false);
  });
});

describe('LabelLayerRenderer custom lifecycle', () => {
  it('ignores pending image completion and redraw requests after destroy', () => {
    const images: Array<{
      onload: (() => void) | null;
      onerror: (() => void) | null;
      crossOrigin: string;
      src: string;
    }> = [];
    class MockImage {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      crossOrigin = '';
      src = '';

      constructor() {
        images.push(this);
      }
    }
    vi.stubGlobal('Image', MockImage);

    const ctx = makeContext();
    const layer = createLayer(ctx);
    const scheduleRedraw = vi.fn();
    layer.setScheduleRedraw(scheduleRedraw);
    layer.draw(
      [{ id: 'n1', x: 100, y: 100 }],
      [],
      { x: 0, y: 0, zoom: 1 },
      { style: { icon: 'https://example.com/icon.png' } },
    );

    expect(images).toHaveLength(1);
    const pendingOnload = images[0].onload;
    expect(pendingOnload).toBeTypeOf('function');

    layer.destroy();
    layer.setHoveredNode('n1');
    pendingOnload?.();

    const internals = layer as unknown as {
      destroyed: boolean;
      redrawScheduled: boolean;
      scheduleRedrawFn: (() => void) | null;
      imageCache: Map<string, HTMLImageElement | null>;
    };
    expect(internals.destroyed).toBe(true);
    expect(internals.redrawScheduled).toBe(false);
    expect(internals.scheduleRedrawFn).toBeNull();
    expect(internals.imageCache.size).toBe(0);
    expect(scheduleRedraw).not.toHaveBeenCalled();
  });

  it('uses the main WebGL backing scale and does not double-apply DPR to node geometry', () => {
    const ctx = makeContext();
    const layer = createLayer(ctx, 3);
    const measure = vi.fn(() => ({ width: 10, height: 10 }));
    registerDecoration('dpr-badge', { measure, draw: vi.fn() });

    layer.draw(
      [{ id: 'n1', x: 100, y: 100 }],
      [],
      { x: 0, y: 0, zoom: 2 },
      { style: { size: 20 }, decorations: [{ renderer: 'dpr-badge' }] },
    );

    expect(measure).toHaveBeenCalledWith(
      expect.objectContaining({ dpr: 2, zoom: 2, nodeWidth: 40, nodeHeight: 40 }),
    );
    layer.destroy();
  });

  it('skips decoration measurement and drawing below its minimum zoom', () => {
    const ctx = makeContext();
    const layer = createLayer(ctx);
    const measure = vi.fn(() => ({ width: 20, height: 10 }));
    const draw = vi.fn();
    registerDecoration('minimum-zoom-badge', { measure, draw });
    const config: NodeConfig = {
      decorations: [{ renderer: 'minimum-zoom-badge', minZoom: 0.5, data: {} }],
    };

    layer.draw([{ id: 'n1', x: 100, y: 100 }], [], { x: 0, y: 0, zoom: 0.49 }, config);
    expect(measure).not.toHaveBeenCalled();
    expect(draw).not.toHaveBeenCalled();

    layer.draw([{ id: 'n1', x: 100, y: 100 }], [], { x: 0, y: 0, zoom: 0.5 }, config);
    expect(measure).toHaveBeenCalledTimes(1);
    expect(draw).toHaveBeenCalledTimes(1);
    layer.destroy();
  });

  it('draws colliding decorations when collision hiding is disabled', () => {
    const ctx = makeContext();
    const layer = createLayer(ctx);
    const draw = vi.fn();
    registerDecoration('collision-optional-badge', {
      measure: () => ({ width: 40, height: 20 }),
      draw,
    });
    const nodes: LayoutNode[] = [
      { id: 'n1', x: 100, y: 100 },
      { id: 'n2', x: 100, y: 100 },
    ];

    layer.draw(
      nodes,
      [],
      { x: 0, y: 0, zoom: 1 },
      {
        decorations: [{ renderer: 'collision-optional-badge', data: {} }],
      },
    );
    expect(draw).toHaveBeenCalledTimes(1);

    draw.mockClear();
    layer.draw(
      nodes,
      [],
      { x: 0, y: 0, zoom: 1 },
      {
        decorations: [{ renderer: 'collision-optional-badge', hideOnCollision: false, data: {} }],
      },
    );
    expect(draw).toHaveBeenCalledTimes(2);
    layer.destroy();
  });

  it('does not let collision-disabled decorations suppress later collision-aware ones', () => {
    const ctx = makeContext();
    const layer = createLayer(ctx);
    const drawFree = vi.fn();
    const drawAware = vi.fn();
    registerDecoration('collision-free-source', {
      measure: ({ data }) =>
        data ? { width: 40, height: 20 } : { width: Number.NaN, height: Number.NaN },
      draw: drawFree,
    });
    registerDecoration('collision-aware-target', {
      measure: ({ data }) =>
        data ? { width: 40, height: 20 } : { width: Number.NaN, height: Number.NaN },
      draw: drawAware,
    });

    layer.draw(
      [
        { id: 'n1', x: 100, y: 100 },
        { id: 'n2', x: 100, y: 100 },
      ],
      [],
      { x: 0, y: 0, zoom: 1 },
      {
        decorations: [
          {
            renderer: 'collision-free-source',
            hideOnCollision: false,
            data: (node) => (node.id === 'n1' ? {} : undefined),
          },
          {
            renderer: 'collision-aware-target',
            data: (node) => (node.id === 'n2' ? {} : undefined),
          },
        ],
      },
    );

    expect(drawFree).toHaveBeenCalledTimes(1);
    expect(drawAware).toHaveBeenCalledTimes(1);
    layer.destroy();
  });

  it('keeps half-badge caps on both side boundaries at 32px and 68px while preserving numeric overlap', () => {
    const ctx = makeContext();
    const layer = createLayer(ctx);
    registerDecoration('responsive-boundary-overlap-badge', {
      measure: ({ nodeWidth }) => ({ width: nodeWidth * 0.75, height: nodeWidth / 3 }),
      draw: vi.fn(),
    });

    const renderAt = (
      size: number,
      overlap: number | 'half-badge',
      placement: 'left' | 'right' = 'right',
    ) => {
      vi.mocked(ctx.translate).mockClear();
      layer.draw(
        [{ id: 'n1', x: 100, y: 100, data: { size } }],
        [],
        { x: 0, y: 0, zoom: 1 },
        {
          style: (node) => ({ size: Number(node.data?.size) }),
          decorations: [
            {
              renderer: 'responsive-boundary-overlap-badge',
              placement,
              attachment: 'boundary',
              anchor: 'start',
              boundaryOverlap: () => overlap,
              data: {},
            },
          ],
        },
      );
      return vi.mocked(ctx.translate).mock.calls[0][0];
    };

    for (const size of [32, 68]) {
      const badgeWidth = size * 0.75;
      const badgeHeight = size / 3;
      const nodeBoundary = 100 + size / 2;
      const centerX = renderAt(size, 'half-badge');
      const leftCapCenter = centerX - badgeWidth / 2 + badgeHeight / 2;
      expect(leftCapCenter).toBeCloseTo(nodeBoundary);

      const leftNodeBoundary = 100 - size / 2;
      const leftCenterX = renderAt(size, 'half-badge', 'left');
      const rightCapCenter = leftCenterX + badgeWidth / 2 - badgeHeight / 2;
      expect(rightCapCenter).toBeCloseTo(leftNodeBoundary);
    }

    const size = 68;
    const badgeWidth = size * 0.75;
    const nodeBoundary = 100 + size / 2;
    const centerX = renderAt(size, 4);
    expect(centerX - badgeWidth / 2).toBeCloseTo(nodeBoundary - 4);
    layer.destroy();
  });

  it('uses the height of the boundary-adjacent stack item for top and bottom half-badge overlap', () => {
    const ctx = makeContext();
    const layer = createLayer(ctx);
    type BadgeBox = { width: number; height: number };
    registerDecoration('mixed-height-boundary-badges', {
      measure: ({ data }: { data: BadgeBox }) => data,
      draw: vi.fn(),
    } as DecorationRenderer<BadgeBox>);
    const items: BadgeBox[] = [
      { width: 50, height: 10 },
      { width: 80, height: 20 },
    ];
    const makeConfig = (placement: 'top' | 'bottom'): NodeConfig => ({
      style: { size: 40 },
      decorations: [
        {
          renderer: 'mixed-height-boundary-badges',
          placement,
          attachment: 'boundary',
          anchor: 'start',
          boundaryOverlap: 'half-badge',
          layout: 'stack',
          itemGap: 0,
          items,
        },
      ],
    });

    layer.draw(
      [{ id: 'top-node', x: 100, y: 100 }],
      [],
      { x: 0, y: 0, zoom: 1 },
      makeConfig('top'),
    );
    const topStackY = vi.mocked(ctx.translate).mock.calls[0][1];
    const stackHeight = items.reduce((sum, item) => sum + item.height, 0);
    const lastItemCenter = topStackY + stackHeight / 2 - items[items.length - 1].height / 2;
    expect(lastItemCenter).toBeCloseTo(80);

    vi.mocked(ctx.translate).mockClear();
    layer.draw(
      [{ id: 'bottom-node', x: 100, y: 100 }],
      [],
      { x: 0, y: 0, zoom: 1 },
      makeConfig('bottom'),
    );
    const bottomStackY = vi.mocked(ctx.translate).mock.calls[0][1];
    const firstItemCenter = bottomStackY - stackHeight / 2 + items[0].height / 2;
    expect(firstItemCenter).toBeCloseTo(120);
    layer.destroy();
  });

  it('repositions decorations from the same resolved size used by function-style nodes', () => {
    const ctx = makeContext();
    const layer = createLayer(ctx);
    registerDecoration('resized-node-badge', {
      measure: () => ({ width: 20, height: 10 }),
      draw: vi.fn(),
    });
    const config: NodeConfig = {
      style: (node) => ({ size: Number(node.data?.size ?? 20) }),
      decorations: [
        {
          renderer: 'resized-node-badge',
          placement: 'right',
          attachment: 'boundary',
          anchor: 'start',
        },
      ],
    };

    layer.draw(
      [{ id: 'n1', x: 100, y: 100, data: { size: 20 } }],
      [],
      { x: 0, y: 0, zoom: 1 },
      config,
    );
    expect(vi.mocked(ctx.translate).mock.calls[0][0]).toBeCloseTo(120);

    vi.mocked(ctx.translate).mockClear();
    layer.draw(
      [{ id: 'n1', x: 100, y: 100, data: { size: 60 } }],
      [],
      { x: 0, y: 0, zoom: 1 },
      config,
    );
    expect(vi.mocked(ctx.translate).mock.calls[0][0]).toBeCloseTo(140);
    layer.destroy();
  });

  it('prefers dimensions captured by the WebGL renderer over re-running style size logic', () => {
    const ctx = makeContext();
    const layer = createLayer(ctx);
    registerDecoration('renderer-size-badge', {
      measure: () => ({ width: 20, height: 10 }),
      draw: vi.fn(),
    });
    const config: NodeConfig = {
      style: () => ({ size: 20 }),
      decorations: [
        {
          renderer: 'renderer-size-badge',
          placement: 'right',
          attachment: 'boundary',
          anchor: 'start',
        },
      ],
    };

    layer.draw(
      [{ id: 'n1', x: 100, y: 100 }],
      [],
      { x: 0, y: 0, zoom: 1 },
      config,
      undefined,
      undefined,
      undefined,
      {},
      () => ({ width: 80, height: 80 }),
    );

    expect(vi.mocked(ctx.translate).mock.calls[0][0]).toBeCloseTo(150);
    layer.destroy();
  });

  it('uses a node extension boundary anchor when provided', () => {
    const ctx = makeContext();
    const layer = createLayer(ctx);
    const getBoundaryAnchor = vi.fn(() => ({ x: 12, y: -6 }));
    const draw = vi.fn();
    registerNode('custom-boundary-node', { base: 'rect', getBoundaryAnchor });
    registerDecoration('custom-boundary-badge', {
      measure: () => ({ width: 20, height: 10 }),
      draw,
    });

    layer.draw(
      [{ id: 'n1', x: 100, y: 100 }],
      [],
      { x: 0, y: 0, zoom: 1 },
      {
        type: 'custom-boundary-node',
        style: { width: 40, height: 30 },
        decorations: [
          {
            renderer: 'custom-boundary-badge',
            placement: 'right',
            attachment: 'boundary',
          },
        ],
      },
    );

    expect(getBoundaryAnchor).toHaveBeenCalledWith(
      expect.objectContaining({ placement: 'right', width: 40, height: 30 }),
    );
    const [translateX, translateY] = vi.mocked(ctx.translate).mock.calls[0];
    expect(translateX).toBeCloseTo(112);
    expect(translateY).toBeCloseTo(94);
    expect(draw).toHaveBeenCalledOnce();
    layer.destroy();
  });

  it('keeps drawing labels when a node extension getStyle callback throws', () => {
    const ctx = makeContext();
    const layer = createLayer(ctx);
    const error = new Error('label getStyle failed');
    const report = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    registerNode('throwing-label-node-style', {
      style: { label: 'fallback-label' },
      getStyle: () => {
        throw error;
      },
    });

    expect(() =>
      layer.draw(
        [{ id: 'n1', x: 100, y: 100 }],
        [],
        { x: 0, y: 0, zoom: 1 },
        { type: 'throwing-label-node-style' },
      ),
    ).not.toThrow();

    expect(ctx.fillText).toHaveBeenCalledWith(
      'fallback-label',
      expect.any(Number),
      expect.any(Number),
    );
    expect(report).toHaveBeenCalledWith(
      '[G6Lite] node extension "throwing-label-node-style" failed during getStyle',
      error,
    );
    layer.destroy();
  });

  it('keeps drawing labels when a node extension overlay callback throws', () => {
    const ctx = makeContext();
    const layer = createLayer(ctx);
    const error = new Error('drawOverlay failed');
    const report = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    registerNode('throwing-overlay-node', {
      style: { label: 'after-overlay' },
      drawOverlay: () => {
        throw error;
      },
    });

    expect(() =>
      layer.draw(
        [{ id: 'n1', x: 100, y: 100 }],
        [],
        { x: 0, y: 0, zoom: 1 },
        { type: 'throwing-overlay-node' },
      ),
    ).not.toThrow();

    expect(ctx.fillText).toHaveBeenCalledWith(
      'after-overlay',
      expect.any(Number),
      expect.any(Number),
    );
    expect(report).toHaveBeenCalledWith(
      '[G6Lite] node extension "throwing-overlay-node" failed during drawOverlay',
      error,
    );
    layer.destroy();
  });

  it('uses the built-in boundary when a node extension boundary callback throws', () => {
    const ctx = makeContext();
    const layer = createLayer(ctx);
    const error = new Error('getBoundaryAnchor failed');
    const report = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const draw = vi.fn();
    registerNode('throwing-boundary-node', {
      base: 'rect',
      getBoundaryAnchor: () => {
        throw error;
      },
    });
    registerDecoration('throwing-boundary-badge', {
      measure: () => ({ width: 20, height: 10 }),
      draw,
    });

    expect(() =>
      layer.draw(
        [{ id: 'n1', x: 100, y: 100 }],
        [],
        { x: 0, y: 0, zoom: 1 },
        {
          type: 'throwing-boundary-node',
          style: { width: 40, height: 30 },
          decorations: [
            {
              renderer: 'throwing-boundary-badge',
              placement: 'right',
              attachment: 'boundary',
            },
          ],
        },
      ),
    ).not.toThrow();

    const [translateX, translateY] = vi.mocked(ctx.translate).mock.calls[0];
    expect(translateX).toBeCloseTo(120);
    expect(translateY).toBeCloseTo(100);
    expect(draw).toHaveBeenCalledOnce();
    expect(report).toHaveBeenCalledWith(
      '[G6Lite] node extension "throwing-boundary-node" failed during getBoundaryAnchor',
      error,
    );
    layer.destroy();
  });

  it('allows multiple decorations on the same node to coexist', () => {
    const ctx = makeContext();
    const layer = createLayer(ctx);
    const topDraw = vi.fn();
    const bottomDraw = vi.fn();
    registerDecoration('same-node-top', {
      measure: () => ({ width: 30, height: 12 }),
      draw: topDraw,
    });
    registerDecoration('same-node-bottom', {
      measure: () => ({ width: 30, height: 12 }),
      draw: bottomDraw,
    });

    layer.draw(
      [{ id: 'n1', x: 100, y: 100 }],
      [],
      { x: 0, y: 0, zoom: 1 },
      {
        style: { size: 40 },
        decorations: [
          { renderer: 'same-node-top', placement: 'top' },
          { renderer: 'same-node-bottom', placement: 'bottom' },
        ],
      },
    );

    expect(topDraw).toHaveBeenCalledOnce();
    expect(bottomDraw).toHaveBeenCalledOnce();
    layer.destroy();
  });

  it('sorts, folds, and hover-expands engine-managed decoration stacks', () => {
    const ctx = makeContext();
    const layer = createLayer(ctx);
    const draw = vi.fn();
    registerDecoration('stack-badge', {
      measure: ({ data }: { data: { text: string } }) => ({
        width: data.text.length * 10,
        height: 10,
      }),
      draw,
    } as DecorationRenderer<{ text: string }>);
    const config: NodeConfig = {
      style: { size: 20 },
      decorations: [
        {
          renderer: 'stack-badge',
          placement: 'right',
          attachment: 'boundary',
          anchor: 'start',
          layout: 'stack',
          items: [{ text: 'a' }, { text: 'longest' }, { text: 'medium' }, { text: 'tiny' }],
          sort: 'width-desc',
          maxVisible: 3,
          overflow: 'hover-expand',
          overflowData: { text: '...' },
        },
      ],
    };

    layer.draw([{ id: 'n1', x: 100, y: 100 }], [], { x: 0, y: 0, zoom: 1 }, config);
    expect(draw.mock.calls.map(([params]) => params.data.text)).toEqual([
      'longest',
      'medium',
      '...',
    ]);

    const mainCanvas = (layer as unknown as { mainCanvas: HTMLCanvasElement }).mainCanvas;
    mainCanvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 100, clientY: 100 }));
    draw.mockClear();
    layer.draw([{ id: 'n1', x: 100, y: 100 }], [], { x: 0, y: 0, zoom: 1 }, config);
    expect(draw.mock.calls.map(([params]) => params.data.text)).toEqual([
      'longest',
      'medium',
      '...',
    ]);

    mainCanvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 120, clientY: 110 }));
    draw.mockClear();
    layer.draw([{ id: 'n1', x: 100, y: 100 }], [], { x: 0, y: 0, zoom: 1 }, config);
    expect(draw.mock.calls.map(([params]) => params.data.text)).toEqual([
      'longest',
      'medium',
      'tiny',
      'a',
    ]);
    layer.destroy();
  });

  it('renders a KGBase-style external label and multiple source badges as one decoration', () => {
    const ctx = makeContext();
    const layer = createLayer(ctx);
    type SourceTag = { text: string; color: string; bg: string };
    type KGBaseDecorationData = { displayName: string; sourceTags: SourceTag[] };

    registerDecoration('kgbase-source-tags', {
      measure({
        ctx: measureContext,
        data,
      }: {
        ctx: CanvasRenderingContext2D;
        data: KGBaseDecorationData;
      }) {
        const labelWidth = measureContext.measureText(data.displayName).width;
        const badgeWidth = Math.max(
          0,
          ...data.sourceTags.map((tag) => measureContext.measureText(tag.text).width + 8),
        );
        return {
          width: Math.max(labelWidth, badgeWidth),
          height: 18 + data.sourceTags.length * 15,
        };
      },
      draw({
        ctx: drawContext,
        data,
      }: {
        ctx: CanvasRenderingContext2D;
        data: KGBaseDecorationData;
      }) {
        drawContext.fillText(data.displayName, 0, 0);
        data.sourceTags.forEach((tag, index) => {
          drawContext.fillStyle = tag.bg;
          drawContext.fillRect(0, 10 + index * 15, 30, 12);
          drawContext.fillStyle = tag.color;
          drawContext.fillText(tag.text, 15, 16 + index * 15);
        });
      },
    } as DecorationRenderer<KGBaseDecorationData>);

    const data: KGBaseDecorationData = {
      displayName: '知识图谱节点',
      sourceTags: [
        { text: '向量召回', color: '#0958d9', bg: '#e6f4ff' },
        { text: '图召回', color: '#389e0d', bg: '#f6ffed' },
        { text: '手工标注', color: '#d46b08', bg: '#fff7e6' },
      ],
    };

    layer.draw(
      [{ id: 'entity-1', x: 100, y: 100, data }],
      [],
      { x: 0, y: 0, zoom: 1 },
      {
        style: { size: 40, label: 'Entity', labelPlacement: 'center' },
        decorations: [
          {
            renderer: 'kgbase-source-tags',
            placement: 'right',
            data: (node) => node.data as unknown as KGBaseDecorationData,
          },
        ],
      },
    );

    expect(ctx.fillText).toHaveBeenCalledWith('Entity', expect.any(Number), expect.any(Number));
    expect(ctx.fillText).toHaveBeenCalledWith('知识图谱节点', 0, 0);
    expect(ctx.fillText).toHaveBeenCalledWith('向量召回', 15, 16);
    expect(ctx.fillText).toHaveBeenCalledWith('图召回', 15, 31);
    expect(ctx.fillText).toHaveBeenCalledWith('手工标注', 15, 46);
    layer.destroy();
  });

  it('renders registered node decorations through the shared overlay lifecycle', () => {
    const ctx = makeContext();
    const layer = createLayer(ctx);
    const measure = vi.fn(() => ({ width: 20, height: 10, data: 'badge' }));
    const draw = vi.fn();
    registerDecoration('test-badge', { measure, draw });
    const node: LayoutNode = { id: 'n1', x: 100, y: 100, data: { count: 3 } };

    layer.draw(
      [node],
      [],
      { x: 0, y: 0, zoom: 1 },
      {
        style: { size: 20 },
        decorations: [
          {
            renderer: 'test-badge',
            placement: 'top',
            data: (current) => current.data?.count,
          },
        ],
      },
    );

    expect(measure).toHaveBeenCalledWith(
      expect.objectContaining({ node, data: 3, dpr: 1, zoom: 1 }),
    );
    expect(draw).toHaveBeenCalledWith(
      expect.objectContaining({ layout: { width: 20, height: 10, data: 'badge' } }),
    );
    const [translateX, translateY] = vi.mocked(ctx.translate).mock.calls[0];
    expect(translateX).toBeCloseTo(100);
    expect(translateY).toBeCloseTo(90);
    layer.destroy();
  });

  it('keeps outside decorations fully separated from the node', () => {
    const ctx = makeContext();
    const layer = createLayer(ctx);
    registerDecoration('outside-badge', {
      measure: () => ({ width: 20, height: 10 }),
      draw: vi.fn(),
    });

    layer.draw(
      [{ id: 'n1', x: 100, y: 100 }],
      [],
      { x: 0, y: 0, zoom: 1 },
      {
        style: { size: 20 },
        decorations: [{ renderer: 'outside-badge', placement: 'top', attachment: 'outside' }],
      },
    );

    const [, translateY] = vi.mocked(ctx.translate).mock.calls[0];
    expect(translateY).toBeCloseTo(81);
    layer.destroy();
  });

  it('isolates decoration renderer errors without blocking node labels', () => {
    const ctx = makeContext();
    const layer = createLayer(ctx);
    registerDecoration('broken-badge', {
      measure: () => {
        throw new Error('broken');
      },
      draw: vi.fn(),
    });

    expect(() =>
      layer.draw(
        [{ id: 'n1', x: 100, y: 100 }],
        [],
        { x: 0, y: 0, zoom: 1 },
        {
          style: { size: 20, label: 'Node' },
          decorations: [{ renderer: 'broken-badge' }],
        },
      ),
    ).not.toThrow();
    expect(ctx.fillText).toHaveBeenCalled();
    layer.destroy();
  });

  it('passes resolved node context and layout data from measure to draw', () => {
    const ctx = makeContext();
    const layer = createLayer(ctx, 2);
    const measure = vi.fn(() => ({ width: 60, height: 20, data: ['cached'] }));
    const draw = vi.fn();
    registerLabelRenderer('test-node-context', { measure, draw });
    const nodes: LayoutNode[] = [{ id: 'n1', x: 100, y: 100, data: { label: 'Node A' } }];

    layer.draw(
      nodes,
      [],
      { x: 0, y: 0, zoom: 1 },
      {
        labelRenderer: 'test-node-context',
        style: { size: 20, label: (node) => String(node.data?.label), labelFontSize: 12 },
      },
    );

    expect(measure).toHaveBeenCalledTimes(1);
    expect(measure.mock.calls[0][0]).toMatchObject({
      type: 'node',
      text: 'Node A',
      node: nodes[0],
      dpr: 2,
      zoom: 1,
      style: { labelFontSize: 24 },
    });
    expect(draw).toHaveBeenCalledTimes(1);
    expect(draw.mock.calls[0][0].layout.data).toEqual(['cached']);
    expect(ctx.translate).toHaveBeenCalledWith(100, 122.4);
    layer.destroy();
  });

  it('uses custom dimensions for collision detection', () => {
    const ctx = makeContext();
    const layer = createLayer(ctx);
    const custom: LabelRenderer = {
      measure: vi.fn(() => ({ width: 100, height: 30 })),
      draw: vi.fn(),
    };
    registerLabelRenderer('test-node-collision', custom);

    layer.draw(
      [
        { id: 'n1', x: 100, y: 100 },
        { id: 'n2', x: 100, y: 100 },
      ],
      [],
      { x: 0, y: 0, zoom: 1 },
      {
        labelRenderer: 'test-node-collision',
        style: { label: (node) => node.id },
      },
    );

    expect(custom.measure).toHaveBeenCalledTimes(2);
    expect(custom.draw).toHaveBeenCalledTimes(1);

    vi.mocked(custom.measure).mockClear();
    vi.mocked(custom.draw).mockClear();
    layer.draw(
      [
        { id: 'n1', x: 100, y: 100 },
        { id: 'n2', x: 100, y: 100 },
      ],
      [],
      { x: 0, y: 0, zoom: 1 },
      {
        labelRenderer: 'test-node-collision',
        style: { label: (node) => node.id },
      },
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      { hideOnCollision: false },
    );

    expect(custom.measure).toHaveBeenCalledTimes(2);
    expect(custom.draw).toHaveBeenCalledTimes(2);
    layer.destroy();
  });

  it('can disable collision hiding for custom edge labels', () => {
    const ctx = makeContext();
    const layer = createLayer(ctx);
    const custom: LabelRenderer = {
      measure: vi.fn(() => ({ width: 80, height: 20 })),
      draw: vi.fn(),
    };
    registerLabelRenderer('test-edge-collision-options', custom);
    const nodes: LayoutNode[] = [
      { id: 'source', x: 100, y: 100 },
      { id: 'target', x: 300, y: 100 },
    ];
    const edges: GraphEdge[] = [
      { id: 'edge-1', source: 'source', target: 'target' },
      { id: 'edge-2', source: 'source', target: 'target' },
    ];
    const edgeConfig: EdgeConfig = {
      labelRenderer: 'test-edge-collision-options',
      style: { label: (_source, _target, edge) => edge.id ?? '' },
    };
    const nodeIdToIndex = new Map([
      ['source', 0],
      ['target', 1],
    ]);

    layer.draw(nodes, edges, { x: 0, y: 0, zoom: 1 }, undefined, edgeConfig, nodeIdToIndex);
    expect(custom.measure).toHaveBeenCalledTimes(2);
    expect(custom.draw).toHaveBeenCalledTimes(1);

    vi.mocked(custom.measure).mockClear();
    vi.mocked(custom.draw).mockClear();
    layer.draw(
      nodes,
      edges,
      { x: 0, y: 0, zoom: 1 },
      undefined,
      edgeConfig,
      nodeIdToIndex,
      undefined,
      undefined,
      undefined,
      { hideOnCollision: false },
    );
    expect(custom.measure).toHaveBeenCalledTimes(2);
    expect(custom.draw).toHaveBeenCalledTimes(2);
    layer.destroy();
  });

  it('passes edge endpoints, placement, rotation, zoom, and DPR', () => {
    const ctx = makeContext();
    const layer = createLayer(ctx, 2);
    const measure = vi.fn(() => ({ width: 40, height: 10 }));
    const draw = vi.fn();
    registerLabelRenderer('test-edge-context', { measure, draw });
    const nodes: LayoutNode[] = [
      { id: 'source', x: 50, y: 50 },
      { id: 'target', x: 150, y: 100 },
    ];
    const edge: GraphEdge = { id: 'edge-1', source: 'source', target: 'target' };

    layer.draw(
      nodes,
      [edge],
      { x: 0, y: 0, zoom: 1.5 },
      undefined,
      {
        labelRenderer: 'test-edge-context',
        style: {
          label: (source, target) => `${source.id}-${target.id}`,
          labelPlacement: 'start',
          labelFontSize: 10,
          labelAutoRotate: true,
        },
      },
      new Map([
        ['source', 0],
        ['target', 1],
      ]),
    );

    expect(measure.mock.calls[0][0]).toMatchObject({
      type: 'edge',
      text: 'source-target',
      edge,
      source: nodes[0],
      target: nodes[1],
      dpr: 2,
      zoom: 1.5,
      style: { labelFontSize: 20, labelPlacement: 'start', labelAutoRotate: true },
    });
    expect(draw).toHaveBeenCalledTimes(1);
    const [translateX, translateY] = vi.mocked(ctx.translate).mock.calls[0];
    expect(translateX).toBeCloseTo(105);
    expect(translateY).toBeCloseTo(90);
    expect(ctx.rotate).toHaveBeenCalled();
    layer.destroy();
  });

  it('uses start, center, and end samples for straight edges', () => {
    const ctx = makeContext();
    const layer = createLayer(ctx);
    registerLabelRenderer('test-edge-placement', {
      measure: () => ({ width: 10, height: 10 }),
      draw: vi.fn(),
    });
    const nodes: LayoutNode[] = [
      { id: 'source', x: 50, y: 50 },
      { id: 'target', x: 150, y: 50 },
    ];
    const edge: GraphEdge = { source: 'source', target: 'target' };
    const nodeMap = new Map([
      ['source', 0],
      ['target', 1],
    ]);

    for (const placement of ['start', 'center', 'end'] as const) {
      layer.draw(
        nodes,
        [edge],
        { x: 0, y: 0, zoom: 1 },
        undefined,
        {
          labelRenderer: 'test-edge-placement',
          style: { label: 'edge', labelPlacement: placement, labelAutoRotate: false },
        },
        nodeMap,
      );
    }

    const translations = vi.mocked(ctx.translate).mock.calls.slice(-3);
    expect(translations[0][0]).toBeCloseTo(70);
    expect(translations[1][0]).toBeCloseTo(100);
    expect(translations[2][0]).toBeCloseTo(130);
    layer.destroy();
  });

  it('samples curved edge paths for position and tangent rotation', () => {
    const ctx = makeContext();
    const layer = createLayer(ctx);
    registerLabelRenderer('test-curved-edge', {
      measure: () => ({ width: 20, height: 10 }),
      draw: vi.fn(),
    });
    const nodes: LayoutNode[] = [
      { id: 'source', x: 50, y: 50 },
      { id: 'target', x: 150, y: 50 },
    ];

    layer.draw(
      nodes,
      [{ source: 'source', target: 'target' }],
      { x: 0, y: 0, zoom: 1 },
      undefined,
      {
        labelRenderer: 'test-curved-edge',
        style: { label: 'curve', labelPlacement: 'start', labelAutoRotate: true },
      },
      new Map([
        ['source', 0],
        ['target', 1],
      ]),
      new Map([[0, createQuadraticPath({ x: 50, y: 50 }, { x: 150, y: 50 }, 0.5)]]),
    );

    const [x, y] = vi.mocked(ctx.translate).mock.calls.at(-1)!;
    expect(x).toBeCloseTo(70);
    expect(y).toBeCloseTo(66);
    expect(ctx.rotate).toHaveBeenCalled();
    layer.destroy();
  });

  it('re-resolves dynamic text and styles on every redraw', () => {
    const ctx = makeContext();
    const layer = createLayer(ctx);
    const measure = vi.fn(() => ({ width: 20, height: 10 }));
    registerLabelRenderer('test-dynamic-label', { measure, draw: vi.fn() });
    const node: LayoutNode = { id: 'n1', x: 100, y: 100, data: { label: 'before' } };
    const config: NodeConfig = {
      labelRenderer: 'test-dynamic-label',
      style: {
        label: (current) => String(current.data?.label),
        labelFontSize: (current) => (current.states?.includes('selected') ? 20 : 10),
      },
    };

    layer.draw([node], [], { x: 0, y: 0, zoom: 1 }, config);
    node.data = { label: 'after' };
    node.states = ['selected'];
    layer.draw([node], [], { x: 0, y: 0, zoom: 1 }, config);

    expect(measure.mock.calls[0][0]).toMatchObject({
      text: 'before',
      style: { labelFontSize: 10 },
    });
    expect(measure.mock.calls[1][0]).toMatchObject({
      text: 'after',
      style: { labelFontSize: 20 },
    });
    layer.destroy();
  });

  it('skips hidden nodes and edges', () => {
    const ctx = makeContext();
    const layer = createLayer(ctx);
    const custom: LabelRenderer = {
      measure: vi.fn(() => ({ width: 20, height: 10 })),
      draw: vi.fn(),
    };
    registerLabelRenderer('test-hidden-label', custom);
    const nodes = [
      { id: 'hidden', x: 50, y: 50, states: ['hidden'] },
      { id: 'visible', x: 150, y: 50 },
    ] as LayoutNode[];

    layer.draw(
      nodes,
      [{ source: 'hidden', target: 'visible' }],
      { x: 0, y: 0, zoom: 1 },
      { labelRenderer: 'test-hidden-label', style: { label: 'node' } },
      { labelRenderer: 'test-hidden-label', style: { label: 'edge' } },
      new Map([
        ['hidden', 0],
        ['visible', 1],
      ]),
    );

    expect(custom.measure).toHaveBeenCalledTimes(1);
    expect(custom.draw).toHaveBeenCalledTimes(1);
    layer.destroy();
  });

  it('falls back to the default label when measure is invalid or draw throws', () => {
    const ctx = makeContext();
    const layer = createLayer(ctx);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    registerLabelRenderer('test-invalid-measure', {
      measure: () => ({ width: Number.NaN, height: 10 }),
      draw: vi.fn(),
    });

    layer.draw(
      [{ id: 'n1', x: 100, y: 100 }],
      [],
      { x: 0, y: 0, zoom: 1 },
      { labelRenderer: 'test-invalid-measure', style: { label: 'fallback' } },
    );

    registerLabelRenderer('test-draw-error', {
      measure: () => ({ width: 30, height: 10 }),
      draw: () => {
        throw new Error('draw failed');
      },
    });
    layer.draw(
      [{ id: 'n2', x: 200, y: 100 }],
      [],
      { x: 0, y: 0, zoom: 1 },
      { labelRenderer: 'test-draw-error', style: { label: 'fallback-2' } },
    );

    const fallbackCalls = vi.mocked(ctx.fillText).mock.calls;
    expect(fallbackCalls[0][0]).toBe('fallback');
    expect(fallbackCalls[0][1]).toBeCloseTo(100);
    expect(fallbackCalls[0][2]).toBeCloseTo(111.2);
    expect(fallbackCalls[1][0]).toBe('fallback-2');
    expect(fallbackCalls[1][1]).toBeCloseTo(200);
    expect(fallbackCalls[1][2]).toBeCloseTo(111.2);
    expect(warn).toHaveBeenCalledTimes(2);
    layer.destroy();
  });

  it('draws the default node label without changing canvas shadow styles', () => {
    const ctx = makeContext();
    ctx.shadowColor = 'magenta';
    ctx.shadowBlur = 9;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 4;
    const layer = createLayer(ctx);

    layer.draw(
      [{ id: 'n1', x: 100, y: 100 }],
      [],
      { x: 0, y: 0, zoom: 1 },
      { style: { label: 'plain-label' } },
    );

    expect(ctx.fillText).toHaveBeenCalledWith(
      'plain-label',
      expect.any(Number),
      expect.any(Number),
    );
    expect(ctx.shadowColor).toBe('magenta');
    expect(ctx.shadowBlur).toBe(9);
    expect(ctx.shadowOffsetX).toBe(3);
    expect(ctx.shadowOffsetY).toBe(4);
    layer.destroy();
  });

  it('warns once for an unregistered renderer and keeps the default path', () => {
    const ctx = makeContext();
    const layer = createLayer(ctx);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const config: NodeConfig = {
      labelRenderer: 'missing-test-renderer',
      style: { label: 'default' },
    };

    layer.draw([{ id: 'n1', x: 100, y: 100 }], [], { x: 0, y: 0, zoom: 1 }, config);
    layer.draw([{ id: 'n1', x: 100, y: 100 }], [], { x: 0, y: 0, zoom: 1 }, config);

    expect(warn).toHaveBeenCalledTimes(1);
    expect(ctx.fillText).toHaveBeenCalledTimes(2);
    layer.destroy();
  });
});
