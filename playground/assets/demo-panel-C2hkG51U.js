const e=`export function createDemoPanel(
  container: string | HTMLElement,
  title: string,
  description: string,
  controls: string,
) {
  const containerEl =
    typeof container === 'string' ? document.querySelector<HTMLElement>(container)! : container;
  containerEl.style.position = 'relative';

  const panel = document.createElement('div');
  panel.style.cssText =
    'position:absolute;top:12px;left:12px;z-index:20;width:300px;padding:14px;background:rgba(255,255,255,.96);border:1px solid #e5e7eb;border-radius:10px;box-shadow:0 6px 20px rgba(15,23,42,.12);font:12px/1.5 system-ui;color:#334155;';
  panel.innerHTML = \`
    <div style="font-size:14px;font-weight:650;color:#0f172a">\${title}</div>
    <div style="margin:4px 0 10px;color:#64748b">\${description}</div>
    <div data-role="controls" style="display:flex;flex-wrap:wrap;gap:6px">\${controls}</div>
    <pre data-role="status" style="margin:10px 0 0;padding:9px;min-height:40px;white-space:pre-wrap;background:#f8fafc;border-radius:6px;color:#0f172a;font:11px/1.5 ui-monospace,monospace"></pre>
  \`;
  containerEl.appendChild(panel);

  const status = panel.querySelector<HTMLElement>('[data-role="status"]')!;
  return {
    panel,
    controls: panel.querySelector<HTMLElement>('[data-role="controls"]')!,
    setStatus(message: string) {
      status.textContent = message;
    },
  };
}

export const buttonStyle =
  'padding:5px 9px;border:1px solid #cbd5e1;border-radius:6px;background:#fff;color:#334155;cursor:pointer;';
`;export{e as default};
