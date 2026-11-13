'use client';

import { useEffect } from 'react';

export function DocsAnchorRedirect({ referenceUrl, anchors, aliases }: {
  referenceUrl: string;
  anchors: string[];
  aliases?: Record<string, string>;
}) {
  useEffect(() => {
    const moved = new Set(anchors);
    const redirect = () => {
      const hash = window.location.hash;
      let anchor: string;
      try {
        anchor = decodeURIComponent(hash.slice(1));
      } catch {
        return;
      }
      if (moved.has(anchor)) window.location.replace(`${referenceUrl}${hash}`);
      else if (aliases && Object.hasOwn(aliases, anchor)) {
        window.location.replace(`${referenceUrl}#${encodeURIComponent(aliases[anchor])}`);
      }
    };

    redirect();
    window.addEventListener('hashchange', redirect);
    return () => window.removeEventListener('hashchange', redirect);
  }, [referenceUrl, anchors, aliases]);

  return null;
}
