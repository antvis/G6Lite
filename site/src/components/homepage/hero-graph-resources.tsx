'use client';

import { useEffect } from 'react';

import { buildHeroGraph } from './hero-graph-model.mjs';
import { heroGraphAssets, prefersCompactHeroGraph } from './hero-graph-assets';

type PackedHeroGraph = { nodes: number[]; edges: number[]; ids?: number[] };
const dataRequests = new Map<string, Promise<PackedHeroGraph>>();
let engineRequest: Promise<typeof import('../../../../src/index.ts')> | undefined;

function loadEngine() {
  if (!engineRequest) {
    const request = import('../../../../src/index.ts');
    engineRequest = request;
    void request.catch(() => {
      if (engineRequest === request) engineRequest = undefined;
    });
  }
  return engineRequest;
}

function warmEngine() {
  void loadEngine().catch(() => {});
}

// This small entry runs independently of the engine download. Do not make the
// large engine a dependency of the initial scripts that hydrate the navigation.
if (typeof window !== 'undefined') {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
  const path = window.location.pathname.replace(/\/$/, '');
  if (path === base || path === `${base}/en` || path === `${base}/preview/home-v2`) warmEngine();
}

/** Reuse the HTML preload; defer JSON decoding and graph construction until needed. */
export function loadHeroGraphResources() {
  const url = prefersCompactHeroGraph() ? heroGraphAssets.compact : heroGraphAssets.desktop;
  let request = dataRequests.get(url);
  if (!request) {
    request = fetch(url).then(async (response) => {
      if (!response.ok) throw new Error(`Hero data request failed: ${response.status}`);
      return (await response.json()) as PackedHeroGraph;
    });
    dataRequests.set(url, request);
    // A failed request must not poison the explicit retry in HeroLiveGraph.
    void request.catch(() => {
      if (dataRequests.get(url) === request) dataRequests.delete(url);
    });
  }
  return Promise.all([loadEngine(), request]).then(([{ Graph }, data]) => ({
    Graph,
    createHeroGraph: () => buildHeroGraph(data.nodes, data.edges, data.ids),
  }));
}

/** Warm the engine before the renderer's idle callback, including client navigation. */
export function HeroGraphEnginePreload() {
  useEffect(warmEngine, []);
  return null;
}
