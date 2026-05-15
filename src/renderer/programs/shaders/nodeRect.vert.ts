export const vertexShader = `
attribute vec2 a_center;
attribute vec2 a_size;
attribute vec2 a_corner;
attribute vec3 a_color;
attribute vec3 a_pickingColor;
attribute float a_strokeWidth;
attribute vec3 a_strokeColor;
attribute float a_opacity;
attribute float a_haloWidth;
attribute float a_borderRadius;
uniform vec2 u_translate;
uniform float u_scale;
uniform vec2 u_resolution;
uniform bool u_picking;
varying vec3 v_color;
varying vec3 v_pickingColor;
varying vec3 v_strokeColor;
varying vec2 v_halfSize;
varying float v_strokeWidth;
varying float v_opacity;
varying float v_haloWidth;
varying float v_borderRadius;
varying vec2 v_pixelCoord;
void main() {
  // Expand quad to accommodate halo
  float haloExpand = a_haloWidth;
  vec2 expandedSize = a_size + vec2(haloExpand * 2.0);
  vec2 pos = a_center + a_corner * expandedSize * 0.5;
  vec2 p = (pos + u_translate) * u_scale;
  vec2 ndc = vec2(p.x * 2.0 / u_resolution.x - 1.0, 1.0 - p.y * 2.0 / u_resolution.y);
  gl_Position = vec4(ndc, 0.0, 1.0);

  v_color = a_color;
  v_pickingColor = a_pickingColor;
  v_strokeColor = a_strokeColor;
  v_halfSize = a_size * 0.5 * u_scale;
  v_strokeWidth = a_strokeWidth * u_scale;
  v_opacity = a_opacity;
  v_haloWidth = a_haloWidth * u_scale;
  v_borderRadius = a_borderRadius * u_scale;
  // Pixel coordinate relative to node center
  v_pixelCoord = a_corner * expandedSize * 0.5 * u_scale;
}
`;
