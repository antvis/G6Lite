/**
 * Built-in light/dark themes and token merge.
 * OpenSpec: theme spec.
 */

import type { ThemeTokens } from './types.js';

const light: ThemeTokens = {
  nodeFill: '#5B8FF9',
  nodeSize: 8,
  edgeStroke: '#e2e2e2',
  edgeLineWidth: 1,
  canvasBackground: '#fff',
};

const dark: ThemeTokens = {
  nodeFill: '#5B8FF9',
  nodeSize: 8,
  edgeStroke: '#2f2f2f',
  edgeLineWidth: 1,
  canvasBackground: '#1a1a1a',
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
