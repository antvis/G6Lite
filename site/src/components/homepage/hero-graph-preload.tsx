import { Suspense } from 'react';

import { heroGraphAssets, prefersCompactHeroGraph } from './hero-graph-assets';
import { HeroGraphEnginePreload } from './hero-graph-resources';

/** Start only the selected data download while the HTML is still being parsed. */
export function HeroGraphPreload() {
  const assets = JSON.stringify(heroGraphAssets).replace(/</g, '\\u003c');
  const preload = `{
    const assets = ${assets};
    const compact = (${prefersCompactHeroGraph.toString()})();
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'fetch';
    link.fetchPriority = 'low';
    link.crossOrigin = 'anonymous';
    link.href = compact ? assets.compact : assets.desktop;
    document.head.appendChild(link);
  }`;
  return (
    <>
      <script data-hero-graph-preload dangerouslySetInnerHTML={{ __html: preload }} />
      <Suspense fallback={null}>
        <HeroGraphEnginePreload />
      </Suspense>
    </>
  );
}
