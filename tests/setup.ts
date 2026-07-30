import { vi } from 'vitest';

vi.mock('regl', async () => {
  const { createReglMock } = await import('./helpers/reglMock');
  return {
    default: (options: { gl: WebGLRenderingContext }) => createReglMock(options.gl),
  };
});
