import { describe, it, expect } from 'vitest';
import {
  resolveNodeStyle,
  resolveEdgeStyle,
  analyzeNodeConfig,
  analyzeEdgeConfig,
} from '../renderer/style.js';
import { resolveTheme } from '../theme.js';
import type { NodeConfig, EdgeConfig } from '../types.js';

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

    it('hidden edge state sets opacity 0 (Set)', () => {
      const edge = { source: 's', target: 't', states: new Set(['hidden']) as any };
      const style = resolveEdgeStyle(src, tgt, edge, config, theme);
      expect(style.opacity).toBe(0);
    });
  });
});
