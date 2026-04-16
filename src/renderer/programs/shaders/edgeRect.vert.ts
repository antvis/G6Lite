export const vertexShader = `
attribute vec2 a_source;
attribute vec2 a_target;
attribute float a_posCoef;
attribute float a_normalCoef;
attribute float a_lineWidth;
attribute vec3 a_color;
attribute vec3 a_pickingColor;
uniform vec2 u_translate;
uniform float u_scale;
uniform vec2 u_resolution;
uniform bool u_picking;
varying vec3 v_color;
void main() {
  vec2 srcPx = (a_source + u_translate) * u_scale;
  vec2 tgtPx = (a_target + u_translate) * u_scale;
  vec2 basePx = mix(srcPx, tgtPx, a_posCoef);
  vec2 dir = tgtPx - srcPx;
  float len = length(dir);
  vec2 normal = len > 0.001 ? vec2(-dir.y, dir.x) / len : vec2(0.0, 1.0);
  vec2 posPx = basePx + normal * a_lineWidth * 0.5 * a_normalCoef;
  vec2 ndc = vec2(posPx.x * 2.0 / u_resolution.x - 1.0, 1.0 - posPx.y * 2.0 / u_resolution.y);
  gl_Position = vec4(ndc, 0.0, 1.0);
  v_color = u_picking ? a_pickingColor : a_color;
}
`;
