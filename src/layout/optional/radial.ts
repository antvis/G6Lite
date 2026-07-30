import { registerLayoutLoader, type LayoutConstructor } from '../layoutLoader';

/** Enable the optional radial layout for Graph and runLayout. */
export function enableRadialLayout(): void {
  registerLayoutLoader('radial', () =>
    import('@antv/layout/lib/algorithm/radial/index.js').then(
      ({ RadialLayout }) => RadialLayout as unknown as LayoutConstructor,
    ),
  );
}
