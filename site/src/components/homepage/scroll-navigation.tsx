'use client';

import { useEffect, useState } from 'react';

import './scroll-navigation.css';

/** Scope the floating navigation to pages using the shared homepage and preserve the existing menu. */
export function ScrollNavigation() {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setCompact((current) => (current ? window.scrollY > 24 : window.scrollY > 72));
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  return <span hidden data-g6lite-home-navigation={compact ? 'compact' : 'expanded'} />;
}
