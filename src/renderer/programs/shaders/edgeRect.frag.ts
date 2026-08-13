export const fragmentShader = `
precision mediump float;
uniform bool u_picking;
varying vec3 v_color;
varying float v_edgePos;
varying float v_dashCycle;
varying float v_opacity;
void main() {
  if (v_dashCycle > 0.0 && mod(v_edgePos, v_dashCycle) > v_dashCycle * 0.5 && !u_picking) discard;
  gl_FragColor = vec4(v_color, v_opacity);
}
`;
