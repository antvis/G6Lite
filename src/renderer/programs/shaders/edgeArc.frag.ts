export const fragmentShader = `
precision mediump float;
varying vec3 v_color;
varying float v_opacity;
void main() {
  gl_FragColor = vec4(v_color, v_opacity);
}
`;
