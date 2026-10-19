const S="position:absolute;top:10px;right:10px;z-index:30;display:flex;gap:6px;align-items:center;pointer-events:auto;",E="g6lite-canvas-menu-style";let c=null;const A=`
    .g6-canvas-menu-trigger {
      display: inline-flex;
      flex: none;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      height: 28px;
      min-width: 4.5rem;
      padding: 0 8px 0 10px;
      border: 0;
      border-radius: 8px;
      background: rgba(255,255,255,.96);
      color: #334155;
      font: 500 12px/1 system-ui, sans-serif;
      box-shadow: 0 1px 2px rgba(15,23,42,.08);
      cursor: pointer;
    }
    .g6-canvas-menu-trigger svg {
      flex: none;
      transition: transform .15s ease;
    }
    .g6-canvas-menu-trigger[aria-expanded="true"] svg {
      transform: rotate(180deg);
    }
    .g6-canvas-menu {
      position: fixed;
      z-index: 80;
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 8.75rem;
      max-height: min(420px, 70vh);
      margin: 0;
      padding: 4px;
      overflow: auto;
      border: 0;
      border-radius: 10px;
      background: #fff;
      box-shadow: 0 12px 32px rgba(15,23,42,.14);
    }
    .g6-canvas-menu button {
      display: flex;
      align-items: center;
      width: 100%;
      height: 28px;
      padding: 0 10px;
      border: 0;
      border-radius: 6px;
      background: transparent;
      color: #334155;
      font: 500 12px/1 system-ui, sans-serif;
      text-align: left;
      white-space: nowrap;
      cursor: pointer;
    }
    .g6-canvas-menu button:hover,
    .g6-canvas-menu button:focus-visible {
      background: #f3f5fb;
      outline: none;
    }
    .g6-canvas-menu button[aria-selected="true"] {
      background: #e6ebfe;
      color: #5366ad;
    }
    .g6-canvas-menu button:disabled {
      opacity: .45;
      cursor: default;
    }
    .g6-canvas-menu-label {
      padding: 6px 10px 2px;
      color: #94a3b8;
      font: 500 11px/1 system-ui, sans-serif;
    }
    .g6-canvas-menu-label:not(:first-child) {
      margin-top: 4px;
    }
`;function M(){let n=document.getElementById(E);n||(n=document.createElement("style"),n.id=E,document.head.append(n)),n.textContent!==A&&(n.textContent=A)}function w(n){const t=document.createElement("span");t.style.cssText="position:fixed;left:-9999px;top:0;visibility:hidden;white-space:nowrap;font:500 12px/1 system-ui,sans-serif;",t.textContent=n,document.body.append(t);const d=t.getBoundingClientRect().width;return t.remove(),Math.ceil(d)}function R(n,t){C(n).append(t)}function C(n){n.style.position="relative";let t=n.querySelector(":scope > [data-canvas-controls]");return t||(t=document.createElement("div"),t.dataset.canvasControls="",t.dataset.captureIgnore="",t.style.cssText=S,n.append(t)),t}function k(){c==null||c.close()}typeof document<"u"&&(document.addEventListener("pointerdown",n=>{if(!c)return;const t=n.target;t instanceof Node&&(c.trigger.contains(t)||c.menu.contains(t)||k())}),document.addEventListener("keydown",n=>{n.key==="Escape"&&k()}));function L(n,t){M();const d=t.action===!0;let a=[...t.items],s=t.value;const e=document.createElement("button");e.type="button",e.className="g6-canvas-menu-trigger",e.setAttribute("aria-haspopup","listbox"),e.setAttribute("aria-expanded","false"),e.setAttribute("aria-label",t.caption||"操作");const r=document.createElement("span");e.append(r),e.insertAdjacentHTML("beforeend",'<svg width="10" height="6" viewBox="0 0 10 6" aria-hidden="true"><path d="M1 1l4 4 4-4" fill="none" stroke="#64748b" stroke-width="1.4" stroke-linecap="round"/></svg>');const o=document.createElement("div");o.className="g6-canvas-menu",o.setAttribute("role","listbox"),o.hidden=!0;const f=()=>{const i=a.find(x=>x.value===s);r.textContent=d?t.caption||"操作":(i==null?void 0:i.label)||t.caption||"";const l=w(r.textContent||""),v=d?l:Math.max(l,...a.map(x=>w(x.label)));e.style.minWidth=`${Math.min(v,168)+28}px`},m=()=>{o.replaceChildren();for(const i of a){const l=document.createElement("button");l.type="button",l.dataset.value=i.value,l.textContent=i.label,l.setAttribute("role","option"),l.setAttribute("aria-selected",!d&&i.value===s?"true":"false"),l.disabled=i.disabled===!0,l.addEventListener("click",()=>{l.disabled||(d||(s=i.value),t.onSelect(i.value),f(),h())}),o.append(l)}},b=()=>{const i=e.getBoundingClientRect();o.hidden=!1,o.style.visibility="hidden";const l=o.getBoundingClientRect(),v=8;let x=i.bottom+6;x+l.height>window.innerHeight-v&&(x=i.top-l.height-6);let y=i.right-l.width;y=Math.max(v,Math.min(y,window.innerWidth-l.width-v)),x=Math.max(v,x),o.style.top=`${x}px`,o.style.left=`${y}px`,o.style.visibility=""},h=()=>{o.hidden=!0,e.setAttribute("aria-expanded","false"),(c==null?void 0:c.menu)===o&&(c=null)},u=()=>{c&&c.menu!==o&&c.close(),m(),document.body.append(o),b(),e.setAttribute("aria-expanded","true"),c={close:h,trigger:e,menu:o}};e.addEventListener("click",()=>{e.getAttribute("aria-expanded")==="true"?h():u()});const g=new MutationObserver(()=>{e.isConnected||(h(),o.remove(),g.disconnect())});g.observe(n,{childList:!0,subtree:!0}),f();const p=document.createElement("div");if(p.style.cssText="display:inline-flex;flex:none;align-items:center;gap:4px;color:#64748b;font:500 12px/1 system-ui,sans-serif;",!d&&t.caption){const i=document.createElement("span");i.textContent=t.caption,p.append(i)}return p.append(e),C(n).append(p),{trigger:e,setItems(i){a=[...i],f(),o.hidden||m()},setValue(i){s=i,f()}}}function W(n,t){M();const d=t.map(u=>({...u,value:u.selected})),a=document.createElement("button");a.type="button",a.className="g6-canvas-menu-trigger",a.setAttribute("aria-haspopup","listbox"),a.setAttribute("aria-expanded","false"),a.setAttribute("aria-label","画布");const s=document.createElement("span");a.append(s),a.insertAdjacentHTML("beforeend",'<svg width="10" height="6" viewBox="0 0 10 6" aria-hidden="true"><path d="M1 1l4 4 4-4" fill="none" stroke="#64748b" stroke-width="1.4" stroke-linecap="round"/></svg>');const e=document.createElement("div");e.className="g6-canvas-menu",e.setAttribute("role","listbox"),e.hidden=!0;const r=()=>d.map(u=>u.value).join(" · "),o=()=>{s.textContent=r(),a.style.minWidth=`${w(r())+28}px`},f=()=>{e.replaceChildren();for(const u of d){const g=document.createElement("div");g.className="g6-canvas-menu-label",g.textContent=u.label,e.append(g);for(const p of u.values){const i=document.createElement("button");i.type="button",i.textContent=p,i.setAttribute("role","option"),i.setAttribute("aria-selected",p===u.value?"true":"false"),i.addEventListener("click",()=>{u.value=p,u.onChange(p),o(),b()}),e.append(i)}}},m=()=>{const u=a.getBoundingClientRect();e.hidden=!1,e.style.visibility="hidden";const g=e.getBoundingClientRect(),p=8;let i=u.bottom+6;i+g.height>window.innerHeight-p&&(i=Math.max(p,u.top-g.height-6));let l=u.right-g.width;l=Math.max(p,Math.min(l,window.innerWidth-g.width-p)),e.style.top=`${i}px`,e.style.left=`${l}px`,e.style.visibility=""},b=()=>{e.hidden=!0,a.setAttribute("aria-expanded","false"),(c==null?void 0:c.menu)===e&&(c=null)};a.addEventListener("click",()=>{if(a.getAttribute("aria-expanded")==="true"){b();return}c&&c.menu!==e&&c.close(),f(),document.body.append(e),m(),a.setAttribute("aria-expanded","true"),c={close:b,trigger:a,menu:e}});const h=new MutationObserver(()=>{a.isConnected||(b(),e.remove(),h.disconnect())});return h.observe(n,{childList:!0,subtree:!0}),o(),C(n).append(a),{trigger:a}}function T(n,t,d,a,s){return L(n,{caption:t,items:d.map(e=>({value:e,label:e})),value:a,onSelect:s})}function B(n,t,d="操作"){if(!t.length)return null;const a=()=>t.map((e,r)=>{const o=e.dataset.action??e.dataset.layout??e.dataset.placement??String(r);return e.dataset.canvasControl=o,{value:o,label:(e.textContent||o).trim(),disabled:e.disabled}}),s=L(n,{caption:d,action:!0,items:a(),value:"",onSelect(e){const r=t.find(o=>o.dataset.canvasControl===e);!r||r.disabled||(r.click(),s.setItems(a()))}});return s}function N(n,t){if(!t.length)return;const d=t.every(s=>s.dataset.layout)?"layout":t.every(s=>s.dataset.placement)?"placement":null;if(!d){B(n,t,"操作");return}const a=t.map(s=>(s.textContent||"").trim());T(n,d==="layout"?"布局":"位置",a,a[0]??"",s=>{var e;(e=t.find(r=>(r.textContent||"").trim()===s))==null||e.click()})}function I(n,t,d,a){const s=typeof n=="string"?document.querySelector(n):n;s.style.position="relative";const e=document.createElement("div"),r=document.createElement("div");r.dataset.role="controls",r.hidden=!0,r.innerHTML=a,e.append(r);const o=[...r.querySelectorAll("button")];N(s,o);const f=s.querySelector(":scope > [data-canvas-controls]");f&&e.append(f);const m=document.createElement("div");return m.dataset.role="status",m.dataset.captureIgnore="",m.style.cssText="position:absolute;left:12px;bottom:10px;z-index:20;max-width:min(28rem,calc(100% - 24px));color:#64748b;font:12px/1.45 system-ui,sans-serif;pointer-events:none;white-space:pre-wrap;",m.textContent=d,e.append(r,m),s.append(e),{panel:e,controls:r,setStatus(b){m.textContent=b}}}const $="padding:5px 9px;border:1px solid #cbd5e1;border-radius:6px;background:#fff;color:#334155;cursor:pointer;";export{$ as buttonStyle,I as createDemoPanel,B as mountActionSelect,R as mountCanvasControl,L as mountCanvasMenu,T as mountChoiceSelect,W as mountGroupedChoices};
