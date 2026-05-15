/**
 * Built-in light/dark themes and token merge.
 * OpenSpec: theme spec.
 */

import type { ThemeTokens } from './types.js';

const CATEGORY_PALETTE = ['#1783FF', '#00C9C9', '#F08F56', '#D580FF', '#7863FF', '#DB9D0D', '#60C42D', '#FF80CA', '#2491B3', '#17C76F'];

const light: ThemeTokens = {
  nodeFill: '#5B8FF9',
  nodeSize: 24,
  nodeStroke: '#fff',
  nodeStrokeWidth: 0,
  edgeStroke: '#99ADD1',
  edgeLineWidth: 1,
  edgeArrow: true,
  canvasBackground: '#fff',
  edgeDefaultColor: '#99ADD1',
  edgeCategoryPalette: CATEGORY_PALETTE,
  edgeStateStyles: {
    active: { lineWidth: 2, opacity: 1 },
    selected: { lineWidth: 3, opacity: 1, stroke: '#1783FF' },
    disabled: { opacity: 0.45, lineDash: [4, 4] },
    highlight: { lineWidth: 3, opacity: 1 },
    inactive: { opacity: 0.15 },
  },
  nodeStateStyles: {
    active: { strokeWidth: 2, stroke: '#5B8FF9', opacity: 1 },
    selected: { strokeWidth: 3, stroke: '#1783FF', opacity: 1 },
    disabled: { opacity: 0.25 },
    highlight: { strokeWidth: 2, opacity: 1 },
    inactive: { opacity: 0.15 },
  },
};

const dark: ThemeTokens = {
  nodeFill: '#5B8FF9',
  nodeSize: 24,
  nodeStroke: '#333',
  nodeStrokeWidth: 0,
  edgeStroke: '#4a4a4a',
  edgeLineWidth: 1,
  edgeArrow: true,
  canvasBackground: '#1a1a1a',
  edgeDefaultColor: '#4a4a4a',
  edgeCategoryPalette: CATEGORY_PALETTE,
  edgeStateStyles: {
    active: { lineWidth: 2, opacity: 1 },
    selected: { lineWidth: 3, opacity: 1, stroke: '#5B8FF9' },
    disabled: { opacity: 0.45, lineDash: [4, 4] },
    highlight: { lineWidth: 3, opacity: 1 },
    inactive: { opacity: 0.15 },
  },
  nodeStateStyles: {
    active: { strokeWidth: 2, stroke: '#5B8FF9', opacity: 1 },
    selected: { strokeWidth: 3, stroke: '#5B8FF9', opacity: 1 },
    disabled: { opacity: 0.25 },
    highlight: { strokeWidth: 2, opacity: 1 },
    inactive: { opacity: 0.15 },
  },
};

const presets: Record<string, ThemeTokens> = { light, dark };

/**
 * Resolve theme option to a full ThemeTokens object.
 * String -> preset; object -> preset + overrides.
 */
export function resolveTheme(theme: 'light' | 'dark' | { type: 'light' | 'dark' } & Partial<ThemeTokens>): ThemeTokens {
  if (theme === 'light' || theme === 'dark') {
    return { ...presets[theme] };
  }
  const base = presets[theme.type] ?? light;
  return { ...base, ...theme };
}

export { light, dark, presets };
