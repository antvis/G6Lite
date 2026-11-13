import { RandomLayout } from '@antv/layout/lib/algorithm/random/index.js';
import type { LayoutExtension } from '../../extensions/contracts';
import type { LayoutConstructor } from '../layoutLoader';
import { runLibraryLayout } from '../libraryLayout';

const random: LayoutExtension = {
  execute(data, { options, signal }) {
    return runLibraryLayout(
      RandomLayout as unknown as LayoutConstructor,
      data,
      { ...options, type: 'random' },
      signal,
    );
  },
};

export default random;
