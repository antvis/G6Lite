'use client';

import { useEffect, useState } from 'react';

import './scroll-navigation.css';

/** Animate only the homepage header; other pages keep their full-width top navigation. */
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
    window.addEventListener('pageshow', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pageshow', onScroll);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  return <span hidden data-g6lite-home-navigation={compact ? 'compact' : 'expanded'} />;
}
