import { registerLayoutLoader, type LayoutConstructor } from '../layoutLoader';

/** Enable the optional Dagre layout for Graph and runLayout. */
export function enableDagreLayout(): void {
  registerLayoutLoader('dagre', () =>
    import('@antv/layout/lib/algorithm/dagre/index.js').then(
      ({ DagreLayout }) => DagreLayout as unknown as LayoutConstructor,
    ),
  );
}
