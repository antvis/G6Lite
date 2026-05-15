export const fragmentShader = `
precision mediump float;
varying vec3 v_color;
varying float v_edgePos;
varying float v_dashCycle;
varying float v_opacity;
void main() {
  if (v_dashCycle > 0.0) {
    float half_cycle = v_dashCycle * 0.5;
    if (mod(v_edgePos, v_dashCycle) > half_cycle) discard;
  }
  gl_FragColor = vec4(v_color, v_opacity);
}
`;
