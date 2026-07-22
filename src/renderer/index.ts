/**
 * @internal Renderer module entry.
 *
 * This barrel is for engine-internal imports. It is intentionally not re-exported
 * from the package root because renderer resources are not part of the public API.
 */
export { createCamera, graphToNDC, screenToGraph } from './camera.js';
export type { Camera } from './camera.js';
export { parseColor } from './color.js';
export { ComboRenderer } from './comboRenderer.js';
export {
  createCubicPath,
  createLinePath,
  createQuadraticPath,
  findPathBoundarySample,
  getBoundaryDistance,
  getParallelEdgeCurvature,
  getRectBoundaryDistance,
  sampleEdgePath,
} from './edgePath.js';
export type {
  BoundarySample,
  CubicEdgePath,
  EdgePath,
  LineEdgePath,
  NodeBoundary,
  Point,
  QuadraticEdgePath,
  RectBoundary,
} from './edgePath.js';
export { createProgram, getGL } from './gl.js';
export { LabelGrid } from './labelGrid.js';
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
} from './labelRenderer.js';
export { PickingManager, encodeId } from './picking.js';
export type { PickingResult } from './picking.js';
export { Renderer } from './renderer.js';
export type { RendererData } from './renderer.js';
export {
  analyzeEdgeConfig,
  analyzeNodeConfig,
  resolveEdgeStyle,
  resolveNodeStyle,
} from './style.js';
export type { ResolvedEdgeStyle, ResolvedNodeStyle } from './style.js';
