import type { LayoutConstructor } from '../types';
import { BUILTIN_LAYOUTS } from './builtinLayouts';

export type LayoutLoader = () => Promise<LayoutConstructor>;

/** Resolve a built-in algorithm without starting the import. */
export function getLayoutLoader(type: string): LayoutLoader | undefined {
  const LayoutClass = BUILTIN_LAYOUTS[type];
  return LayoutClass ? async () => LayoutClass : undefined;
}
