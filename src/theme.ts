/**
 * Built-in light/dark themes and token merge.
 * OpenSpec: theme spec.
 */

import type { ThemeTokens } from './types';
import {
  ANTV_CATEGORY_10,
  ANTV_DARK_EDGE_CATEGORY_10,
  ANTV_DARK_EDGE_COLOR,
  ANTV_LIGHT_EDGE_COLOR,
  ANTV_PRIMARY_COLOR,
} from './palette';

const light: ThemeTokens = {
  nodeFill: ANTV_PRIMARY_COLOR,
  nodeSize: 24,
  nodeStroke: '#fff',
  nodeStrokeWidth: 0,
  edgeStroke: ANTV_LIGHT_EDGE_COLOR,
  edgeLineWidth: 1,
  edgeArrow: true,
  canvasBackground: '#fff',
  edgeDefaultColor: ANTV_LIGHT_EDGE_COLOR,
  edgeCategoryPalette: [...ANTV_CATEGORY_10],
  edgeStateStyles: {
    active: { stroke: ANTV_PRIMARY_COLOR, opacity: 1 },
    selected: { stroke: ANTV_PRIMARY_COLOR, opacity: 1 },
    disabled: { opacity: 0.15, lineDash: [4, 4] },
    highlight: { stroke: ANTV_PRIMARY_COLOR, opacity: 1 },
    inactive: { opacity: 0.25 },
  },
  nodeStateStyles: {
    active: { haloWidth: 8, opacity: 1 },
    selected: { strokeWidth: 2, stroke: '#163B65', haloWidth: 12, opacity: 1 },
    disabled: { opacity: 0.15 },
    highlight: { strokeWidth: 1, stroke: '#163B65', opacity: 1 },
    inactive: { opacity: 0.25 },
  },
};

const dark: ThemeTokens = {
  nodeFill: ANTV_PRIMARY_COLOR,
  nodeSize: 24,
  nodeStroke: '#333',
  nodeStrokeWidth: 0,
  edgeStroke: ANTV_DARK_EDGE_COLOR,
  edgeLineWidth: 1,
  edgeArrow: true,
  canvasBackground: '#1a1a1a',
  edgeDefaultColor: ANTV_DARK_EDGE_COLOR,
  edgeCategoryPalette: [...ANTV_DARK_EDGE_CATEGORY_10],
  edgeStateStyles: {
    active: { stroke: ANTV_PRIMARY_COLOR, opacity: 1 },
    selected: { stroke: ANTV_PRIMARY_COLOR, opacity: 1 },
    disabled: { opacity: 0.15, lineDash: [4, 4] },
    highlight: { stroke: ANTV_PRIMARY_COLOR, opacity: 1 },
    inactive: { opacity: 0.25 },
  },
  nodeStateStyles: {
    active: { haloWidth: 8, opacity: 1 },
    selected: { strokeWidth: 2, stroke: '#B7D3FF', haloWidth: 12, opacity: 1 },
    disabled: { opacity: 0.15 },
    highlight: { strokeWidth: 1, stroke: '#B7D3FF', opacity: 1 },
    inactive: { opacity: 0.25 },
  },
};

const presets: Record<string, ThemeTokens> = { light, dark };

function cloneTheme(theme: ThemeTokens): ThemeTokens {
  return {
    ...theme,
    edgeCategoryPalette: theme.edgeCategoryPalette ? [...theme.edgeCategoryPalette] : undefined,
  };
}

/**
 * Resolve theme option to a full ThemeTokens object.
 * String -> preset; object -> preset + overrides.
 */
export function resolveTheme(
  theme: 'light' | 'dark' | ({ type: 'light' | 'dark' } & Partial<ThemeTokens>),
): ThemeTokens {
  if (theme === 'light' || theme === 'dark') {
    return cloneTheme(presets[theme]);
  }
  const base = presets[theme.type] ?? light;
  return cloneTheme({ ...base, ...theme });
}

export { dark, light, presets };
