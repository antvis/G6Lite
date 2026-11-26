import { RandomLayout } from '@antv/layout';
import type { LayoutExtension } from '../../extensions/contracts';
import type { LayoutConstructor } from '../../types';
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
