import { describe, expect, it, vi } from 'vitest';
import { register } from '../extensions/index.js';
import {
  BaseNode,
  BreathingNode,
  getNodeBaseType,
  getNodeExtension,
  type NodeOverlayDrawParams,
  registerNode,
} from '../extensions/node.js';

describe('node extension registry', () => {
  it('registers object-style node extensions', () => {
    registerNode('custom-rect-node', { base: 'rect', style: { width: 120, height: 48 } });

    expect(getNodeBaseType({ type: 'custom-rect-node' })).toBe('rect');
    expect(getNodeExtension('custom-rect-node')?.style).toMatchObject({ width: 120, height: 48 });
  });

  it('registers BaseNode subclasses through register()', () => {
    class BadgeNode extends BaseNode {
      base = 'rect' as const;
      style = { width: 80, height: 32 };
    }

    register('node', 'badge-node', BadgeNode);

    expect(getNodeBaseType({ type: 'badge-node' })).toBe('rect');
    expect(getNodeExtension('badge-node')).toBeInstanceOf(BadgeNode);
  });

  it('registers node factories through register()', () => {
    register('node', 'factory-node', () => ({
      base: 'rect',
      style: { fill: '#fff' },
    }));

    expect(getNodeBaseType({ type: 'factory-node' })).toBe('rect');
    expect(getNodeExtension('factory-node')?.style).toEqual({ fill: '#fff' });
  });

  it('provides the built-in breathing-node extension', () => {
    const extension = getNodeExtension('breathing-node');

    expect(extension).not.toBeInstanceOf(BreathingNode);
    expect(getNodeBaseType({ type: 'breathing-node' })).toBe('circle');
    expect(extension?.stateStyles?.selected?.haloWidth).toBe(14);
  });

  it('breathing-node overlay only animates active nodes', () => {
    const extension = getNodeExtension('breathing-node');
    const ctx = {
      save: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      stroke: vi.fn(),
      restore: vi.fn(),
      set strokeStyle(_value: string) {},
      set lineWidth(_value: number) {},
    } as unknown as CanvasRenderingContext2D;

    const inactive = extension!.drawOverlay!(ctx, {
      node: { id: 'n1', x: 0, y: 0, states: new Set() } as unknown as NodeOverlayDrawParams['node'],
      x: 10,
      y: 20,
      nodeSize: 24,
      dpr: 1,
      zoom: 1,
      camera: { x: 0, y: 0, zoom: 1 },
      time: 0,
    });
    expect(inactive).toBe(false);

    const active = extension!.drawOverlay!(ctx, {
      node: {
        id: 'n1',
        x: 0,
        y: 0,
        states: new Set(['selected']),
      } as unknown as NodeOverlayDrawParams['node'],
      x: 10,
      y: 20,
      nodeSize: 24,
      dpr: 1,
      zoom: 1,
      camera: { x: 0, y: 0, zoom: 1 },
      time: 0,
    });

    expect(active).toBe(true);
    expect(ctx.arc).toHaveBeenCalled();
    expect(ctx.stroke).toHaveBeenCalled();
  });
});
