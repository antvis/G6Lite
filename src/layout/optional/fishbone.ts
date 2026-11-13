import type { LayoutExtension } from '../../extensions/contracts';
import { executeFishboneLayout, type FishboneLayoutOptions } from '../fishboneLayout';

const fishbone: LayoutExtension = {
  execute(data, { options }) {
    return executeFishboneLayout(data, options as FishboneLayoutOptions);
  },
};

export default fishbone;
