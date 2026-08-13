import{G as g}from"./graph-VhlF5mx_.js";import"./preload-helper-lMf9uHy8.js";const x={client:"#7D9FD3",service:"#70A991",data:"#C89C5D",observability:"#9299A8"};async function C(s){const l=typeof s=="string"?document.querySelector(s):s;l.style.position="relative";const e=new g({autoFitOnResize:!0,container:l,data:{nodes:[{id:"web",name:"Web 端",x:100,y:150,comboId:"client-apps",data:{layer:"client"}},{id:"mobile",name:"移动端",x:100,y:255,comboId:"client-apps",data:{layer:"client"}},{id:"console",name:"运营控制台",x:100,y:360,comboId:"client-apps",data:{layer:"client"}},{id:"gateway",name:"API 网关",x:335,y:255,comboId:"service-layer",data:{layer:"service"}},{id:"auth",name:"认证服务",x:500,y:150,comboId:"service-layer",data:{layer:"service"}},{id:"order",name:"订单服务",x:500,y:255,comboId:"service-layer",data:{layer:"service"}},{id:"worker",name:"异步任务",x:500,y:360,comboId:"service-layer",data:{layer:"service"}},{id:"cache",name:"Redis 缓存",x:720,y:150,comboId:"data-layer",data:{layer:"data"}},{id:"mysql",name:"MySQL",x:720,y:255,comboId:"data-layer",data:{layer:"data"}},{id:"mq",name:"消息队列",x:720,y:360,comboId:"data-layer",data:{layer:"data"}}],edges:[{source:"web",target:"gateway"},{source:"mobile",target:"gateway"},{source:"console",target:"gateway"},{source:"gateway",target:"auth"},{source:"gateway",target:"order"},{source:"gateway",target:"worker"},{source:"auth",target:"cache"},{source:"order",target:"mysql"},{source:"worker",target:"mq"}],combos:[{id:"client-apps",data:{name:"客户端"},style:{fill:"rgba(104, 145, 205, 0.08)",stroke:"rgba(104, 145, 205, 0.42)",padding:38}},{id:"business-platform",data:{name:"业务平台"},style:{fill:"rgba(112, 132, 160, 0.045)",stroke:"rgba(112, 132, 160, 0.28)",padding:24,labelFontSize:13}},{id:"service-layer",parentId:"business-platform",data:{name:"服务层"},style:{fill:"rgba(91, 158, 130, 0.08)",stroke:"rgba(91, 158, 130, 0.4)",padding:38}},{id:"data-layer",parentId:"business-platform",data:{name:"数据层"},style:{fill:"rgba(205, 155, 82, 0.09)",stroke:"rgba(205, 155, 82, 0.42)",padding:38}}]},node:{type:"circle",style:{size:18,fill:t=>{var o;return x[String((o=t.data)==null?void 0:o.layer)]??"#9CA3AF"},stroke:"#FFFFFF",strokeWidth:2,label:t=>{var o;return t.name??((o=t.data)==null?void 0:o.label)??t.id},labelPlacement:"bottom",labelOffsetY:4,labelFontSize:11,labelColor:"#475569"},stateStyles:{selected:{stroke:"#3B82F6",strokeWidth:3}}},edge:{type:"cubic",style:{stroke:"rgba(115, 137, 166, 0.58)",lineWidth:1.2,endArrow:!1}},combo:{style:{borderRadius:12,label:t=>{var o;return((o=t.data)==null?void 0:o.name)??t.id},labelPlacement:"inside",labelFontSize:12,labelColor:"#526071",collapsedType:"rect",collapsedSize:[72,38],count:!1,stateStyles:{selected:{stroke:"#3B82F6",strokeWidth:2},active:{stroke:"#60A5FA",strokeWidth:2}}}},behaviors:["zoom-canvas","drag-canvas","drag-node","click-select"]});await e.render(),e.fitView(.82);const i=document.createElement("style");i.textContent=`
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
  `,l.appendChild(i);const a=document.createElement("div");a.className="combo-demo-toolbar",a.setAttribute("data-capture-ignore",""),a.setAttribute("aria-label","Combo 示例工具条"),a.innerHTML=`
    <button type="button" data-action="collapse-all">全部折叠</button>
    <button type="button" data-action="expand-all">全部展开</button>
    <button type="button" data-action="toggle-data">切换数据层</button>
    <button type="button" data-action="move-console">控制台加入服务层</button>
    <button type="button" data-action="create-runtime">创建可观测分组</button>
    <button type="button" data-action="export">导出数据</button>
    <output class="combo-demo-toolbar__status" aria-live="polite">固定坐标 · 可拖拽</output>
  `,l.appendChild(a);const y=a.querySelector(".combo-demo-toolbar__status"),d=a.querySelector('[data-action="move-console"]'),c=a.querySelector('[data-action="create-runtime"]');let b=!1,n=!1;const r=t=>{y.textContent=t};return a.querySelector('[data-action="collapse-all"]').addEventListener("click",()=>{e.collapseCombo("client-apps"),e.collapseCombo("business-platform"),n&&e.collapseCombo("observability"),r("已折叠顶层分组")}),a.querySelector('[data-action="expand-all"]').addEventListener("click",()=>{e.expandCombo("business-platform"),e.expandCombo("client-apps"),e.expandCombo("service-layer"),e.expandCombo("data-layer"),n&&e.expandCombo("observability"),r("已展开全部分组")}),a.querySelector('[data-action="toggle-data"]').addEventListener("click",()=>{var o;e.expandCombo("business-platform"),e.toggleCombo("data-layer");const t=(o=e.getComboData("data-layer"))==null?void 0:o.collapsed;r(t?"数据层已折叠":"数据层已展开")}),d.addEventListener("click",()=>{e.expandCombo("business-platform"),e.expandCombo("service-layer"),b?(e.addToCombo("console","client-apps"),d.textContent="控制台加入服务层",r("运营控制台已回到客户端")):(e.addToCombo("console","service-layer"),d.textContent="控制台回到客户端",r("运营控制台已加入服务层")),b=!b}),c.addEventListener("click",()=>{n||(e.addNodes([{id:"logs",x:570,y:455,data:{layer:"observability",label:"日志采集"}},{id:"metrics",x:720,y:455,data:{layer:"observability",label:"指标监控"}}]),e.createCombo({id:"observability",data:{name:"可观测性",source:"createCombo"},style:{fill:"rgba(134, 126, 176, 0.08)",stroke:"rgba(134, 126, 176, 0.42)",padding:32,label:"可观测性",labelPlacement:"inside",labelColor:"#645F83",collapsedType:"rect",collapsedSize:[84,38],count:!1}},["logs","metrics"]),n=!0,c.disabled=!0,c.textContent="已创建可观测分组",e.fitView(.78),r("createCombo() 已执行"))}),a.querySelector('[data-action="export"]').addEventListener("click",()=>{var u;const t=e.getData(),o=new Blob([JSON.stringify(t,null,2)],{type:"application/json"}),m=URL.createObjectURL(o),p=document.createElement("a");p.href=m,p.download="g6lite-combo-data.json",p.click(),URL.revokeObjectURL(m),r(`${t.nodes.length} 节点 · ${((u=t.combos)==null?void 0:u.length)??0} 分组`)}),{fitView:()=>e.fitView({padding:64,maxZoom:1.5}),destroy(){e.destroy(),a.remove(),i.remove()}}}export{C as run};
