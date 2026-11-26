import { MDSLayout } from '@antv/layout';
import type { LayoutExtension } from '../../extensions/contracts';
import type { LayoutConstructor } from '../../types';
import { runLibraryLayout } from '../libraryLayout';

const mds: LayoutExtension = {
  execute(data, { options, signal }) {
    return runLibraryLayout(
      MDSLayout as unknown as LayoutConstructor,
      data,
      { ...options, type: 'mds' },
      signal,
    );
  },
};

export default mds;
