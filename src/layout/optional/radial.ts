import { RadialLayout } from '@antv/layout/lib/algorithm/radial/index.js';
import type { LayoutExtension } from '../../extensions/contracts';
import type { LayoutConstructor } from '../layoutLoader';
import { runLibraryLayout } from '../libraryLayout';

const radial: LayoutExtension = {
  execute(data, { options, signal }) {
    return runLibraryLayout(
      RadialLayout as unknown as LayoutConstructor,
      data,
      { ...options, type: 'radial' },
      signal,
    );
  },
};

export default radial;
