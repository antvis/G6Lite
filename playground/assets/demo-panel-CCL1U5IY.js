function n(o,r,p,a){const t=typeof o=="string"?document.querySelector(o):o;t.style.position="relative";const e=document.createElement("div");e.style.cssText="position:absolute;top:12px;left:12px;z-index:20;width:300px;padding:14px;background:rgba(255,255,255,.96);border:1px solid #e5e7eb;border-radius:10px;box-shadow:0 6px 20px rgba(15,23,42,.12);font:12px/1.5 system-ui;color:#334155;",e.innerHTML=`
    <div style="font-size:14px;font-weight:650;color:#0f172a">${r}</div>
    <div style="margin:4px 0 10px;color:#64748b">${p}</div>
    <div data-role="controls" style="display:flex;flex-wrap:wrap;gap:6px">${a}</div>
    <pre data-role="status" style="margin:10px 0 0;padding:9px;min-height:40px;white-space:pre-wrap;background:#f8fafc;border-radius:6px;color:#0f172a;font:11px/1.5 ui-monospace,monospace"></pre>
  `,t.appendChild(e);const s=e.querySelector('[data-role="status"]');return{panel:e,controls:e.querySelector('[data-role="controls"]'),setStatus(d){s.textContent=d}}}const i="padding:5px 9px;border:1px solid #cbd5e1;border-radius:6px;background:#fff;color:#334155;cursor:pointer;";export{i as buttonStyle,n as createDemoPanel};
