(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,16650,e=>{"use strict";var t=e.i(51268);let a={client:"#7D9FD3",service:"#70A991",data:"#C89C5D",observability:"#9299A8"};async function o(e){let o="string"==typeof e?document.querySelector(e):e;o.style.position="relative";let l=new t.Graph({container:o,data:{nodes:[{id:"web",name:"Web 端",x:100,y:150,comboId:"client-apps",data:{layer:"client"}},{id:"mobile",name:"移动端",x:100,y:255,comboId:"client-apps",data:{layer:"client"}},{id:"console",name:"运营控制台",x:100,y:360,comboId:"client-apps",data:{layer:"client"}},{id:"gateway",name:"API 网关",x:335,y:255,comboId:"service-layer",data:{layer:"service"}},{id:"auth",name:"认证服务",x:500,y:150,comboId:"service-layer",data:{layer:"service"}},{id:"order",name:"订单服务",x:500,y:255,comboId:"service-layer",data:{layer:"service"}},{id:"worker",name:"异步任务",x:500,y:360,comboId:"service-layer",data:{layer:"service"}},{id:"cache",name:"Redis 缓存",x:720,y:150,comboId:"data-layer",data:{layer:"data"}},{id:"mysql",name:"MySQL",x:720,y:255,comboId:"data-layer",data:{layer:"data"}},{id:"mq",name:"消息队列",x:720,y:360,comboId:"data-layer",data:{layer:"data"}}],edges:[{source:"web",target:"gateway"},{source:"mobile",target:"gateway"},{source:"console",target:"gateway"},{source:"gateway",target:"auth"},{source:"gateway",target:"order"},{source:"gateway",target:"worker"},{source:"auth",target:"cache"},{source:"order",target:"mysql"},{source:"worker",target:"mq"}],combos:[{id:"client-apps",data:{name:"客户端"},style:{fill:"rgba(104, 145, 205, 0.08)",stroke:"rgba(104, 145, 205, 0.42)",padding:38}},{id:"business-platform",data:{name:"业务平台"},style:{fill:"rgba(112, 132, 160, 0.045)",stroke:"rgba(112, 132, 160, 0.28)",padding:24,labelFontSize:13}},{id:"service-layer",parentId:"business-platform",data:{name:"服务层"},style:{fill:"rgba(91, 158, 130, 0.08)",stroke:"rgba(91, 158, 130, 0.4)",padding:38}},{id:"data-layer",parentId:"business-platform",data:{name:"数据层"},style:{fill:"rgba(205, 155, 82, 0.09)",stroke:"rgba(205, 155, 82, 0.42)",padding:38}}]},node:{type:"circle",style:{size:18,fill:e=>a[String(e.data?.layer)]??"#9CA3AF",stroke:"#FFFFFF",strokeWidth:2,label:e=>e.name??e.data?.label??e.id,labelPlacement:"bottom",labelOffsetY:4,labelFontSize:11,labelColor:"#475569"},stateStyles:{selected:{stroke:"#3B82F6",strokeWidth:3}}},edge:{type:"cubic",style:{stroke:"rgba(115, 137, 166, 0.58)",lineWidth:1.2,endArrow:!1}},combo:{style:{borderRadius:12,label:e=>e.data?.name??e.id,labelPlacement:"inside",labelFontSize:12,labelColor:"#526071",collapsedType:"rect",collapsedSize:[72,38],count:!1,stateStyles:{selected:{stroke:"#3B82F6",strokeWidth:2},active:{stroke:"#60A5FA",strokeWidth:2}}}},behaviors:["zoom-canvas","drag-canvas","drag-node","click-select"]});await l.render(),l.fitView(.82);let r=document.createElement("style");r.textContent=`
    .combo-demo-toolbar {
      position: absolute;
      top: 12px;
      left: 12px;
      right: 12px;
      z-index: 10;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 6px;
      width: fit-content;
      max-width: calc(100% - 24px);
      padding: 7px;
      border: 1px solid rgba(148, 163, 184, 0.26);
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.94);
      box-shadow: 0 4px 16px rgba(15, 23, 42, 0.08);
      color: #475569;
      font: 12px/1.4 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      backdrop-filter: blur(6px);
    }
    .combo-demo-toolbar button {
      height: 26px;
      padding: 0 9px;
      border: 1px solid #dbe3ee;
      border-radius: 6px;
      background: #fff;
      color: #475569;
      font: inherit;
      cursor: pointer;
      transition: border-color 0.15s ease, background 0.15s ease, color 0.15s ease;
    }
    .combo-demo-toolbar button:hover {
      border-color: #8fb3e8;
      background: #f4f8fd;
      color: #315f9e;
    }
    .combo-demo-toolbar button:focus-visible {
      outline: 2px solid rgba(59, 130, 246, 0.36);
      outline-offset: 1px;
    }
    .combo-demo-toolbar button:disabled {
      cursor: default;
      opacity: 0.55;
    }
    .combo-demo-toolbar__status {
      min-width: 72px;
      color: #7c8798;
      font-size: 11px;
      white-space: nowrap;
    }
  `,o.appendChild(r);let s=document.createElement("div");s.className="combo-demo-toolbar",s.setAttribute("data-capture-ignore",""),s.setAttribute("aria-label","Combo 示例工具条"),s.innerHTML=`
    <button type="button" data-action="collapse-all">全部折叠</button>
    <button type="button" data-action="expand-all">全部展开</button>
    <button type="button" data-action="toggle-data">切换数据层</button>
    <button type="button" data-action="move-console">控制台加入服务层</button>
    <button type="button" data-action="create-runtime">创建可观测分组</button>
    <button type="button" data-action="export">导出数据</button>
    <output class="combo-demo-toolbar__status" aria-live="polite">固定坐标 \xb7 可拖拽</output>
  `,o.appendChild(s);let i=s.querySelector(".combo-demo-toolbar__status"),n=s.querySelector('[data-action="move-console"]'),c=s.querySelector('[data-action="create-runtime"]'),d=!1,b=!1,m=e=>{i.textContent=e};return s.querySelector('[data-action="collapse-all"]').addEventListener("click",()=>{l.collapseCombo("client-apps"),l.collapseCombo("business-platform"),b&&l.collapseCombo("observability"),m("已折叠顶层分组")}),s.querySelector('[data-action="expand-all"]').addEventListener("click",()=>{l.expandCombo("business-platform"),l.expandCombo("client-apps"),l.expandCombo("service-layer"),l.expandCombo("data-layer"),b&&l.expandCombo("observability"),m("已展开全部分组")}),s.querySelector('[data-action="toggle-data"]').addEventListener("click",()=>{l.expandCombo("business-platform"),l.toggleCombo("data-layer"),m(l.getComboData("data-layer")?.collapsed?"数据层已折叠":"数据层已展开")}),n.addEventListener("click",()=>{l.expandCombo("business-platform"),l.expandCombo("service-layer"),d?(l.addToCombo("console","client-apps"),n.textContent="控制台加入服务层",m("运营控制台已回到客户端")):(l.addToCombo("console","service-layer"),n.textContent="控制台回到客户端",m("运营控制台已加入服务层")),d=!d}),c.addEventListener("click",()=>{b||(l.addNodes([{id:"logs",x:570,y:455,data:{layer:"observability",label:"日志采集"}},{id:"metrics",x:720,y:455,data:{layer:"observability",label:"指标监控"}}]),l.createCombo({id:"observability",data:{name:"可观测性",source:"createCombo"},style:{fill:"rgba(134, 126, 176, 0.08)",stroke:"rgba(134, 126, 176, 0.42)",padding:32,label:"可观测性",labelPlacement:"inside",labelColor:"#645F83",collapsedType:"rect",collapsedSize:[84,38],count:!1}},["logs","metrics"]),b=!0,c.disabled=!0,c.textContent="已创建可观测分组",l.fitView(.78),m("createCombo() 已执行"))}),s.querySelector('[data-action="export"]').addEventListener("click",()=>{let e=l.getData(),t=new Blob([JSON.stringify(e,null,2)],{type:"application/json"}),a=URL.createObjectURL(t),o=document.createElement("a");o.href=a,o.download="g6lite-combo-data.json",o.click(),URL.revokeObjectURL(a),m(`${e.nodes.length} 节点 \xb7 ${e.combos?.length??0} 分组`)}),{fitView:()=>l.fitView({padding:64,maxZoom:1.5}),destroy(){l.destroy(),s.remove(),r.remove()}}}e.s(["run",0,o])},1117,e=>{e.v(t=>Promise.all(["static/chunks/3w5ghov2s-mh_.js"].map(t=>e.l(t))).then(()=>t(20344)))},59627,e=>{e.v(t=>Promise.all(["static/chunks/129g9sgvi8fvp.js"].map(t=>e.l(t))).then(()=>t(33922)))},71692,e=>{e.v(t=>Promise.all(["static/chunks/1b2-kozujq0ug.js","static/chunks/3c39acntf9t1j.js"].map(t=>e.l(t))).then(()=>t(86208)))},43030,e=>{e.v(t=>Promise.all(["static/chunks/2fw6s4tbmcygq.js"].map(t=>e.l(t))).then(()=>t(37396)))},5187,e=>{e.v(t=>Promise.all(["static/chunks/123no1qd2-632.js"].map(t=>e.l(t))).then(()=>t(54052)))},5728,e=>{e.v(t=>Promise.all(["static/chunks/3q_523q8o0ko2.js"].map(t=>e.l(t))).then(()=>t(81166)))},67675,e=>{e.v(t=>Promise.all(["static/chunks/3d83bd29fddh0.js"].map(t=>e.l(t))).then(()=>t(34201)))},20788,e=>{e.v(t=>Promise.all(["static/chunks/0mhcjlf6lxywq.js"].map(t=>e.l(t))).then(()=>t(46035)))},72968,e=>{e.v(t=>Promise.all(["static/chunks/1h4a07lpe01va.js","static/chunks/0f79yggc4pdiq.js"].map(t=>e.l(t))).then(()=>t(85600)))},97708,e=>{e.v(t=>Promise.all(["static/chunks/3cuzuudp5y610.js","static/chunks/3aqmcfax1l3ff.js"].map(t=>e.l(t))).then(()=>t(51473)))},52414,e=>{e.v(t=>Promise.all(["static/chunks/3z_e57obaca1y.js"].map(t=>e.l(t))).then(()=>t(27630)))}]);