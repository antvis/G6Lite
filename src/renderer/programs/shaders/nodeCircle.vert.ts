export const vertexShader = `
attribute vec2 a_position;
attribute float a_size;
attribute vec3 a_color;
attribute vec3 a_pickingColor;
attribute float a_strokeWidth;
attribute vec3 a_strokeColor;
attribute float a_opacity;
attribute float a_haloWidth;
uniform vec2 u_translate;
uniform float u_scale;
uniform float u_pointScale;
uniform vec2 u_resolution;
varying vec3 v_color;
varying vec3 v_pickingColor;
varying vec3 v_strokeColor;
varying float v_strokeWidthRatio;
varying float v_opacity;
varying float v_haloRatio;
varying float v_aa;
void main() {
  vec2 p = (a_position + u_translate) * u_scale;
  vec2 ndc = vec2(p.x * 2.0 / u_resolution.x - 1.0, 1.0 - p.y * 2.0 / u_resolution.y);
  gl_Position = vec4(ndc, 0.0, 1.0);
  float totalSize = a_size + a_haloWidth * 2.0;
  float pointSize = totalSize * u_scale;
  gl_PointSize = pointSize * u_pointScale;
  v_color = a_color;
  v_pickingColor = a_pickingColor;
  v_strokeColor = a_strokeColor;
  v_strokeWidthRatio = totalSize > 0.0 ? a_strokeWidth / totalSize : 0.0;
  v_opacity = a_opacity;
  v_haloRatio = totalSize > 0.0 ? a_haloWidth / totalSize : 0.0;
  v_aa = pointSize > 0.0 ? 0.8 / pointSize : 0.005;
}
`;
