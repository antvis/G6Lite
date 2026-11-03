(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,9582,e=>{"use strict";let t="g6lite-canvas-menu-style",n=null,a=`
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
`;function i(){let e=document.getElementById(t);e||((e=document.createElement("style")).id=t,document.head.append(e)),e.textContent!==a&&(e.textContent=a)}function o(e){let t=document.createElement("span");t.style.cssText="position:fixed;left:-9999px;top:0;visibility:hidden;white-space:nowrap;font:500 12px/1 system-ui,sans-serif;",t.textContent=e,document.body.append(t);let n=t.getBoundingClientRect().width;return t.remove(),Math.ceil(n)}function l(e){e.style.position="relative";let t=e.querySelector(":scope > [data-canvas-controls]");return t||((t=document.createElement("div")).dataset.canvasControls="",t.dataset.captureIgnore="",t.style.cssText="position:absolute;top:10px;right:10px;z-index:30;display:flex;gap:6px;align-items:center;pointer-events:auto;",e.append(t)),t}function r(){n?.close()}function s(e,t){i();let a=!0===t.action,r=[...t.items],s=t.value,d=document.createElement("button");d.type="button",d.className="g6-canvas-menu-trigger",d.setAttribute("aria-haspopup","listbox"),d.setAttribute("aria-expanded","false"),d.setAttribute("aria-label",t.caption||"操作");let u=document.createElement("span");d.append(u),d.insertAdjacentHTML("beforeend",'<svg width="10" height="6" viewBox="0 0 10 6" aria-hidden="true"><path d="M1 1l4 4 4-4" fill="none" stroke="#64748b" stroke-width="1.4" stroke-linecap="round"/></svg>');let c=document.createElement("div");c.className="g6-canvas-menu",c.setAttribute("role","listbox"),c.hidden=!0;let p=()=>{let e=r.find(e=>e.value===s);u.textContent=a?t.caption||"操作":e?.label||t.caption||"";let n=o(u.textContent||""),i=a?n:Math.max(n,...r.map(e=>o(e.label)));d.style.minWidth=`${Math.min(i,168)+28}px`},m=()=>{for(let e of(c.replaceChildren(),r)){let n=document.createElement("button");n.type="button",n.dataset.value=e.value,n.textContent=e.label,n.setAttribute("role","option"),n.setAttribute("aria-selected",a||e.value!==s?"false":"true"),n.disabled=!0===e.disabled,n.addEventListener("click",()=>{n.disabled||(a||(s=e.value),t.onSelect(e.value),p(),b())}),c.append(n)}},b=()=>{c.hidden=!0,d.setAttribute("aria-expanded","false"),n?.menu===c&&(n=null)};d.addEventListener("click",()=>{if("true"===d.getAttribute("aria-expanded"))b();else{let e,t,a,i;n&&n.menu!==c&&n.close(),m(),document.body.append(c),e=d.getBoundingClientRect(),c.hidden=!1,c.style.visibility="hidden",t=c.getBoundingClientRect(),(a=e.bottom+6)+t.height>window.innerHeight-8&&(a=e.top-t.height-6),i=Math.max(8,Math.min(i=e.right-t.width,window.innerWidth-t.width-8)),a=Math.max(8,a),c.style.top=`${a}px`,c.style.left=`${i}px`,c.style.visibility="",d.setAttribute("aria-expanded","true"),n={close:b,trigger:d,menu:c}}});let x=new MutationObserver(()=>{d.isConnected||(b(),c.remove(),x.disconnect())});x.observe(e,{childList:!0,subtree:!0}),p();let g=document.createElement("div");if(g.style.cssText="display:inline-flex;flex:none;align-items:center;gap:4px;color:#64748b;font:500 12px/1 system-ui,sans-serif;",!a&&t.caption){let e=document.createElement("span");e.textContent=t.caption,g.append(e)}return g.append(d),l(e).append(g),{trigger:d,setItems(e){r=[...e],p(),c.hidden||m()},setValue(e){s=e,p()}}}function d(e,t,n,a,i){return s(e,{caption:t,items:n.map(e=>({value:e,label:e})),value:a,onSelect:i})}function u(e,t,n="操作"){if(!t.length)return null;let a=()=>t.map((e,t)=>{let n=e.dataset.action??e.dataset.layout??e.dataset.placement??String(t);return e.dataset.canvasControl=n,{value:n,label:(e.textContent||n).trim(),disabled:e.disabled}}),i=s(e,{caption:n,action:!0,items:a(),value:"",onSelect(e){let n=t.find(t=>t.dataset.canvasControl===e);n&&!n.disabled&&(n.click(),i.setItems(a()))}});return i}"u">typeof document&&(document.addEventListener("pointerdown",e=>{if(!n)return;let t=e.target;!(t instanceof Node)||n.trigger.contains(t)||n.menu.contains(t)||r()}),document.addEventListener("keydown",e=>{"Escape"===e.key&&r()})),e.s(["buttonStyle",0,"padding:5px 9px;border:1px solid #cbd5e1;border-radius:6px;background:#fff;color:#334155;cursor:pointer;","createDemoPanel",0,function(e,t,n,a){let i="string"==typeof e?document.querySelector(e):e;i.style.position="relative";let o=document.createElement("div"),l=document.createElement("div");l.dataset.role="controls",l.hidden=!0,l.innerHTML=a,o.append(l),function(e,t){if(!t.length)return;let n=t.every(e=>e.dataset.layout)?"layout":t.every(e=>e.dataset.placement)?"placement":null;if(!n)return u(e,t,"操作");let a=t.map(e=>(e.textContent||"").trim());d(e,"layout"===n?"布局":"位置",a,a[0]??"",e=>{t.find(t=>(t.textContent||"").trim()===e)?.click()})}(i,[...l.querySelectorAll("button")]);let r=i.querySelector(":scope > [data-canvas-controls]");r&&o.append(r);let s=document.createElement("div");return s.dataset.role="status",s.dataset.captureIgnore="",s.style.cssText="position:absolute;left:12px;bottom:10px;z-index:20;max-width:min(28rem,calc(100% - 24px));color:#64748b;font:12px/1.45 system-ui,sans-serif;pointer-events:none;white-space:pre-wrap;",s.textContent=n,o.append(l,s),i.append(o),{panel:o,controls:l,setStatus(e){s.textContent=e}}},"mountActionSelect",0,u,"mountCanvasControl",0,function(e,t){l(e).append(t)},"mountCanvasMenu",0,s,"mountChoiceSelect",0,d,"mountGroupedChoices",0,function(e,t){i();let a=t.map(e=>({...e,value:e.selected})),r=document.createElement("button");r.type="button",r.className="g6-canvas-menu-trigger",r.setAttribute("aria-haspopup","listbox"),r.setAttribute("aria-expanded","false"),r.setAttribute("aria-label","画布");let s=document.createElement("span");r.append(s),r.insertAdjacentHTML("beforeend",'<svg width="10" height="6" viewBox="0 0 10 6" aria-hidden="true"><path d="M1 1l4 4 4-4" fill="none" stroke="#64748b" stroke-width="1.4" stroke-linecap="round"/></svg>');let d=document.createElement("div");d.className="g6-canvas-menu",d.setAttribute("role","listbox"),d.hidden=!0;let u=()=>a.map(e=>e.value).join(" · "),c=()=>{s.textContent=u(),r.style.minWidth=`${o(u())+28}px`},p=()=>{d.hidden=!0,r.setAttribute("aria-expanded","false"),n?.menu===d&&(n=null)};r.addEventListener("click",()=>{let e,t,i,o;if("true"===r.getAttribute("aria-expanded"))return void p();for(let e of(n&&n.menu!==d&&n.close(),d.replaceChildren(),a)){let t=document.createElement("div");for(let n of(t.className="g6-canvas-menu-label",t.textContent=e.label,d.append(t),e.values)){let t=document.createElement("button");t.type="button",t.textContent=n,t.setAttribute("role","option"),t.setAttribute("aria-selected",n===e.value?"true":"false"),t.addEventListener("click",()=>{e.value=n,e.onChange(n),c(),p()}),d.append(t)}}document.body.append(d),e=r.getBoundingClientRect(),d.hidden=!1,d.style.visibility="hidden",t=d.getBoundingClientRect(),(i=e.bottom+6)+t.height>window.innerHeight-8&&(i=Math.max(8,e.top-t.height-6)),o=Math.max(8,Math.min(o=e.right-t.width,window.innerWidth-t.width-8)),d.style.top=`${i}px`,d.style.left=`${o}px`,d.style.visibility="",r.setAttribute("aria-expanded","true"),n={close:p,trigger:r,menu:d}});let m=new MutationObserver(()=>{r.isConnected||(p(),d.remove(),m.disconnect())});return m.observe(e,{childList:!0,subtree:!0}),c(),l(e).append(r),{trigger:r}}])}]);