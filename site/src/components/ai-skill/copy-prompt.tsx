'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

export function CopyPrompt({
  text,
  label,
  copiedLabel,
  failedLabel,
  className,
}: {
  text: string;
  label: string;
  copiedLabel: string;
  failedLabel: string;
  className?: string;
}) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle');

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setStatus('copied');
    } catch {
      setStatus('failed');
    }
    window.setTimeout(() => setStatus('idle'), 1600);
  }

  const message = status === 'copied' ? copiedLabel : status === 'failed' ? failedLabel : label;

  return (
    <button type="button" className={className} onClick={() => void copy()}>
      {status === 'copied' ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
      <span>{message}</span>
    </button>
  );
}
