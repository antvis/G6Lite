(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,2295,e=>{e.q("/_next/static/media/layoutWorker.3i16_cjdu2-y8.ts")},86016,97050,e=>{"use strict";let t={circular:()=>e.A(1117).then(({CircularLayout:e})=>e),concentric:()=>e.A(59627).then(({ConcentricLayout:e})=>e),dagre:()=>e.A(71692).then(({DagreLayout:e})=>e),"d3-force":()=>e.A(43030).then(({D3ForceLayout:e})=>e),force:()=>e.A(5187).then(({ForceLayout:e})=>e),"force-atlas2":()=>e.A(5728).then(({ForceAtlas2Layout:e})=>e),fruchterman:()=>e.A(67675).then(({FruchtermanLayout:e})=>e),grid:()=>e.A(20788).then(({GridLayout:e})=>e),mds:()=>e.A(72968).then(({MDSLayout:e})=>e),radial:()=>e.A(97708).then(({RadialLayout:e})=>e),random:()=>e.A(52414).then(({RandomLayout:e})=>e)};e.s(["loadLayout",0,function(e){return(t[e]??t.random)()}],86016),e.s(["normalizeLibraryLayoutOptions",0,function(e,t,a){let n={...t};return delete n.type,delete n.worker,"iterations"in n&&!("maxIteration"in n)&&(n.maxIteration=n.iterations),delete n.iterations,void 0===n.animate&&(n.animate=!1),("force"===e||"fruchterman"===e)&&(a>5e3?(void 0===n.maxIteration&&(n.maxIteration=50),void 0===n.minMovement&&(n.minMovement=2)):a>=1e3?(void 0===n.maxIteration&&(n.maxIteration=200),void 0===n.minMovement&&(n.minMovement=1.5)):(void 0===n.maxIteration&&(n.maxIteration=100),void 0===n.minMovement&&(n.minMovement=1))),"force-atlas2"===e&&(void 0===n.barnesHut&&(n.barnesHut=!0),void 0===n.prune&&a>200&&(n.prune=!1),void 0===n.maxIteration&&(n.maxIteration=a>5e3?50:100)),"d3-force"===e&&(void 0===n.alphaDecay&&(n.alphaDecay=.1),void 0===n.linkDistance&&(n.linkDistance=Math.max(200,80*Math.sqrt(a)))),n}],97050)},45128,e=>{"use strict";let t="g6lite-canvas-menu-style",a=null,n=`
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
`;function i(){let e=document.getElementById(t);e||((e=document.createElement("style")).id=t,document.head.append(e)),e.textContent!==n&&(e.textContent=n)}function o(e){let t=document.createElement("span");t.style.cssText="position:fixed;left:-9999px;top:0;visibility:hidden;white-space:nowrap;font:500 12px/1 system-ui,sans-serif;",t.textContent=e,document.body.append(t);let a=t.getBoundingClientRect().width;return t.remove(),Math.ceil(a)}function r(e){e.style.position="relative";let t=e.querySelector(":scope > [data-canvas-controls]");return t||((t=document.createElement("div")).dataset.canvasControls="",t.dataset.captureIgnore="",t.style.cssText="position:absolute;top:10px;right:10px;z-index:30;display:flex;gap:6px;align-items:center;pointer-events:auto;",e.append(t)),t}function l(){a?.close()}function s(e,t){i();let n=!0===t.action,l=[...t.items],s=t.value,d=document.createElement("button");d.type="button",d.className="g6-canvas-menu-trigger",d.setAttribute("aria-haspopup","listbox"),d.setAttribute("aria-expanded","false"),d.setAttribute("aria-label",t.caption||"操作");let c=document.createElement("span");d.append(c),d.insertAdjacentHTML("beforeend",'<svg width="10" height="6" viewBox="0 0 10 6" aria-hidden="true"><path d="M1 1l4 4 4-4" fill="none" stroke="#64748b" stroke-width="1.4" stroke-linecap="round"/></svg>');let u=document.createElement("div");u.className="g6-canvas-menu",u.setAttribute("role","listbox"),u.hidden=!0;let p=()=>{let e=l.find(e=>e.value===s);c.textContent=n?t.caption||"操作":e?.label||t.caption||"";let a=o(c.textContent||""),i=n?a:Math.max(a,...l.map(e=>o(e.label)));d.style.minWidth=`${Math.min(i,168)+28}px`},m=()=>{for(let e of(u.replaceChildren(),l)){let a=document.createElement("button");a.type="button",a.dataset.value=e.value,a.textContent=e.label,a.setAttribute("role","option"),a.setAttribute("aria-selected",n||e.value!==s?"false":"true"),a.disabled=!0===e.disabled,a.addEventListener("click",()=>{a.disabled||(n||(s=e.value),t.onSelect(e.value),p(),b())}),u.append(a)}},b=()=>{u.hidden=!0,d.setAttribute("aria-expanded","false"),a?.menu===u&&(a=null)};d.addEventListener("click",()=>{if("true"===d.getAttribute("aria-expanded"))b();else{let e,t,n,i;a&&a.menu!==u&&a.close(),m(),document.body.append(u),e=d.getBoundingClientRect(),u.hidden=!1,u.style.visibility="hidden",t=u.getBoundingClientRect(),(n=e.bottom+6)+t.height>window.innerHeight-8&&(n=e.top-t.height-6),i=Math.max(8,Math.min(i=e.right-t.width,window.innerWidth-t.width-8)),n=Math.max(8,n),u.style.top=`${n}px`,u.style.left=`${i}px`,u.style.visibility="",d.setAttribute("aria-expanded","true"),a={close:b,trigger:d,menu:u}}});let h=new MutationObserver(()=>{d.isConnected||(b(),u.remove(),h.disconnect())});h.observe(e,{childList:!0,subtree:!0}),p();let v=document.createElement("div");if(v.style.cssText="display:inline-flex;flex:none;align-items:center;gap:4px;color:#64748b;font:500 12px/1 system-ui,sans-serif;",!n&&t.caption){let e=document.createElement("span");e.textContent=t.caption,v.append(e)}return v.append(d),r(e).append(v),{trigger:d,setItems(e){l=[...e],p(),u.hidden||m()},setValue(e){s=e,p()}}}function d(e,t,a,n,i){return s(e,{caption:t,items:a.map(e=>({value:e,label:e})),value:n,onSelect:i})}function c(e,t,a="操作"){if(!t.length)return null;let n=()=>t.map((e,t)=>{let a=e.dataset.action??e.dataset.layout??e.dataset.placement??String(t);return e.dataset.canvasControl=a,{value:a,label:(e.textContent||a).trim(),disabled:e.disabled}}),i=s(e,{caption:a,action:!0,items:n(),value:"",onSelect(e){let a=t.find(t=>t.dataset.canvasControl===e);a&&!a.disabled&&(a.click(),i.setItems(n()))}});return i}"u">typeof document&&(document.addEventListener("pointerdown",e=>{if(!a)return;let t=e.target;!(t instanceof Node)||a.trigger.contains(t)||a.menu.contains(t)||l()}),document.addEventListener("keydown",e=>{"Escape"===e.key&&l()})),e.s(["buttonStyle",0,"padding:5px 9px;border:1px solid #cbd5e1;border-radius:6px;background:#fff;color:#334155;cursor:pointer;","createDemoPanel",0,function(e,t,a,n){let i="string"==typeof e?document.querySelector(e):e;i.style.position="relative";let o=document.createElement("div"),r=document.createElement("div");r.dataset.role="controls",r.hidden=!0,r.innerHTML=n,o.append(r),function(e,t){if(!t.length)return;let a=t.every(e=>e.dataset.layout)?"layout":t.every(e=>e.dataset.placement)?"placement":null;if(!a)return c(e,t,"操作");let n=t.map(e=>(e.textContent||"").trim());d(e,"layout"===a?"布局":"位置",n,n[0]??"",e=>{t.find(t=>(t.textContent||"").trim()===e)?.click()})}(i,[...r.querySelectorAll("button")]);let l=i.querySelector(":scope > [data-canvas-controls]");l&&o.append(l);let s=document.createElement("div");return s.dataset.role="status",s.dataset.captureIgnore="",s.style.cssText="position:absolute;left:12px;bottom:10px;z-index:20;max-width:min(28rem,calc(100% - 24px));color:#64748b;font:12px/1.45 system-ui,sans-serif;pointer-events:none;white-space:pre-wrap;",s.textContent=a,o.append(r,s),i.append(o),{panel:o,controls:r,setStatus(e){s.textContent=e}}},"mountActionSelect",0,c,"mountCanvasControl",0,function(e,t){r(e).append(t)},"mountCanvasMenu",0,s,"mountChoiceSelect",0,d,"mountGroupedChoices",0,function(e,t){i();let n=t.map(e=>({...e,value:e.selected})),l=document.createElement("button");l.type="button",l.className="g6-canvas-menu-trigger",l.setAttribute("aria-haspopup","listbox"),l.setAttribute("aria-expanded","false"),l.setAttribute("aria-label","画布");let s=document.createElement("span");l.append(s),l.insertAdjacentHTML("beforeend",'<svg width="10" height="6" viewBox="0 0 10 6" aria-hidden="true"><path d="M1 1l4 4 4-4" fill="none" stroke="#64748b" stroke-width="1.4" stroke-linecap="round"/></svg>');let d=document.createElement("div");d.className="g6-canvas-menu",d.setAttribute("role","listbox"),d.hidden=!0;let c=()=>n.map(e=>e.value).join(" · "),u=()=>{s.textContent=c(),l.style.minWidth=`${o(c())+28}px`},p=()=>{d.hidden=!0,l.setAttribute("aria-expanded","false"),a?.menu===d&&(a=null)};l.addEventListener("click",()=>{let e,t,i,o;if("true"===l.getAttribute("aria-expanded"))return void p();for(let e of(a&&a.menu!==d&&a.close(),d.replaceChildren(),n)){let t=document.createElement("div");for(let a of(t.className="g6-canvas-menu-label",t.textContent=e.label,d.append(t),e.values)){let t=document.createElement("button");t.type="button",t.textContent=a,t.setAttribute("role","option"),t.setAttribute("aria-selected",a===e.value?"true":"false"),t.addEventListener("click",()=>{e.value=a,e.onChange(a),u(),p()}),d.append(t)}}document.body.append(d),e=l.getBoundingClientRect(),d.hidden=!1,d.style.visibility="hidden",t=d.getBoundingClientRect(),(i=e.bottom+6)+t.height>window.innerHeight-8&&(i=Math.max(8,e.top-t.height-6)),o=Math.max(8,Math.min(o=e.right-t.width,window.innerWidth-t.width-8)),d.style.top=`${i}px`,d.style.left=`${o}px`,d.style.visibility="",l.setAttribute("aria-expanded","true"),a={close:p,trigger:l,menu:d}});let m=new MutationObserver(()=>{l.isConnected||(p(),d.remove(),m.disconnect())});return m.observe(e,{childList:!0,subtree:!0}),u(),r(e).append(l),{trigger:l}}])},59927,e=>{"use strict";var t=e.i(51268),a=e.i(45128);let n={nodes:[{id:"server",data:{name:"API Server",type:"server"}},{id:"db",data:{name:"Database",type:"database"}},{id:"cache",data:{name:"Redis Cache",type:"cache"}},{id:"queue",data:{name:"Message Queue",type:"queue"}},{id:"worker",data:{name:"Worker",type:"worker"}},{id:"gateway",data:{name:"API Gateway",type:"gateway"}},{id:"client",data:{name:"Client App",type:"client"}},{id:"monitor",data:{name:"Monitor",type:"monitor"}}],edges:[{source:"client",target:"gateway",data:{label:"HTTPS"}},{source:"gateway",target:"server",data:{label:"gRPC"}},{source:"server",target:"db",data:{label:"SQL"}},{source:"server",target:"cache",data:{label:"TCP"}},{source:"server",target:"queue",data:{label:"AMQP"}},{source:"queue",target:"worker",data:{label:"consume"}},{source:"worker",target:"db",data:{label:"write"}},{source:"monitor",target:"server",data:{label:"metrics"}},{source:"monitor",target:"gateway",data:{label:"health"}}]};async function i(e){let i="string"==typeof e?document.querySelector(e):e;i.style.position="relative";let o=new t.Graph({autoFit:!0,container:i,data:n,layout:{type:"circular",radius:180},behaviors:["zoom-canvas","drag-canvas","drag-node"],node:{style:{size:20,fill:"#5B8FF9",label:e=>e.data?.name??e.id,labelPlacement:"bottom",labelFontSize:12,labelColor:"#333"}},edge:{style:{label:(e,t,a)=>a.data?.label??"",labelFontSize:10,labelColor:"#666",labelAutoRotate:!0}},theme:"light"});await o.render(),(0,a.mountCanvasMenu)(i,{caption:"标签",items:["bottom","center","top","right"].map(e=>({value:e,label:e})),value:"bottom",onSelect(e){o.updateOptions({node:{style:{labelPlacement:e}}})}});let r=!0;return(0,a.mountCanvasMenu)(i,{caption:"操作",action:!0,items:[{value:"edge-labels",label:"切换边标签"},{value:"circular",label:"circular"},{value:"force",label:"force"}],value:"",onSelect(e){if("edge-labels"===e){r=!r,o.updateOptions({edge:{style:{label:!!r&&((e,t,a)=>a.data?.label??"")}}});return}(async()=>{"circular"===e?o.setLayout({type:"circular",radius:180}):o.setLayout({type:"d3-force"}),await o.layout(),o.fitView()})()}}),{fitView:()=>o.fitView(),destroy(){o.destroy(),i.querySelector(":scope > [data-canvas-controls]")?.remove()}}}e.s(["run",0,i])},1117,e=>{e.v(t=>Promise.all(["static/chunks/3w5ghov2s-mh_.js"].map(t=>e.l(t))).then(()=>t(20344)))},59627,e=>{e.v(t=>Promise.all(["static/chunks/129g9sgvi8fvp.js"].map(t=>e.l(t))).then(()=>t(33922)))},71692,e=>{e.v(t=>Promise.all(["static/chunks/1b2-kozujq0ug.js","static/chunks/3c39acntf9t1j.js"].map(t=>e.l(t))).then(()=>t(86208)))},43030,e=>{e.v(t=>Promise.all(["static/chunks/2fw6s4tbmcygq.js"].map(t=>e.l(t))).then(()=>t(37396)))},5187,e=>{e.v(t=>Promise.all(["static/chunks/123no1qd2-632.js"].map(t=>e.l(t))).then(()=>t(54052)))},5728,e=>{e.v(t=>Promise.all(["static/chunks/3q_523q8o0ko2.js"].map(t=>e.l(t))).then(()=>t(81166)))},67675,e=>{e.v(t=>Promise.all(["static/chunks/3d83bd29fddh0.js"].map(t=>e.l(t))).then(()=>t(34201)))},20788,e=>{e.v(t=>Promise.all(["static/chunks/0mhcjlf6lxywq.js"].map(t=>e.l(t))).then(()=>t(46035)))},72968,e=>{e.v(t=>Promise.all(["static/chunks/1h4a07lpe01va.js","static/chunks/0f79yggc4pdiq.js"].map(t=>e.l(t))).then(()=>t(85600)))},97708,e=>{e.v(t=>Promise.all(["static/chunks/3cuzuudp5y610.js","static/chunks/3aqmcfax1l3ff.js"].map(t=>e.l(t))).then(()=>t(51473)))},52414,e=>{e.v(t=>Promise.all(["static/chunks/3z_e57obaca1y.js"].map(t=>e.l(t))).then(()=>t(27630)))}]);