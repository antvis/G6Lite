export const vertexShader = `
attribute vec2 a_source;
attribute vec2 a_target;
attribute vec2 a_barycentric;
attribute float a_arrowSize;
attribute float a_lineWidth;
attribute float a_nodeRadius;
attribute vec3 a_color;
attribute vec3 a_pickingColor;
attribute float a_opacity;
uniform vec2 u_translate;
uniform float u_scale;
uniform vec2 u_resolution;
uniform bool u_picking;
varying vec3 v_color;
varying float v_opacity;
void main() {
  vec2 srcPx = (a_source + u_translate) * u_scale;
  vec2 tgtPx = (a_target + u_translate) * u_scale;
  vec2 dir = tgtPx - srcPx;
  float len = length(dir);
  vec2 unitDir = len > 0.001 ? dir / len : vec2(1.0, 0.0);
  vec2 unitNormal = vec2(-unitDir.y, unitDir.x);

  // Offset arrow tip to node edge (nodeRadius is in graph coords, convert to px)
  float radiusPx = a_nodeRadius * u_scale;
  vec2 tipPx = tgtPx - unitDir * radiusPx;

  float arrowLength = a_arrowSize;
  // Arrow base wider than edge: lineWidth + 12px (6px overshoot each side)
  float arrowWidth = a_lineWidth + 12.0;

  // a_barycentric encodes vertex position:
  //   x: perpendicular offset (0=left, 0.5=center, 1=right)
  //   y: along-edge position (0=base, 1=tip, 0.2=indent)
  vec2 posPx = tipPx
    - unitDir * arrowLength * (1.0 - a_barycentric.y)
    + unitNormal * arrowWidth * (a_barycentric.x - 0.5);

  vec2 ndc = vec2(posPx.x * 2.0 / u_resolution.x - 1.0, 1.0 - posPx.y * 2.0 / u_resolution.y);
  gl_Position = vec4(ndc, 0.0, 1.0);
  v_color = u_picking ? a_pickingColor : a_color;
  v_opacity = u_picking ? 1.0 : a_opacity;
}
`;
