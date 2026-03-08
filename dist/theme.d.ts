/**
 * Built-in light/dark themes and token merge.
 * OpenSpec: theme spec.
 */
import type { ThemeTokens } from './types.js';
declare const light: ThemeTokens;
declare const dark: ThemeTokens;
declare const presets: Record<string, ThemeTokens>;
/**
 * Resolve theme option to a full ThemeTokens object.
 * String -> preset; object -> preset + overrides.
 */
export declare function resolveTheme(theme: 'light' | 'dark' | {
    type: 'light' | 'dark';
} & Partial<ThemeTokens>): ThemeTokens;
export { light, dark, presets };
//# sourceMappingURL=theme.d.ts.map