# 自定义节点装饰 (/docs/guides/custom-decoration)





已有计数、图标或文本徽章先用 builtin-badge；需要自己的内容时注册 DecorationRenderer。它只画内容，引擎负责相对节点定位、堆叠和溢出。

## 测量、绘制与注册 [#测量绘制与注册]

measure 返回完整的有限正数宽高；本例用 DPR 换算固定 CSS 字号并缓存到 layout.data。draw 的原点已在装饰中心，显式设置字体、颜色和对齐。



```ts
const pill: DecorationRenderer = {
  measure({ ctx, data, dpr }) {
    const text = String(data ?? '');
    ctx.font = 12 * dpr + 'px sans-serif';
    return { width: ctx.measureText(text).width + 12 * dpr, height: 22 * dpr, data: { text, unit: dpr } };
  },
  draw({ ctx, layout }) {
    const value = layout.data as { text: string; unit: number } | undefined;
    if (!value) return;
    ctx.fillStyle = '#e6f4ff';
    ctx.fillRect(-layout.width / 2, -layout.height / 2, layout.width, layout.height);
    ctx.font = 12 * value.unit + 'px sans-serif';
    ctx.fillStyle = '#0958d9';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(value.text, 0, 0);
  },
};
register('decoration', 'docs-pill', pill);
```

**完整运行代码**

```ts
import { Graph, register, type DecorationRenderer } from '@antv/g6-lite';

// #region renderer
const pill: DecorationRenderer = {
  measure({ ctx, data, dpr }) {
    const text = String(data ?? '');
    ctx.font = 12 * dpr + 'px sans-serif';
    return { width: ctx.measureText(text).width + 12 * dpr, height: 22 * dpr, data: { text, unit: dpr } };
  },
  draw({ ctx, layout }) {
    const value = layout.data as { text: string; unit: number } | undefined;
    if (!value) return;
    ctx.fillStyle = '#e6f4ff';
    ctx.fillRect(-layout.width / 2, -layout.height / 2, layout.width, layout.height);
    ctx.font = 12 * value.unit + 'px sans-serif';
    ctx.fillStyle = '#0958d9';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(value.text, 0, 0);
  },
};
register('decoration', 'docs-pill', pill);
// #endregion renderer

export async function run(container: HTMLElement) {
  const graph = new Graph({
    container,
    data: {
      nodes: [{ id: 'A', x: 0, y: 0 }, { id: 'B', x: 260, y: 0 }],
      edges: [{ source: 'A', target: 'B' }],
    },
    node: {
      style: { size: 40, label: (node) => node.id, labelPlacement: 'center', labelColor: '#fff' },
      // #region placement
      decorations: [{
        renderer: 'docs-pill', placement: 'right', attachment: 'outside',
        layout: 'stack', sort: 'width-desc', itemGap: 4, maxVisible: 3,
        overflow: 'hover-expand', overflowData: (count: number) => '+' + count,
        items: (node) => node.id === 'A' ? ['CPU 42%', 'API', 'DB', 'Cache', 'Queue'] : ['Ready'],
        hideOnCollision: false,
      }],
      // #endregion placement
    },
    behaviors: ['zoom-canvas', 'drag-canvas'],
    autoFit: { padding: 96, maxZoom: 1 },
  });
  try { await graph.render(); return graph; }
  catch (error) { graph.destroy(); throw error; }
}
```



A 有五项，B 只有 Ready；A 默认显示两项及 +3 溢出项。悬停 A 的装饰区域展开全部，移开恢复。展开完整代码查看 items 与 placement 配置。

## 定位与堆叠 [#定位与堆叠]

1. renderer 名称与注册一致；单项传 data，stack 传 items。
2. placement 决定节点一侧，attachment 决定边界或外部附着。
3. layout: 'stack' 开启纵向排列；sort、maxVisible 与 overflow 控制可见项。maxVisible 包含溢出项，本例设为 3，显示两项加 +3。
4. overflowData 也交给同一个 renderer，确保它能处理溢出项输入。

不要在 renderer 中实现自己的节点位置、排序或溢出逻辑。偏移、跨轴比例、锚点和所有默认值查[装饰配置](/docs/api/options#config-node-decoration)。

## 碰撞与更新 [#碰撞与更新]

本例为方便比较显式关闭装饰碰撞隐藏；实际业务按密度选择。hideOnCollision: false 可能重叠，也不占用装饰碰撞网格。minZoom 控制装饰自己的阈值，不等同标签策略。

内容来自 items 回调时，通过公开数据方法更新业务字段；不要修改全局 renderer 的共享状态。装饰节点尺寸已经是屏幕尺寸，不再次缩放；本例内容选择固定 CSS 字号，所以只按 dpr 换算。完整单位查[DecorationRenderer](/docs/api/extensions#decorationrenderer)。

## 常见问题 [#常见问题]

### 为什么装饰消失而没有默认文字？ [#为什么装饰消失而没有默认文字]

未知 renderer、非法测量或异常会跳过装饰，不走 Label 的文字回退；检查诊断、minZoom、hidden 和碰撞。

### 为什么测量后没有 draw？ [#为什么测量后没有-draw]

碰撞、裁剪或溢出筛选可能跳过绘制。measure 应是纯计算，不能把调用次数当业务状态。

### 可以直接使用内置 Badge 吗？ [#可以直接使用内置-badge-吗]

可以，见[节点徽章案例](/docs/examples/decoration-badges)。不要为已有外观重复实现底层内容。

**相关可运行示例**

* [节点徽章](/docs/examples/decoration-badges)
