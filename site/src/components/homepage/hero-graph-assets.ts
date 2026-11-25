/** Hashed asset URLs shared by HTML preload hints and the deferred renderer. */
export const heroGraphAssets = {
  desktop: new URL('./hero-graph-data.json', import.meta.url).href,
  compact: new URL('./hero-graph-mobile.json', import.meta.url).href,
};

/** Self-contained so the same policy can run before hydration in the HTML hint. */
export function prefersCompactHeroGraph(): boolean {
  const narrow = window.matchMedia('(max-width: 767px)').matches;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  const cores = navigator.hardwareConcurrency;
  return (
    narrow ||
    (typeof memory === 'number' && memory > 0 && memory <= 4) ||
    (typeof cores === 'number' && cores > 0 && cores <= 2)
  );
}
