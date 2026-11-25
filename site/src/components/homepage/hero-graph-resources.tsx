'use client';

import { useEffect } from 'react';

import { warmHeroGraphEngine } from './hero-graph-loader';

// This small entry runs independently of the engine download. Do not make the
// large engine a dependency of the initial scripts that hydrate the navigation.
if (typeof window !== 'undefined') {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
  const path = window.location.pathname.replace(/\/$/, '');
  if (path === base || path === `${base}/en` || path === `${base}/preview/home-v2`)
    warmHeroGraphEngine();
}

/** Warm the engine before the renderer's idle callback, including client navigation. */
export function HeroGraphEnginePreload() {
  useEffect(warmHeroGraphEngine, []);
  return null;
}
