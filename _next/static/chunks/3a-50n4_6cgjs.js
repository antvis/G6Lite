(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,2295,e=>{e.q("/_next/static/media/layoutWorker.3i16_cjdu2-y8.ts")},86016,97050,e=>{"use strict";let t={circular:()=>e.A(1117).then(({CircularLayout:e})=>e),concentric:()=>e.A(59627).then(({ConcentricLayout:e})=>e),dagre:()=>e.A(71692).then(({DagreLayout:e})=>e),"d3-force":()=>e.A(43030).then(({D3ForceLayout:e})=>e),force:()=>e.A(5187).then(({ForceLayout:e})=>e),"force-atlas2":()=>e.A(5728).then(({ForceAtlas2Layout:e})=>e),fruchterman:()=>e.A(67675).then(({FruchtermanLayout:e})=>e),grid:()=>e.A(20788).then(({GridLayout:e})=>e),mds:()=>e.A(72968).then(({MDSLayout:e})=>e),radial:()=>e.A(97708).then(({RadialLayout:e})=>e),random:()=>e.A(52414).then(({RandomLayout:e})=>e)};e.s(["loadLayout",0,function(e){return(t[e]??t.random)()}],86016),e.s(["normalizeLibraryLayoutOptions",0,function(e,t,n){let a={...t};return delete a.type,delete a.worker,"iterations"in a&&!("maxIteration"in a)&&(a.maxIteration=a.iterations),delete a.iterations,void 0===a.animate&&(a.animate=!1),("force"===e||"fruchterman"===e)&&(n>5e3?(void 0===a.maxIteration&&(a.maxIteration=50),void 0===a.minMovement&&(a.minMovement=2)):n>=1e3?(void 0===a.maxIteration&&(a.maxIteration=200),void 0===a.minMovement&&(a.minMovement=1.5)):(void 0===a.maxIteration&&(a.maxIteration=100),void 0===a.minMovement&&(a.minMovement=1))),"force-atlas2"===e&&(void 0===a.barnesHut&&(a.barnesHut=!0),void 0===a.prune&&n>200&&(a.prune=!1),void 0===a.maxIteration&&(a.maxIteration=n>5e3?50:100)),"d3-force"===e&&(void 0===a.alphaDecay&&(a.alphaDecay=.1),void 0===a.linkDistance&&(a.linkDistance=Math.max(200,80*Math.sqrt(n)))),a}],97050)},45128,e=>{"use strict";let t="g6lite-canvas-menu-style",n=null,a=`
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
`;function i(){let e=document.getElementById(t);e||((e=document.createElement("style")).id=t,document.head.append(e)),e.textContent!==a&&(e.textContent=a)}function o(e){let t=document.createElement("span");t.style.cssText="position:fixed;left:-9999px;top:0;visibility:hidden;white-space:nowrap;font:500 12px/1 system-ui,sans-serif;",t.textContent=e,document.body.append(t);let n=t.getBoundingClientRect().width;return t.remove(),Math.ceil(n)}function r(e){e.style.position="relative";let t=e.querySelector(":scope > [data-canvas-controls]");return t||((t=document.createElement("div")).dataset.canvasControls="",t.dataset.captureIgnore="",t.style.cssText="position:absolute;top:10px;right:10px;z-index:30;display:flex;gap:6px;align-items:center;pointer-events:auto;",e.append(t)),t}function s(){n?.close()}function l(e,t){i();let a=!0===t.action,s=[...t.items],l=t.value,d=document.createElement("button");d.type="button",d.className="g6-canvas-menu-trigger",d.setAttribute("aria-haspopup","listbox"),d.setAttribute("aria-expanded","false"),d.setAttribute("aria-label",t.caption||"操作");let c=document.createElement("span");d.append(c),d.insertAdjacentHTML("beforeend",'<svg width="10" height="6" viewBox="0 0 10 6" aria-hidden="true"><path d="M1 1l4 4 4-4" fill="none" stroke="#64748b" stroke-width="1.4" stroke-linecap="round"/></svg>');let u=document.createElement("div");u.className="g6-canvas-menu",u.setAttribute("role","listbox"),u.hidden=!0;let p=()=>{let e=s.find(e=>e.value===l);c.textContent=a?t.caption||"操作":e?.label||t.caption||"";let n=o(c.textContent||""),i=a?n:Math.max(n,...s.map(e=>o(e.label)));d.style.minWidth=`${Math.min(i,168)+28}px`},m=()=>{for(let e of(u.replaceChildren(),s)){let n=document.createElement("button");n.type="button",n.dataset.value=e.value,n.textContent=e.label,n.setAttribute("role","option"),n.setAttribute("aria-selected",a||e.value!==l?"false":"true"),n.disabled=!0===e.disabled,n.addEventListener("click",()=>{n.disabled||(a||(l=e.value),t.onSelect(e.value),p(),h())}),u.append(n)}},h=()=>{u.hidden=!0,d.setAttribute("aria-expanded","false"),n?.menu===u&&(n=null)};d.addEventListener("click",()=>{if("true"===d.getAttribute("aria-expanded"))h();else{let e,t,a,i;n&&n.menu!==u&&n.close(),m(),document.body.append(u),e=d.getBoundingClientRect(),u.hidden=!1,u.style.visibility="hidden",t=u.getBoundingClientRect(),(a=e.bottom+6)+t.height>window.innerHeight-8&&(a=e.top-t.height-6),i=Math.max(8,Math.min(i=e.right-t.width,window.innerWidth-t.width-8)),a=Math.max(8,a),u.style.top=`${a}px`,u.style.left=`${i}px`,u.style.visibility="",d.setAttribute("aria-expanded","true"),n={close:h,trigger:d,menu:u}}});let g=new MutationObserver(()=>{d.isConnected||(h(),u.remove(),g.disconnect())});g.observe(e,{childList:!0,subtree:!0}),p();let v=document.createElement("div");if(v.style.cssText="display:inline-flex;flex:none;align-items:center;gap:4px;color:#64748b;font:500 12px/1 system-ui,sans-serif;",!a&&t.caption){let e=document.createElement("span");e.textContent=t.caption,v.append(e)}return v.append(d),r(e).append(v),{trigger:d,setItems(e){s=[...e],p(),u.hidden||m()},setValue(e){l=e,p()}}}function d(e,t,n,a,i){return l(e,{caption:t,items:n.map(e=>({value:e,label:e})),value:a,onSelect:i})}function c(e,t,n="操作"){if(!t.length)return null;let a=()=>t.map((e,t)=>{let n=e.dataset.action??e.dataset.layout??e.dataset.placement??String(t);return e.dataset.canvasControl=n,{value:n,label:(e.textContent||n).trim(),disabled:e.disabled}}),i=l(e,{caption:n,action:!0,items:a(),value:"",onSelect(e){let n=t.find(t=>t.dataset.canvasControl===e);n&&!n.disabled&&(n.click(),i.setItems(a()))}});return i}"u">typeof document&&(document.addEventListener("pointerdown",e=>{if(!n)return;let t=e.target;!(t instanceof Node)||n.trigger.contains(t)||n.menu.contains(t)||s()}),document.addEventListener("keydown",e=>{"Escape"===e.key&&s()})),e.s(["buttonStyle",0,"padding:5px 9px;border:1px solid #cbd5e1;border-radius:6px;background:#fff;color:#334155;cursor:pointer;","createDemoPanel",0,function(e,t,n,a){let i="string"==typeof e?document.querySelector(e):e;i.style.position="relative";let o=document.createElement("div"),r=document.createElement("div");r.dataset.role="controls",r.hidden=!0,r.innerHTML=a,o.append(r),function(e,t){if(!t.length)return;let n=t.every(e=>e.dataset.layout)?"layout":t.every(e=>e.dataset.placement)?"placement":null;if(!n)return c(e,t,"操作");let a=t.map(e=>(e.textContent||"").trim());d(e,"layout"===n?"布局":"位置",a,a[0]??"",e=>{t.find(t=>(t.textContent||"").trim()===e)?.click()})}(i,[...r.querySelectorAll("button")]);let s=i.querySelector(":scope > [data-canvas-controls]");s&&o.append(s);let l=document.createElement("div");return l.dataset.role="status",l.dataset.captureIgnore="",l.style.cssText="position:absolute;left:12px;bottom:10px;z-index:20;max-width:min(28rem,calc(100% - 24px));color:#64748b;font:12px/1.45 system-ui,sans-serif;pointer-events:none;white-space:pre-wrap;",l.textContent=n,o.append(r,l),i.append(o),{panel:o,controls:r,setStatus(e){l.textContent=e}}},"mountActionSelect",0,c,"mountCanvasControl",0,function(e,t){r(e).append(t)},"mountCanvasMenu",0,l,"mountChoiceSelect",0,d,"mountGroupedChoices",0,function(e,t){i();let a=t.map(e=>({...e,value:e.selected})),s=document.createElement("button");s.type="button",s.className="g6-canvas-menu-trigger",s.setAttribute("aria-haspopup","listbox"),s.setAttribute("aria-expanded","false"),s.setAttribute("aria-label","画布");let l=document.createElement("span");s.append(l),s.insertAdjacentHTML("beforeend",'<svg width="10" height="6" viewBox="0 0 10 6" aria-hidden="true"><path d="M1 1l4 4 4-4" fill="none" stroke="#64748b" stroke-width="1.4" stroke-linecap="round"/></svg>');let d=document.createElement("div");d.className="g6-canvas-menu",d.setAttribute("role","listbox"),d.hidden=!0;let c=()=>a.map(e=>e.value).join(" · "),u=()=>{l.textContent=c(),s.style.minWidth=`${o(c())+28}px`},p=()=>{d.hidden=!0,s.setAttribute("aria-expanded","false"),n?.menu===d&&(n=null)};s.addEventListener("click",()=>{let e,t,i,o;if("true"===s.getAttribute("aria-expanded"))return void p();for(let e of(n&&n.menu!==d&&n.close(),d.replaceChildren(),a)){let t=document.createElement("div");for(let n of(t.className="g6-canvas-menu-label",t.textContent=e.label,d.append(t),e.values)){let t=document.createElement("button");t.type="button",t.textContent=n,t.setAttribute("role","option"),t.setAttribute("aria-selected",n===e.value?"true":"false"),t.addEventListener("click",()=>{e.value=n,e.onChange(n),u(),p()}),d.append(t)}}document.body.append(d),e=s.getBoundingClientRect(),d.hidden=!1,d.style.visibility="hidden",t=d.getBoundingClientRect(),(i=e.bottom+6)+t.height>window.innerHeight-8&&(i=Math.max(8,e.top-t.height-6)),o=Math.max(8,Math.min(o=e.right-t.width,window.innerWidth-t.width-8)),d.style.top=`${i}px`,d.style.left=`${o}px`,d.style.visibility="",s.setAttribute("aria-expanded","true"),n={close:p,trigger:s,menu:d}});let m=new MutationObserver(()=>{s.isConnected||(p(),d.remove(),m.disconnect())});return m.observe(e,{childList:!0,subtree:!0}),u(),r(e).append(s),{trigger:s}}])},10037,e=>{"use strict";var t=e.i(51268),n=e.i(45128);let a={nodes:[{id:"0"},{id:"1"},{id:"2"},{id:"3"},{id:"4"},{id:"5"},{id:"6"},{id:"7"},{id:"8"},{id:"9"}],edges:[{source:"0",target:"1"},{source:"0",target:"2"},{source:"1",target:"3"},{source:"2",target:"4"},{source:"3",target:"5"},{source:"4",target:"5"},{source:"5",target:"6"},{source:"6",target:"7"},{source:"6",target:"8"},{source:"7",target:"9"},{source:"8",target:"9"}]},i=[{type:"circular",radius:180},{type:"force",linkDistance:80},{type:"grid",rows:2,cols:5},{type:"dagre",rankdir:"TB",nodesep:30,ranksep:40}],o=null;async function r(e){let r="string"==typeof e?document.querySelector(e):e;r.replaceChildren(),r.style.cssText="position:relative;width:100%;height:100%;min-height:0;";let s=document.createElement("div");async function l(e){o?.destroy();let n=i[e];o=new t.Graph({autoFit:!0,container:s,data:a,node:{type:"circle",style:{size:10}},edge:{type:"line",style:{endArrow:!0}},layout:{...n},behaviors:["zoom-canvas","drag-canvas","drag-node"],theme:"light"}),await o.render()}return s.style.cssText="position:absolute;inset:0;",r.appendChild(s),await l(0),(0,n.mountChoiceSelect)(r,"布局",["Circular","Force","Grid","Dagre"],"Circular",e=>{let t=["Circular","Force","Grid","Dagre"].indexOf(e);t>=0&&l(t)}),{fitView:()=>o?.fitView({padding:64,maxZoom:1.5}),destroy:()=>{o?.destroy(),o=null,r.querySelector("[data-canvas-controls]")?.remove()}}}e.s(["run",0,r])},1117,e=>{e.v(t=>Promise.all(["static/chunks/3w5ghov2s-mh_.js"].map(t=>e.l(t))).then(()=>t(20344)))},59627,e=>{e.v(t=>Promise.all(["static/chunks/129g9sgvi8fvp.js"].map(t=>e.l(t))).then(()=>t(33922)))},71692,e=>{e.v(t=>Promise.all(["static/chunks/1b2-kozujq0ug.js","static/chunks/3c39acntf9t1j.js"].map(t=>e.l(t))).then(()=>t(86208)))},43030,e=>{e.v(t=>Promise.all(["static/chunks/2fw6s4tbmcygq.js"].map(t=>e.l(t))).then(()=>t(37396)))},5187,e=>{e.v(t=>Promise.all(["static/chunks/123no1qd2-632.js"].map(t=>e.l(t))).then(()=>t(54052)))},5728,e=>{e.v(t=>Promise.all(["static/chunks/3q_523q8o0ko2.js"].map(t=>e.l(t))).then(()=>t(81166)))},67675,e=>{e.v(t=>Promise.all(["static/chunks/3d83bd29fddh0.js"].map(t=>e.l(t))).then(()=>t(34201)))},20788,e=>{e.v(t=>Promise.all(["static/chunks/0mhcjlf6lxywq.js"].map(t=>e.l(t))).then(()=>t(46035)))},72968,e=>{e.v(t=>Promise.all(["static/chunks/1h4a07lpe01va.js","static/chunks/0f79yggc4pdiq.js"].map(t=>e.l(t))).then(()=>t(85600)))},97708,e=>{e.v(t=>Promise.all(["static/chunks/3cuzuudp5y610.js","static/chunks/3aqmcfax1l3ff.js"].map(t=>e.l(t))).then(()=>t(51473)))},52414,e=>{e.v(t=>Promise.all(["static/chunks/3z_e57obaca1y.js"].map(t=>e.l(t))).then(()=>t(27630)))}]);