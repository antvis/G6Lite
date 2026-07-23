import { describe, expect, it } from 'vitest';
import { dark, light, presets, resolveTheme } from '@src/theme.js';

describe('resolveTheme', () => {
  it('should return light preset for "light" string', () => {
    const result = resolveTheme('light');
    expect(result.nodeFill).toBe(light.nodeFill);
    expect(result.canvasBackground).toBe('#fff');
  });

  it('should return dark preset for "dark" string', () => {
    const result = resolveTheme('dark');
    expect(result.canvasBackground).toBe('#1a1a1a');
  });

  it('should return a copy (not reference) of preset', () => {
    const result = resolveTheme('light');
    expect(result).not.toBe(light);
    expect(result).toEqual(light);
  });

  it('should override preset values with custom values', () => {
    const result = resolveTheme({ type: 'light', nodeFill: '#FF0000', nodeSize: 40 });
    expect(result.nodeFill).toBe('#FF0000');
    expect(result.nodeSize).toBe(40);
    // Other values should come from light preset
    expect(result.edgeStroke).toBe(light.edgeStroke);
  });

  it('should merge dark preset with overrides', () => {
    const result = resolveTheme({ type: 'dark', nodeFill: '#00FF00' });
    expect(result.nodeFill).toBe('#00FF00');
    expect(result.canvasBackground).toBe('#1a1a1a'); // from dark preset
  });

  it('should fallback to light for unknown type', () => {
    const invalidTheme = { type: 'unknown', nodeSize: 50 } as unknown as Parameters<
      typeof resolveTheme
    >[0];
    const result = resolveTheme(invalidTheme);
    expect(result.nodeSize).toBe(50);
    expect(result.canvasBackground).toBe('#fff'); // light default
  });
});

describe('presets', () => {
  it('should have light and dark presets', () => {
    expect(presets.light).toBeDefined();
    expect(presets.dark).toBeDefined();
  });

  it('light and dark should have same keys', () => {
    const lightKeys = Object.keys(light).sort();
    const darkKeys = Object.keys(dark).sort();
    expect(lightKeys).toEqual(darkKeys);
  });

  it('should have state styles in both presets', () => {
    expect(presets.light.edgeStateStyles).toBeDefined();
    expect(presets.light.nodeStateStyles).toBeDefined();
    expect(presets.dark.edgeStateStyles).toBeDefined();
    expect(presets.dark.nodeStateStyles).toBeDefined();
  });

  it.each([light, dark])('keeps default edge widths stable across interaction states', (theme) => {
    expect(theme.edgeStateStyles?.active?.lineWidth).toBeUndefined();
    expect(theme.edgeStateStyles?.selected?.lineWidth).toBeUndefined();
    expect(theme.edgeStateStyles?.highlight?.lineWidth).toBeUndefined();
  });

  it('maps light node interaction states to halo, outline, and weakening styles', () => {
    expect(light.nodeStateStyles?.active).toMatchObject({ haloWidth: 8, opacity: 1 });
    expect(light.nodeStateStyles?.selected).toMatchObject({
      stroke: '#163B65',
      strokeWidth: 2,
      haloWidth: 12,
      opacity: 1,
    });
    expect(light.nodeStateStyles?.highlight).toMatchObject({
      stroke: '#163B65',
      strokeWidth: 1,
      opacity: 1,
    });
    expect(light.nodeStateStyles?.disabled?.opacity).toBe(0.15);
    expect(light.nodeStateStyles?.inactive?.opacity).toBe(0.25);
  });

  it('uses visible light outlines for selected and highlighted nodes in dark theme', () => {
    expect(dark.nodeStateStyles?.selected?.stroke).toBe('#B7D3FF');
    expect(dark.nodeStateStyles?.highlight?.stroke).toBe('#B7D3FF');
  });

  it.each([light, dark])('uses the primary blue for emphasized edges', (theme) => {
    expect(theme.edgeStateStyles?.active?.stroke).toBe('#5B8FF9');
    expect(theme.edgeStateStyles?.selected?.stroke).toBe('#5B8FF9');
    expect(theme.edgeStateStyles?.highlight?.stroke).toBe('#5B8FF9');
  });

  it('light and dark should have different backgrounds', () => {
    expect(light.canvasBackground).not.toBe(dark.canvasBackground);
  });
});
