export const vertexShader = `
attribute vec2 a_source;
attribute vec2 a_target;
attribute float a_posCoef;
attribute float a_srcRadius;
attribute float a_tgtRadius;
attribute float a_srcArrowPx;
attribute float a_tgtArrowPx;
attribute vec3 a_color;
attribute float a_opacity;
attribute vec3 a_pickingColor;
uniform vec2 u_translate;
uniform float u_scale;
uniform vec2 u_resolution;
uniform bool u_picking;
varying vec3 v_color;
varying float v_opacity;
varying vec3 v_pickingColor;
void main() {
  vec2 srcPx = (a_source + u_translate) * u_scale;
  vec2 tgtPx = (a_target + u_translate) * u_scale;
  vec2 dir = tgtPx - srcPx;
  float len = length(dir);
  vec2 unitDir = len > 0.001 ? dir / len : vec2(1.0, 0.0);
  srcPx += unitDir * (a_srcRadius * u_scale + a_srcArrowPx);
  tgtPx -= unitDir * (a_tgtRadius * u_scale + a_tgtArrowPx);
  vec2 posPx = mix(srcPx, tgtPx, a_posCoef);
  vec2 ndc = vec2(posPx.x * 2.0 / u_resolution.x - 1.0, 1.0 - posPx.y * 2.0 / u_resolution.y);
  gl_Position = vec4(ndc, 0.0, 1.0);
  v_color = a_color;
  v_opacity = u_picking ? 1.0 : a_opacity;
  v_pickingColor = a_pickingColor;
}
`;
