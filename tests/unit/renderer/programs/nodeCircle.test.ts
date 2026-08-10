import { describe, expect, it, vi } from 'vitest';
import { NodeCircleProgram } from '@src/renderer/programs/nodeCircle.js';
import { vertexShader } from '@src/renderer/programs/shaders/nodeCircle.vert.js';

describe('NodeCircleProgram picking geometry', () => {
  it('scales point sprites for the downsampled picking viewport', () => {
    expect(vertexShader).toContain('uniform float u_pointScale;');
    expect(vertexShader).toContain('gl_PointSize = pointSize * u_pointScale;');

    const configs: Array<{ uniforms: Record<string, unknown> }> = [];
    const buffer = Object.assign(vi.fn(), { subdata: vi.fn(), destroy: vi.fn() });
    const regl = Object.assign(
      vi.fn((config: { uniforms: Record<string, unknown> }) => {
        configs.push(config);
        return vi.fn();
      }),
      { buffer: vi.fn(() => buffer) },
    );
    const program = new NodeCircleProgram(regl as never);
    program.setItemCount(1);
    const camera = { x: 0, y: 0, zoom: 1 };
    program.render({ width: 801, height: 601, camera });
    program.render({
      width: 801,
      height: 601,
      camera,
      picking: true,
      viewportWidth: 400,
      viewportHeight: 300,
    });

    expect(configs[0].uniforms.u_pointScale).toBe(1);
    expect(
      (configs[1].uniforms.u_pointScale as (_: unknown, props: object) => number)(null, {
        width: 801,
        height: 601,
        viewportWidth: 400,
        viewportHeight: 300,
      }),
    ).toBeCloseTo(300 / 601);
  });
});
