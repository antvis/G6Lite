'use client';

import { javascript } from '@codemirror/lang-javascript';
import { EditorView } from '@codemirror/view';
import CodeMirror from '@uiw/react-codemirror';
import { useEffect, useState } from 'react';

// Fumadocs (next-themes) toggles the dark class on <html>.
function useIsDark(): boolean {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const update = () => setIsDark(root.classList.contains('dark'));
    update();
    const observer = new MutationObserver(update);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return isDark;
}

export function ExampleCodeEditor({
  value,
  onChange,
  wrap,
}: {
  value: string;
  onChange: (value: string) => void;
  wrap: boolean;
}) {
  const isDark = useIsDark();

  return (
    <CodeMirror
      aria-label="Example source code"
      basicSetup={{ foldGutter: false, highlightActiveLine: false }}
      extensions={[javascript({ typescript: true }), ...(wrap ? [EditorView.lineWrapping] : [])]}
      height="100%"
      onChange={onChange}
      theme={isDark ? 'dark' : 'light'}
      value={value}
    />
  );
}
