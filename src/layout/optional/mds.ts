import { registerLayoutLoader, type LayoutConstructor } from '../layoutLoader';

/** Enable the optional MDS layout for Graph and runLayout. */
export function enableMDSLayout(): void {
  registerLayoutLoader('mds', () =>
    import('@antv/layout/lib/algorithm/mds/index.js').then(
      ({ MDSLayout }) => MDSLayout as unknown as LayoutConstructor,
    ),
  );
}
