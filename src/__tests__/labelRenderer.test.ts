import { afterEach, describe, expect, it, vi } from 'vitest';
import { registerLabelRenderer } from '../extensions/label.js';
import { createQuadraticPath } from '../renderer/edgePath.js';
import {
  getCustomNodeLabelAnchor,
  getLabelZoom,
  isValidLabelLayout,
  LabelLayerRenderer,
  resolveEdgeLabelStyle,
  resolveNodeLabelStyle,
  toLabelScreenPx,
} from '../renderer/labelRenderer.js';
import type { EdgeConfig, GraphEdge, LabelRenderer, LayoutNode, NodeConfig } from '../types.js';

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
  container.appendChild(mainCanvas);
  return new LabelLayerRenderer(container, mainCanvas);
}

afterEach(() => {
  vi.restoreAllMocks();
  Object.defineProperty(window, 'devicePixelRatio', { value: 1, configurable: true });
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
    expect(toLabelScreenPx(12, 2, 1)).toBe(24);
    expect(toLabelScreenPx(12, 2, 2)).toBe(48);
    expect(toLabelScreenPx(12, 2, 4)).toBe(48);
    expect(toLabelScreenPx(12, 2, 0.1)).toBe(6);
  });
});

describe('custom label helpers', () => {
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
    expect(ctx.translate).toHaveBeenCalledWith(100, 132.4);
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
