/**
 * @internal Renderer module entry.
 *
 * This barrel is for engine-internal imports. It is intentionally not re-exported
 * from the package root because renderer resources are not part of the public API.
 */
export { createCamera, graphToNDC, screenToGraph } from './camera';
export type { Camera } from './camera';
export { parseColor } from './color';
export { ComboRenderer } from './comboRenderer';
export {
  createCubicPath,
  createLinePath,
  createQuadraticPath,
  findPathBoundarySample,
  getBoundaryDistance,
  getParallelEdgeCurvature,
  getRectBoundaryDistance,
  sampleEdgePath,
} from './edgePath';
export type {
  BoundarySample,
  CubicEdgePath,
  EdgePath,
  LineEdgePath,
  NodeBoundary,
  Point,
  QuadraticEdgePath,
  RectBoundary,
} from './edgePath';
export { createProgram, getGL } from './gl';
export { LabelGrid } from './labelGrid';
export {
  LabelLayerRenderer,
  getBuiltInNodeBoundaryAnchor,
  getCustomNodeLabelAnchor,
  getLabelZoom,
  getNodeDecorationAnchor,
  isValidLabelLayout,
  resolveEdgeLabelStyle,
  resolveNodeLabelStyle,
  toLabelScreenPx,
} from './labelRenderer';
export { PickingManager, encodeId } from './picking';
export type { PickingResult } from './picking';
export { Renderer } from './renderer';
export type { RendererData } from './renderer';
export { analyzeEdgeConfig, analyzeNodeConfig, resolveEdgeStyle, resolveNodeStyle } from './style';
export type { ResolvedEdgeStyle, ResolvedNodeStyle } from './style';
