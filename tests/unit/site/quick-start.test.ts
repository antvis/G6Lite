import { describe, expect, it } from 'vitest';
import { D3ForceLayout } from '@antv/layout/lib/algorithm/d3-force/index.js';
import { quickStartNetworkOptions } from '../../../site/src/lib/quick-start';

describe('quick-start network', () => {
  it('enables collision detection in the running D3 layout', async () => {
    const options = quickStartNetworkOptions();
    const layout = new D3ForceLayout({ ...options.layout, alphaDecay: 1 });
    try {
      await layout.execute(options.data);
      expect(layout.getForce('collide')).toBeTypeOf('function');
    } finally {
      layout.stop();
      layout.destroy();
    }
  });
});
