import { describe, expect, it, vi } from 'vitest';
import { registerEdge } from '@src/extensions/edge.js';
import { registerNode } from '@src/extensions/node.js';
import {
  analyzeEdgeConfig,
  analyzeNodeConfig,
  resolveEdgeStyle,
  resolveNodeStyle,
} from '@src/renderer/style.js';
import { resolveTheme } from '@src/theme.js';
import type { EdgeConfig, NodeConfig } from '@src/types.js';

/**
 * Regression for the data-redundancy refactor (Phase 4): the Renderer now
 * references DataModel's element objects directly, whose `states` is a Set
 * (not an array). resolveNodeStyle/resolveEdgeStyle must read either shape.
 */
describe('style state resolution: Set vs Array', () => {
  const theme = resolveTheme('light');

  describe('node states (static / cached config)', () => {
    const config: NodeConfig = {
      style: { fill: '#aaa', stroke: '#000' },
      stateStyles: { selected: { fill: '#f00' } },
    };
    analyzeNodeConfig(config, theme);

    it('applies state override from a Set', () => {
      const node = { id: 'n', x: 0, y: 0, states: new Set(['selected']) as any };
      const style = resolveNodeStyle(node, config, theme);
      expect(style.fill).toBe('#f00');
      expect(style.haloWidth).toBe(12); // selected → halo 12
    });

    it('applies state override from an Array', () => {
      const node = { id: 'n', x: 0, y: 0, states: ['selected'] as any };
      const style = resolveNodeStyle(node, config, theme);
      expect(style.fill).toBe('#f00');
      expect(style.haloWidth).toBe(12);
    });

    it('hidden state sets opacity 0 (Set)', () => {
      const node = { id: 'n', x: 0, y: 0, states: new Set(['hidden']) as any };
      const style = resolveNodeStyle(node, config, theme);
      expect(style.opacity).toBe(0);
    });

    it('empty Set leaves base style untouched', () => {
      const node = { id: 'n', x: 0, y: 0, states: new Set() as any };
      const style = resolveNodeStyle(node, config, theme);
      expect(style.fill).toBe('#aaa');
      expect(style.haloWidth).toBe(0);
    });

    it('applies application-defined state styles', () => {
      const customConfig: NodeConfig = {
        style: { fill: '#aaa' },
        stateStyles: { 'connect-source': { stroke: '#f60', strokeWidth: 3 } },
      };
      analyzeNodeConfig(customConfig, theme);
      const node = { id: 'n', x: 0, y: 0, states: new Set(['connect-source']) as any };
      const style = resolveNodeStyle(node, customConfig, theme);
      expect(style.stroke).toBe('#f60');
      expect(style.strokeWidth).toBe(3);
    });

    it('returns isolated results and invalidates overridden color caches', () => {
      const isolatedConfig: NodeConfig = {
        style: { fill: '#aaa', stroke: '#000', size: 20 },
        stateStyles: { active: { fill: '#0f0', stroke: '#f00', strokeWidth: 3 } },
      };
      analyzeNodeConfig(isolatedConfig, theme);

      const active = resolveNodeStyle(
        { id: 'active', x: 0, y: 0, states: new Set(['active']) as any },
        isolatedConfig,
        theme,
      );
      const normal = resolveNodeStyle({ id: 'normal', x: 0, y: 0 }, isolatedConfig, theme);

      expect(active).not.toBe(normal);
      expect(active).toMatchObject({ fill: '#0f0', stroke: '#f00', strokeWidth: 3 });
      expect(active.fillRGB).toBeUndefined();
      expect(active.strokeRGB).toBeUndefined();
      expect(normal.fillRGB).toBeDefined();
      expect(normal.strokeRGB).toBeDefined();
    });
  });

  describe('node states (dynamic config)', () => {
    const config: NodeConfig = {
      style: { fill: () => '#aaa' }, // function → dynamic path
      stateStyles: { active: { fill: '#0f0' } },
    };
    analyzeNodeConfig(config, theme);

    it('applies state override from a Set on the dynamic path', () => {
      const node = { id: 'n', x: 0, y: 0, states: new Set(['active']) as any };
      const style = resolveNodeStyle(node, config, theme);
      expect(style.fill).toBe('#0f0');
      expect(style.haloWidth).toBe(8); // active → halo 8
    });

    it('keeps consecutive source and target style results isolated', () => {
      const sizeConfig: NodeConfig = {
        style: {
          width: (node) => (node.id === 'source' ? 80 : 40),
          height: (node) => (node.id === 'source' ? 30 : 20),
        },
      };
      analyzeNodeConfig(sizeConfig, theme);

      const sourceStyle = resolveNodeStyle({ id: 'source', x: 0, y: 0 }, sizeConfig, theme);
      const targetStyle = resolveNodeStyle({ id: 'target', x: 10, y: 10 }, sizeConfig, theme);

      expect(sourceStyle).not.toBe(targetStyle);
      expect(sourceStyle).toMatchObject({ width: 80, height: 30 });
      expect(targetStyle).toMatchObject({ width: 40, height: 20 });
    });

    it('falls back to the declared node extension style when getStyle throws', () => {
      const error = new Error('node getStyle failed');
      const report = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      registerNode('throwing-node-style', {
        style: { fill: '#123456', size: 24 },
        getStyle: () => {
          throw error;
        },
      });
      const extensionConfig: NodeConfig = { type: 'throwing-node-style' };
      analyzeNodeConfig(extensionConfig, theme);

      const style = resolveNodeStyle({ id: 'n', x: 0, y: 0 }, extensionConfig, theme);

      expect(style).toMatchObject({ fill: '#123456', size: 24 });
      expect(report).toHaveBeenCalledWith(
        '[G6-GL] node extension "throwing-node-style" failed during getStyle',
        error,
      );
      report.mockRestore();
    });
  });

  describe('edge states', () => {
    const config: EdgeConfig = {
      style: { stroke: '#ccc' },
      stateStyles: { active: { stroke: '#00f', lineWidth: 3 } },
    };
    analyzeEdgeConfig(config, theme);
    const src = { id: 's', x: 0, y: 0 };
    const tgt = { id: 't', x: 10, y: 10 };

    it('applies edge state override from a Set', () => {
      const edge = { source: 's', target: 't', states: new Set(['active']) as any };
      const style = resolveEdgeStyle(src, tgt, edge, config, theme);
      expect(style.stroke).toBe('#00f');
      expect(style.lineWidth).toBe(3);
    });

    it('applies edge state override from an Array', () => {
      const edge = { source: 's', target: 't', states: ['active'] as any };
      const style = resolveEdgeStyle(src, tgt, edge, config, theme);
      expect(style.stroke).toBe('#00f');
      expect(style.lineWidth).toBe(3);
    });

    it('preserves the configured edge width for default theme highlight', () => {
      const widthConfig: EdgeConfig = { style: { stroke: '#99ADD1', lineWidth: 2 } };
      analyzeEdgeConfig(widthConfig, theme);

      const highlighted = resolveEdgeStyle(
        src,
        tgt,
        { source: 's', target: 't', states: ['highlight'] },
        widthConfig,
        theme,
      );

      expect(highlighted.lineWidth).toBe(2);
      expect(highlighted.stroke).toBe('#5B8FF9');
    });

    it('hidden edge state sets opacity 0 (Set)', () => {
      const edge = { source: 's', target: 't', states: new Set(['hidden']) as any };
      const style = resolveEdgeStyle(src, tgt, edge, config, theme);
      expect(style.opacity).toBe(0);
    });

    it('applies edge state override from a Set on the dynamic path', () => {
      const dynamicConfig: EdgeConfig = {
        style: { stroke: () => '#ccc' },
        stateStyles: { selected: { stroke: '#1783ff', lineWidth: 2 } },
      };
      analyzeEdgeConfig(dynamicConfig, theme);
      const edge = { source: 's', target: 't', states: new Set(['selected']) as any };
      const style = resolveEdgeStyle(src, tgt, edge, dynamicConfig, theme);
      expect(style.stroke).toBe('#1783ff');
      expect(style.lineWidth).toBe(2);
    });

    it('applies edge state override when the whole edge style is a function', () => {
      const dynamicConfig: EdgeConfig = {
        style: () => ({ stroke: '#ccc', lineWidth: 1 }),
        stateStyles: { selected: { stroke: '#1783ff', lineWidth: 2 } },
      };
      analyzeEdgeConfig(dynamicConfig, theme);
      const edge = { source: 's', target: 't', states: new Set(['selected']) as any };
      const style = resolveEdgeStyle(src, tgt, edge, dynamicConfig, theme);
      expect(style.stroke).toBe('#1783ff');
      expect(style.lineWidth).toBe(2);
    });

    it('keeps cached dynamic edge styles isolated across hover-state resolution', () => {
      const dynamicConfig: EdgeConfig = {
        style: (edge) => ({
          stroke: edge.id === 'self-loop' ? '#f60' : '#ccc',
          lineWidth: 1,
          endArrow: true,
        }),
        stateStyles: { highlight: { stroke: '#f00', lineWidth: 3 } },
      };
      analyzeEdgeConfig(dynamicConfig, theme);

      const incoming = resolveEdgeStyle(
        src,
        tgt,
        { id: 'incoming', source: 's', target: 't' },
        dynamicConfig,
        theme,
      );
      const outgoing = resolveEdgeStyle(
        src,
        tgt,
        { id: 'outgoing', source: 's', target: 't' },
        dynamicConfig,
        theme,
      );
      const selfLoop = resolveEdgeStyle(
        src,
        src,
        {
          id: 'self-loop',
          source: 's',
          target: 's',
          states: new Set(['highlight']) as any,
        },
        dynamicConfig,
        theme,
      );

      expect(incoming).not.toBe(outgoing);
      expect(outgoing).not.toBe(selfLoop);
      expect(incoming).toMatchObject({ stroke: '#ccc', lineWidth: 1 });
      expect(outgoing).toMatchObject({ stroke: '#ccc', lineWidth: 1 });
      expect(selfLoop).toMatchObject({ stroke: '#f00', lineWidth: 3 });
    });

    it('invalidates a static edge color cache when a state overrides stroke', () => {
      const staticConfig: EdgeConfig = {
        style: { stroke: '#ccc', lineWidth: 1 },
        stateStyles: { active: { stroke: '#f00' } },
      };
      analyzeEdgeConfig(staticConfig, theme);

      const active = resolveEdgeStyle(
        src,
        tgt,
        { source: 's', target: 't', states: ['active'] },
        staticConfig,
        theme,
      );
      const normal = resolveEdgeStyle(src, tgt, { source: 's', target: 't' }, staticConfig, theme);

      expect(active.stroke).toBe('#f00');
      expect(active.strokeRGB).toBeUndefined();
      expect(normal.strokeRGB).toBeDefined();
    });

    it('applies registered edge extension style and user overrides', () => {
      registerEdge('business-edge', {
        base: 'arc',
        style: { stroke: '#f60', lineWidth: 3, curvature: 0.5 },
        stateStyles: { invalid: { stroke: '#f00', lineWidth: 5 } },
      });
      const extensionConfig: EdgeConfig = {
        type: 'business-edge',
        style: { lineWidth: 4 },
      };
      analyzeEdgeConfig(extensionConfig, theme);

      const normal = resolveEdgeStyle(
        src,
        tgt,
        { source: 's', target: 't' },
        extensionConfig,
        theme,
      );
      expect(normal.stroke).toBe('#f60');
      expect(normal.lineWidth).toBe(4);
      expect(normal.curvature).toBe(0.5);

      const invalid = resolveEdgeStyle(
        src,
        tgt,
        { source: 's', target: 't', states: ['invalid'] },
        extensionConfig,
        theme,
      );
      expect(invalid.stroke).toBe('#f00');
      expect(invalid.lineWidth).toBe(5);
    });

    it('falls back to the declared edge extension style when getStyle throws', () => {
      const error = new Error('edge getStyle failed');
      const report = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      registerEdge('throwing-edge-style', {
        style: { stroke: '#654321', lineWidth: 6 },
        getStyle: () => {
          throw error;
        },
      });
      const extensionConfig: EdgeConfig = { type: 'throwing-edge-style' };
      analyzeEdgeConfig(extensionConfig, theme);

      const style = resolveEdgeStyle(
        src,
        tgt,
        { source: 's', target: 't' },
        extensionConfig,
        theme,
      );

      expect(style).toMatchObject({ stroke: '#654321', lineWidth: 6 });
      expect(report).toHaveBeenCalledWith(
        '[G6-GL] edge extension "throwing-edge-style" failed during getStyle',
        error,
      );
      report.mockRestore();
    });
  });
});
