export const fragmentShader = `
precision highp float;
uniform bool u_picking;
varying vec2 v_circleCoord;
varying vec3 v_color;
varying vec3 v_pickingColor;
varying vec3 v_strokeColor;
varying float v_strokeWidthRatio;
varying float v_opacity;
varying float v_haloRatio;
varying float v_aa;
void main() {
  float dist = length(v_circleCoord);
  float aa = v_aa;

  float outerEdge = 0.5;
  float nodeEdge = 0.5 - v_haloRatio;
  float strokeInner = nodeEdge - v_strokeWidthRatio;

  if (u_picking) {
    if (dist > nodeEdge) discard;
    gl_FragColor = vec4(v_pickingColor, 1.0);
    return;
  }

  // Halo region
  if (v_haloRatio > 0.001 && dist > nodeEdge - aa) {
    if (dist > outerEdge + aa) discard;
    float haloAlpha = 1.0 - smoothstep(nodeEdge, outerEdge, dist);
    haloAlpha = haloAlpha * 0.25;
    // Smooth inner blend with stroke/fill
    float innerBlend = smoothstep(nodeEdge - aa, nodeEdge + aa, dist);
    if (innerBlend < 1.0) {
      vec3 innerColor = v_strokeWidthRatio > 0.001 ? v_strokeColor : v_color;
      float innerAlpha = v_opacity * (1.0 - innerBlend);
      float haloA = haloAlpha * v_opacity * innerBlend;
      gl_FragColor = vec4(innerColor * innerAlpha + v_color * haloA, innerAlpha + haloA);
      return;
    }
    gl_FragColor = vec4(v_color, haloAlpha * v_opacity);
    return;
  }

  // Outside node (no halo)
  if (dist > nodeEdge + aa) discard;

  // Stroke region
  if (v_strokeWidthRatio > 0.001) {
    float outerAlpha = 1.0 - smoothstep(nodeEdge - aa, nodeEdge + aa, dist);
    float strokeMix = smoothstep(strokeInner - aa, strokeInner + aa, dist);
    vec3 col = mix(v_color, v_strokeColor, strokeMix);
    gl_FragColor = vec4(col, v_opacity * outerAlpha);
    return;
  }

  // Fill only
  float alpha = 1.0 - smoothstep(nodeEdge - aa, nodeEdge + aa, dist);
  gl_FragColor = vec4(v_color, v_opacity * alpha);
}
`;
