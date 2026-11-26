import { RadialLayout } from '@antv/layout';
import type { LayoutExtension } from '../../extensions/contracts';
import type { LayoutConstructor } from '../../types';
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
