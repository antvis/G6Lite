export const vertexShader = `
precision highp float;
attribute vec2 a_position;
attribute vec3 a_normalSide;
attribute vec4 a_style;
attribute vec3 a_color;
attribute float a_pickingIndex;
attribute float a_hitAreaWidth;
uniform vec2 u_translate;
uniform float u_scale;
uniform vec2 u_resolution;
uniform bool u_picking;
varying vec3 v_color;
varying float v_edgePos;
varying float v_dashCycle;
varying float v_opacity;

vec3 encodePickingColor(float pickingIndex) {
  float id = pickingIndex + 1.0;
  float r = floor(id / 65536.0);
  float g = floor(mod(id, 65536.0) / 256.0);
  float b = mod(id, 256.0);
  return vec3(r, g, b) / 255.0;
}

void main() {
  vec2 centerPx = (a_position + u_translate) * u_scale;
  float width = u_picking ? max(a_style.x, a_hitAreaWidth) : a_style.x;
  vec2 posPx = centerPx + a_normalSide.xy * width * 0.5 * a_normalSide.z;
  vec2 ndc = vec2(posPx.x * 2.0 / u_resolution.x - 1.0, 1.0 - posPx.y * 2.0 / u_resolution.y);
  gl_Position = vec4(ndc, 0.0, 1.0);
  v_color = u_picking ? encodePickingColor(a_pickingIndex) : a_color;
  v_edgePos = a_style.z * u_scale;
  v_dashCycle = a_style.y;
  v_opacity = u_picking ? 1.0 : a_style.w;
}
`;
