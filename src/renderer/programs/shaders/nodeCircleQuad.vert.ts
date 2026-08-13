export const vertexShader = `
attribute vec2 a_center;
attribute float a_size;
attribute vec2 a_corner;
attribute vec3 a_color;
attribute vec3 a_pickingColor;
attribute float a_strokeWidth;
attribute vec3 a_strokeColor;
attribute float a_opacity;
attribute float a_haloWidth;
uniform vec2 u_translate;
uniform float u_scale;
uniform vec2 u_resolution;
varying vec2 v_circleCoord;
varying vec3 v_color;
varying vec3 v_pickingColor;
varying vec3 v_strokeColor;
varying float v_strokeWidthRatio;
varying float v_opacity;
varying float v_haloRatio;
varying float v_aa;
void main() {
  float totalSize = a_size + a_haloWidth * 2.0;
  vec2 pos = a_center + a_corner * totalSize * 0.5;
  vec2 p = (pos + u_translate) * u_scale / u_resolution;
  gl_Position = vec4(p * vec2(2.0, -2.0) + vec2(-1.0, 1.0), 0.0, 1.0);

  float renderedSize = totalSize * u_scale;
  v_circleCoord = a_corner * 0.5;
  v_color = a_color;
  v_pickingColor = a_pickingColor;
  v_strokeColor = a_strokeColor;
  v_strokeWidthRatio = totalSize > 0.0 ? a_strokeWidth / totalSize : 0.0;
  v_opacity = a_opacity;
  v_haloRatio = totalSize > 0.0 ? a_haloWidth / totalSize : 0.0;
  v_aa = renderedSize > 0.0 ? 0.8 / renderedSize : 0.005;
}
`;
