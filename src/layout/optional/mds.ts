import { MDSLayout } from '@antv/layout/lib/algorithm/mds/index.js';
import type { LayoutExtension } from '../../extensions/contracts';
import type { LayoutConstructor } from '../layoutLoader';
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
