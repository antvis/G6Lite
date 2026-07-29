/**
 * Internal AntV color tokens aligned with @antv/g6 5.1.1.
 *
 * G6 keeps its default theme palettes private, while G2's exported Category10
 * component is the classic #5B8FF9 palette rather than the current theme
 * palette. Keep this small, versioned snapshot internal instead of adding a
 * runtime dependency on either package.
 */

export const ANTV_CATEGORY_10 = [
  '#1783FF',
  '#00C9C9',
  '#F08F56',
  '#D580FF',
  '#7863FF',
  '#DB9D0D',
  '#60C42D',
  '#FF80CA',
  '#2491B3',
  '#17C76F',
] as const;

export const ANTV_DARK_EDGE_CATEGORY_10 = [
  '#0F55A6',
  '#008383',
  '#9C5D38',
  '#8B53A6',
  '#4E40A6',
  '#8F6608',
  '#3E801D',
  '#A65383',
  '#175E75',
  '#0F8248',
] as const;

export const ANTV_BADGE_PALETTE = ['#7E92B5', '#F4664A', '#FFBE3A'] as const;

export const ANTV_PRIMARY_COLOR = '#1783FF';
export const ANTV_LIGHT_EDGE_COLOR = '#99ADD1';
export const ANTV_DARK_EDGE_COLOR = '#637088';
